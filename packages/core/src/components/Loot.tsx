import {useQuery} from 'koota/react';
import {Loot as LootTrait} from '../state/traits';
import {Entity} from 'koota';
import {Sprite, Spritesheet} from 'pixi.js';
import {useExtend} from '@pixi/react';
import {useInstance} from '../hooks/useInstance';
import {useMemo} from 'react';
import {useAssets} from '../hooks/useAssets';

export function Loot() {
  const entities = useQuery(LootTrait);
  return (
    <>
      {entities
        .filter(e => e.isAlive())
        .map(entity => (
          <LootEntity key={entity} entity={entity} />
        ))}
    </>
  );
}

function LootEntity({entity}: {entity: Entity}) {
  useExtend({Sprite});

  const label = useMemo(() => `loot-${entity}`, [entity]);
  const ref = useInstance<Sprite>(entity);

  const {data} = useAssets<Spritesheet>(['core/sprites']);
  const sprites = data?.sprites;

  return <pixiSprite label={label} ref={ref} texture={sprites?.textures['coin-gold.png']} />;
}
