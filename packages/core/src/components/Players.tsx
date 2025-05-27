import {useExtend} from '@pixi/react';
import {AnimatedSprite, Container, Sprite, Spritesheet, Texture} from 'pixi.js';
import {useQuery, useTraitEffect} from 'koota/react';
import {Entity} from 'koota';
import {Instance, Player, Velocity} from '../state/traits';
import {useInstance} from '../hooks/useInstance';
import {memo, useMemo} from 'react';
import {useAssets} from '../hooks/useAssets';
import {assert} from '../util/assert';

const FRAMES = {
  player: {
    red: ['player-red-1.png', 'player-red-2.png', 'player-red-3.png'],
    blue: ['player-blue-1.png', 'player-blue-2.png', 'player-blue-3.png'],
  },
  shadow: ['player-shadow-1.png', 'player-shadow-2.png', 'player-shadow-3.png'],
};

const ANIMATIONS = {
  player: {
    idle: 0,
    left: 1,
    right: 2,
  },
};

export function Players() {
  const entities = useQuery(Player);
  return (
    <>
      {entities.map(entity => (
        <PlayerEntity key={entity} entity={entity} />
      ))}
    </>
  );
}

const PlayerEntity = memo(({entity}: {entity: Entity}) => {
  useExtend({AnimatedSprite});

  const label = useMemo(() => `player-${assert(entity.get(Player)).id}`, [entity]);
  const color = useMemo(() => (assert(entity.get(Player)).id > 0 ? 'blue' : 'red'), [entity]);
  const {setRef} = useInstance<Sprite>(entity);

  const {data} = useAssets<Spritesheet>(['core/sprites']);
  const sheet = data?.sprites;

  const {player, shadow} = useMemo(
    () => ({
      player: FRAMES.player[color].map(f => ({
        texture: sheet?.textures[f] ?? Texture.EMPTY,
        time: 45,
      })),
      shadow: FRAMES.shadow.map(f => ({texture: sheet?.textures[f] ?? Texture.EMPTY, time: 45})),
    }),
    [color, sheet],
  );

  let animState = ANIMATIONS.player.idle;
  useTraitEffect(entity, Velocity, velocity => {
    const {ref} = assert(entity.get(Instance));
    const player = assert(ref?.getChildAt<AnimatedSprite>(0));
    const shadow = assert(ref?.getChildAt<Container>(1).getChildAt<AnimatedSprite>(0));

    const x = velocity?.x ?? 0;
    const anim =
      x < 0 ? ANIMATIONS.player.left : x > 0 ? ANIMATIONS.player.right : ANIMATIONS.player.idle;
    const flip = x > 0;

    if (anim !== animState) {
      animState = anim;
      if (animState === ANIMATIONS.player.idle) {
        player.gotoAndStop(0);
        shadow.gotoAndStop(0);
      } else {
        player.gotoAndPlay(0);
        player.scale.x = flip ? -1 : 1;
        shadow.gotoAndPlay(0);
        shadow.scale.x = flip ? -1 : 1;
      }
    }
  });

  const pivot = useMemo(
    () => ({
      x: -player?.[0].texture.width / 2,
      y: -player?.[0].texture.height / 2,
    }),
    [player],
  );

  return (
    <pixiContainer label={label} ref={setRef} pivot={pivot}>
      <pixiAnimatedSprite anchor={0.5} textures={player} loop={false} />
      <pixiContainer anchor={0.5} x={-10} y={10}>
        <pixiAnimatedSprite anchor={0.5} textures={shadow} loop={false} />
      </pixiContainer>
    </pixiContainer>
  );
});
PlayerEntity.displayName = 'PlayerEntity';
