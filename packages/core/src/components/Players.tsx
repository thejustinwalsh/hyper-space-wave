import {useExtend} from '@pixi/react';
import {Sprite, Spritesheet} from 'pixi.js';
import {useActions, useQuery} from 'koota/react';
import {Entity} from 'koota';
import {Extent, Player, Position} from '../state/traits';
import {useInstance} from '../hooks/useInstance';
import {useMemo} from 'react';
import {actions} from '../state/actions';
import {useAssets} from '../hooks/useAssets';

export function Players() {
  const entities = useQuery(Player);
  return (
    <>
      {entities
        .filter(e => e.isAlive())
        .map(entity => (
          <PlayerEntity key={entity} entity={entity} />
        ))}
    </>
  );
}

function PlayerEntity({entity}: {entity: Entity}) {
  useExtend({Sprite});

  const label = useMemo(() => `player-${entity.get(Player)?.id ?? entity}`, [entity]);
  const ref = useInstance<Sprite>(entity);

  const {data} = useAssets<Spritesheet>(['core/sprites']);
  const sprites = data?.sprites;

  const {spawnLoot} = useActions(actions);

  return (
    <pixiSprite
      eventMode="static"
      label={label}
      ref={ref}
      texture={sprites?.textures['player-red-1.png']}
      onPointerTap={() => {
        const pos = entity.get(Position)!;
        const bounds = entity.get(Extent)!;
        spawnLoot({x: pos.x + bounds.x - bounds.width / 2, y: pos.y});
      }}
    />
  );
}
