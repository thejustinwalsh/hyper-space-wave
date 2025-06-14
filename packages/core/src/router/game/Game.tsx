import {useMemo} from 'react';
import {useApplication, useExtend} from '@pixi/react';
import {Container} from 'pixi.js';
import {useActions} from 'koota/react';
import {Players} from '../../components/Players';
import {Loot} from '../../components/Loot';
import {actions} from '../../state/actions';

export function Game() {
  useExtend({Container});

  const {app} = useApplication();
  const {spawnPlayer, spawnLoot} = useActions(actions);

  useMemo(() => {
    spawnPlayer(
      0,
      {x: 100, y: 100},
      {x: 28, y: 28, width: 8, height: 8},
      {x: 0, y: 0, width: app.renderer.width, height: app.renderer.height},
    );
  }, [app, spawnPlayer]);

  return (
    <pixiContainer
      label="game"
      eventMode="static"
      width={app.renderer.width}
      height={app.renderer.height}
      onPointerTap={() => {
        const pointer = app.renderer.events.pointer.global;
        Array.from({length: 200}).forEach(() => {
          const angle = Math.random() * Math.PI * 2;
          const radius = Math.random() * 80 + 80;
          const x = pointer.x + Math.cos(angle) * radius;
          const y = pointer.y + Math.sin(angle) * radius;
          spawnLoot({x, y}, {x: 0, y: 0, width: 32, height: 32});
        });
      }}
    >
      <Players />
      <Loot />
    </pixiContainer>
  );
}
