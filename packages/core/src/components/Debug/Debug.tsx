import {useQuery, useWorld} from 'koota/react';
import {
  Collision,
  Enemy,
  Extent,
  Instance,
  Loot,
  Player,
  Position,
  WorldTraits,
} from '../../state/traits';
import {Container, Graphics, Sprite, Texture} from 'pixi.js';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useApplication, useExtend, useTick} from '@pixi/react';
import {assert} from '../../util/assert';
import {SpatialHash} from '../../util/spatial-hash';
import {ConfigurableTrait} from 'koota';
import {Entity} from 'koota';
import {useControls} from 'leva';

// Collision visualization constants
const COLLISION_DURATION = 1000; // 1 second total lifetime
const FADE_START = 800; // Start fading at 800ms
const DEFAULT_ALPHA = 0.25; // Base alpha value for collision visualization

export default function Debug() {
  const {app} = useApplication();
  useEffect(() => {
    globalThis.__PIXI_APP__ = app;
  }, [app]);

  const {grid, extents} = useControls('Collision', {
    grid: {value: false},
    extents: {value: false},
  });

  return (
    <>
      <EntityStats />
      {grid && <CollisionGrid />}
      {extents && <CollisionExtents />}
    </>
  );
}

function CollisionGrid() {
  useExtend({Container, Graphics, Sprite});

  const world = useWorld();
  const grid = world.get(WorldTraits.CollisionGrid);

  const draw = useCallback(
    (g: Graphics) => {
      const {cellSize, width, height, x, y} = grid?.value.getConfig() ?? {
        cellSize: 0,
        width: 0,
        height: 0,
        x: 0,
        y: 0,
      };

      g.clear();
      g.setFillStyle({color: 0x000000, alpha: 0});
      g.setStrokeStyle({width: 1, color: 0xcccccc, alpha: 0.5});

      // Draw vertical grid lines
      const cols = Math.ceil(width / cellSize);
      for (let i = 1; i <= cols; i++) {
        g.moveTo(x + i * cellSize, y).lineTo(x + i * cellSize, y + height);
      }

      // Draw horizontal grid lines
      const rows = Math.ceil(height / cellSize);
      for (let i = 1; i <= rows; i++) {
        g.moveTo(x, y + i * cellSize).lineTo(x + width, y + i * cellSize);
      }

      // Draw the grid
      g.stroke({width: 2, color: 0xcccccc, alpha: 0.5, pixelLine: true});
    },
    [grid],
  );

  if (!grid) return null;

  return (
    <pixiContainer label="collision-grid">
      <pixiGraphics draw={draw} />
      <Collisions grid={grid.value} />
    </pixiContainer>
  );
}

type CollisionRef = {
  sprite: Sprite | Graphics;
  timestamp: number;
};

