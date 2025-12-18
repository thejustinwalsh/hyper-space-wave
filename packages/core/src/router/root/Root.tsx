import {Outlet} from '@tanstack/react-router';
import {useMemo} from 'react';
import {useApplication, useExtend} from '@pixi/react';
import {Container} from 'pixi.js';
import {useActions} from 'koota/react';

import {WorldProvider} from 'koota/react';
import {Debug} from '../../debug';
import {world, systems} from '../../state/init';
import {actions} from '../../state/actions';
import {useSystems} from '../../hooks/useSystem';
import {ScrollingBackground} from '../../components/ScrollingBackground';

export function Root() {
  return (
    <WorldProvider world={world}>
      <RootContainer />
    </WorldProvider>
  );
}

function RootContainer() {
  useExtend({Container});

  const {app} = useApplication();
  const {setupCollisionGrid, setupWaveScheduler} = useActions(actions);
  useSystems(systems);

  useMemo(() => {
    setupCollisionGrid(64, app.renderer.width + 32, app.renderer.height + 164, -16, -132);
    setupWaveScheduler();
  }, [app, setupCollisionGrid, setupWaveScheduler]);

  return (
    <pixiContainer label="root" width={app.renderer.width} height={app.renderer.height}>
      <ScrollingBackground />
      <Outlet />
      <Debug />
    </pixiContainer>
  );
}
