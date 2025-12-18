import {memo, useMemo} from 'react';
import {Sprite, Spritesheet} from 'pixi.js';
import {useExtend} from '@pixi/react';
import {useQuery} from 'koota/react';
import {Enemy} from '../state/traits';
import {Entity} from 'koota';
import {useInstance} from '../hooks/useInstance';
import {useAssets} from '../hooks/useAssets';

export const Enemies = memo(function Enemies() {
  const entities = useQuery(Enemy);

  return (
    <>
      {entities.map(entity => (
        <EnemySprite key={entity} entity={entity} />
      ))}
    </>
  );
});

function EnemySprite({entity}: {entity: Entity}) {
  useExtend({Sprite});

  const label = useMemo(() => `enemy-${entity}`, [entity]);
  const {setRef} = useInstance<Sprite>(entity);
  const enemy = entity.get(Enemy);

  const {data} = useAssets<Spritesheet>(['core/sprites']);
  const sprites = data?.sprites;

  // Map enemy types to sprite names
  const spriteMap = {
    enemy1: 'enemy1-green-1.png',
    enemy2: 'enemy2-green-1.png',
    enemy3: 'enemy1-teal-1.png',
    enemy4: 'enemy2-teal-1.png',
    enemy5: 'enemy1-red-1.png',
  };

  const spriteName = enemy ? spriteMap[enemy.type] : 'enemy1-green-1.png';

  return <pixiSprite label={label} ref={setRef} texture={sprites?.textures[spriteName]} />;
}
