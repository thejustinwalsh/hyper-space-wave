import {useQuery} from 'koota/react';
import {Loot as LootTrait} from '../state/traits';
import {Entity} from 'koota';
import {Sprite, Spritesheet} from 'pixi.js';
import {useExtend, useAssets} from '@pixi/react';
import {useInstance} from '../hooks/useInstance';
import {useMemo} from 'react';
export function Loot() {
  const entities = useQuery(LootTrait);
  return (
    <>
      {entities.map(entity => (
        <LootEntity key={entity} entity={entity} />
      ))}
    </>
  );
}

function LootEntity({entity}: {entity: Entity}) {
  useExtend({Sprite});

  const label = useMemo(() => `loot-${entity}`, [entity]);
  const ref = useInstance<Sprite>(entity);

  const {
    assets: [sprites],
  } = useAssets<Spritesheet>(['core/sprites']);

  return <pixiSprite label={label} ref={ref} texture={sprites?.textures['coin-gold.png']} />;
}
