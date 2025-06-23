import {useEffect} from 'react';
import {useApplication} from '@pixi/react';
import {Leva} from 'leva';

import {AppTunnel} from '../tunnels/AppTunnel';

import {Collision} from './controls/Collision';
import {Entities} from './controls/Entities';
import {Performance} from './controls/Performance';
import {Waves} from './controls/Waves';

export default function DebugLevaControls() {
  const {app} = useApplication();
  useEffect(() => {
    globalThis.__PIXI_APP__ = app;
  }, [app]);

  return (
    <>
      <AppTunnel.Source>
        <Leva hideCopyButton />
      </AppTunnel.Source>
      <Entities />
      <Performance />
      <Waves />
      <Collision />
    </>
  );
}