function Collisions({grid}: {grid: SpatialHash}) {
  const [_, setGridStats] = useControls('Grid Stats', () => {
    return {
      collisions: {
        value: '',
        label: 'collisions',
        editable: false,
      },
      player: {
        value: '',
        label: <span style={{color: `${groupColor(Player, true)}`}}>player</span>,
        editable: false,
      },
      loot: {
        value: '',
        label: <span style={{color: `${groupColor(Loot, true)}`}}>loot</span>,
        editable: false,
      },
      enemy: {
        value: '',
        label: <span style={{color: `${groupColor(Enemy, true)}`}}>enemy</span>,
        editable: false,
      },
    };
  });

  const collisionRefs = useRef<Map<string, CollisionRef>>(new Map());

  const [collisionState, setCollisionState] = useState<
    Map<
      Entity,
      {
        timestamp: number;
        group: ConfigurableTrait;
        boundingBox: {
          x: number;
          y: number;
          width: number;
          height: number;
        };
        others: {
          cell: number;
          entity: Entity;
          group: ConfigurableTrait;
          x: number;
          y: number;
          size: number;
          timestamp: number;
        }[];
      }
    >
  >(new Map());

  // Update sprite alphas on each frame
  useTick(() => {
    const now = Date.now();
    const refs = collisionRefs.current;

    // Update alphas and remove expired refs
    for (const [key, ref] of refs) {
      const age = now - ref.timestamp;
      const alpha =
        age < FADE_START
          ? DEFAULT_ALPHA
          : DEFAULT_ALPHA * (1 - (age - FADE_START) / (COLLISION_DURATION - FADE_START));
      ref.sprite.alpha = alpha;

      if (age > COLLISION_DURATION) {
        ref.sprite.alpha = 0;
        refs.delete(key);
      }
    }
  });

  const collisionQuery = useQuery(Collision);

  const collisions = useMemo(() => {
    const {cellSize, x, y} = grid.getConfig();
    return collisionQuery.map(entity => {
      const collision = assert(entity.get(Collision));
      const position = entity.get(Position);
      const extent = entity.get(Extent);

      const cells = position && extent ? grid.getCellsForBounds(position, extent) : [];
      const bounds = cells.reduce(
        (acc, cell) => {
          const [x, y] = grid.getCellCoords(cell);
          return {
            minX: Math.min(acc.minX, x),
            minY: Math.min(acc.minY, y),
            maxX: Math.max(acc.maxX, x),
            maxY: Math.max(acc.maxY, y),
          };
        },
        {
          minX: Infinity,
          minY: Infinity,
          maxX: -Infinity,
          maxY: -Infinity,
        },
      );

      const boundingBox = {
        x: bounds.minX * cellSize + x,
        y: bounds.minY * cellSize + y,
        width: (bounds.maxX - bounds.minX + 1) * cellSize,
        height: (bounds.maxY - bounds.minY + 1) * cellSize,
      };

      return {
        entity,
        group: collision.group,
        boundingBox,
        others: collision.others.map(other => {
          const [cellX, cellY] = grid.getCellCoords(other.cell);
          return {
            cell: other.cell,
            entity: other.entity,
            group: other.group,
            x: cellX * cellSize + x,
            y: cellY * cellSize + y,
            size: cellSize,
          };
        }),
      };
    });
  }, [collisionQuery, grid]);

  useEffect(() => {
    const now = Date.now();

    setGridStats({
      collisions: collisions.reduce((acc, c) => acc + c.others.length, 0).toString(),
      ...Object.fromEntries(
        Object.entries(
          collisions.reduce(
            (acc, c) => {
              acc[groupName(c.group)] = (acc[groupName(c.group)] ?? 0) + 1;
              c.others.forEach(o => {
                acc[groupName(o.group)] = (acc[groupName(o.group)] ?? 0) + 1;
              });
              return acc;
            },
            {player: 0, enemy: 0, loot: 0} as Record<string, number>,
          ),
        ).map(([key, value]) => [key, value.toString()]),
      ),
    });

    setCollisionState(previous => {
      const newMap = new Map(previous);

      // Remove expired collisions
      for (const [entity, data] of newMap) {
        data.others = data.others.filter(other => now - other.timestamp < COLLISION_DURATION);
        if (data.others.length === 0) {
          newMap.delete(entity);
        }
      }

      // Add new collisions
      collisions.forEach(c => {
        const existing = newMap.get(c.entity);
        if (existing) {
          const seen = new Set(existing.others.map(o => `${o.entity.id}-${o.cell}`));
          const newOthers = c.others
            .filter(o => !seen.has(`${o.entity.id}-${o.cell}`))
            .map(o => ({...o, timestamp: now}));

          existing.others.push(...newOthers);
        } else {
          newMap.set(c.entity, {
            ...c,
            timestamp: now,
            others: c.others.map(o => ({...o, timestamp: now})),
          });
        }
      });

      return newMap;
    });
  }, [collisions, setGridStats]);

  const entries = Array.from(collisionState.entries());

  return (
    <pixiContainer>
      {entries.map(([entity, {timestamp, group, boundingBox, others}]) => {
        const key = `${entity}-${boundingBox.x}-${boundingBox.y}`;
        return (
          <pixiContainer key={key}>
            <pixiSprite
              width={boundingBox.width}
              height={boundingBox.height}
              texture={Texture.WHITE}
              x={boundingBox.x}
              y={boundingBox.y}
              tint={groupColor(group)}
              alpha={0.25}
              ref={updateRefs(collisionRefs, key, timestamp)}
            />
            {others.map(other => {
              const key = `${entity}-${other.entity}-${other.cell}`;
              return (
                <pixiSprite
                  key={key}
                  width={other.size}
                  height={other.size}
                  texture={Texture.WHITE}
                  x={other.x}
                  y={other.y}
                  tint={groupColor(other.group)}
                  alpha={0.25}
                  ref={updateRefs(collisionRefs, key, other.timestamp)}
                />
              );
            })}
          </pixiContainer>
        );
      })}
    </pixiContainer>
  );
}

function CollisionExtents() {
  useExtend({Container, Graphics, Sprite});

  const collisionRefs = useRef<Map<number, Sprite>>(new Map());
  const collisionQuery = useQuery(Position, Extent);
  useTick(() => {
    collisionQuery
      .filter(entity => entity.isAlive())
      .forEach(entity => {
        const ref = collisionRefs.current.get(entity);
        const position = assert(entity.get(Position));
        const extent = assert(entity.get(Extent));
        if (ref) {
          ref.x = position.x + extent.x;
          ref.y = position.y + extent.y;
          ref.width = extent.width;
          ref.height = extent.height;
        }
      });
  });

  const createDraw = useCallback((width: number, height: number) => {
    return (g: Graphics) => {
      g.clear();
      g.setStrokeStyle({width: 2, color: 0x000000, alpha: 1});
      g.rect(0, 0, width, height);
      g.stroke();
    };
  }, []);

  return (
    <pixiContainer label="collision-extents">
      {collisionQuery.map(entity => {
        const extent = assert(entity.get(Extent));
        const {x, y} = assert(entity.get(Position));
        return (
          <pixiGraphics
            draw={createDraw(extent.width, extent.height)}
            key={entity}
            x={x}
            y={y}
            ref={updateRefs(collisionRefs, entity)}
          />
        );
      })}
    </pixiContainer>
  );
}

function updateRefs(
  refs: React.RefObject<Map<React.Key, Sprite | Graphics | CollisionRef>>,
  key: React.Key,
  timestamp?: number,
) {
  return (sprite: Sprite | Graphics | null) => {
    if (sprite) {
      refs.current.set(key, timestamp ? {sprite, timestamp} : sprite);
    } else {
      refs.current.delete(key);
    }
  };
}

function EntityStats() {
  const entities = useQuery(Instance);

  const [_stats, setStats] = useControls('Entity Stats', () => {
    return {
      entities: {
        value: '',
        label: 'entities',
        editable: false,
      },
    };
  });

  useEffect(() => {
    setStats({
      entities: entities.length.toFixed(0),
    });
  }, [entities, setStats]);

  return null;
}

function groupColor(group: ConfigurableTrait, asString = false) {
  let color = 0xcccccc;
  if (group === Player) color = 0x0000ff;
  if (group === Enemy) color = 0xff0000;
  if (group === Loot) color = 0x00ff00;
  return asString ? `#${color.toString(16).padStart(6, '0')}` : color;
}

function groupName(group: ConfigurableTrait) {
  if (group === Player) return 'player';
  if (group === Enemy) return 'enemy';
  if (group === Loot) return 'loot';
  return 'unknown';
}
