import {useExtend} from '@pixi/react';
import {Sprite, Spritesheet} from 'pixi.js';
import {useQuery} from 'koota/react';
import {Entity} from 'koota';
import {Player} from '../state/traits';
import {useInstance} from '../hooks/useInstance';
import {useMemo} from 'react';
import {useAssets} from '../hooks/useAssets';

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

function PlayerEntity({entity}: {entity: Entity}) {
  useExtend({Sprite});

  const label = useMemo(() => `player-${entity.get(Player)?.id ?? entity}`, [entity]);
  const ref = useInstance<Sprite>(entity);

  const {data} = useAssets<Spritesheet>(['core/sprites']);
  const sprites = data?.sprites;

  return <pixiSprite label={label} ref={ref} texture={sprites?.textures['player-red-1.png']} />;
}
