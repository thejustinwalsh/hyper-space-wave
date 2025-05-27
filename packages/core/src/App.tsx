import {Application} from '@pixi/react';

import {useCallback, useEffect, useMemo, useState} from 'react';
import {useApplication, useExtend} from '@pixi/react';
import {Container, EventSystem, Sprite, Texture, TextureSource} from 'pixi.js';
import {useActions} from 'koota/react';
import {useAssetManifest} from './hooks/useAssetManifest';

import {useAssetBundle} from './hooks/useAssetBundle';
import {ScrollingTilingSprite} from './components/ScrollingTilingSprite';
import {WorldProvider} from 'koota/react';
import {Loot} from './components/Loot';
import {Players} from './components/Players';
import {Debug} from './debug';
import {world, systems} from './state/init';
import {actions} from './state/actions';
import {useSystems} from './hooks/useSystem';
import {AppTunnel} from './tunnels/AppTunnel';

import manifest from '@hyper-space-wave/assets/manifest.json';

TextureSource.defaultOptions.scaleMode = 'nearest';
EventSystem.defaultEventFeatures.move = true;
EventSystem.defaultEventFeatures.globalMove = true;

export const Scene = () => {
  useExtend({Container});

  const {app} = useApplication();
  const {setupCollisionGrid, spawnPlayer, spawnLoot} = useActions(actions);
  useSystems(systems);

  useMemo(() => {
    setupCollisionGrid(64, app.renderer.width + 32, app.renderer.height + 64, -16, -32);
    spawnPlayer(
      0,
      {x: 100, y: 100},
      {x: 28, y: 28, width: 8, height: 8},
      {x: 0, y: 0, width: app.renderer.width, height: app.renderer.height},
    );
  }, [app, setupCollisionGrid, spawnPlayer]);

  return (
    <pixiContainer
      label="scene"
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
      <BackgroundSprite />
      <Players />
      <Loot />
      <Debug />
    </pixiContainer>
  );
};

export const BackgroundSprite = () => {
  useExtend({Sprite});

  const {isLoaded, data: bundle} = useAssetBundle<Record<string, Texture>>('default');

  const texture = useMemo(() => {
    return bundle?.['background-vertical-seamless'] ?? Texture.EMPTY;
  }, [bundle]);

  return (
    <>
      {isLoaded && <ScrollingTilingSprite label="Background" texture={texture} scroll={[0, 1]} />}
    </>
  );
};

type AppProps = {
  width?: number;
  height?: number;
  background?: string;
  resizeTo?: Window | HTMLElement;
  baseUrl?: string;
  onReady?: () => Promise<void>;
};

export function App({baseUrl, onReady, ...props}: AppProps) {
  const resolvedProps = useMemo(
    () => ({
      ...props,
      background: props.background ?? '#000000',
      resizeTo:
        props.resizeTo ??
        (props.width && props.height
          ? undefined
          : typeof window !== 'undefined'
          ? window
          : undefined),
    }),
    [props],
  );

  const {isLoaded} = useAssetManifest(manifest, ['default', 'core'], {basePath: baseUrl});
  const [isInitialized, setIsInitialized] = useState(false);
  const handleInit = useCallback(() => setIsInitialized(true), []);
  const isReady = isInitialized && isLoaded;

  useEffect(() => {
    if (isReady) {
      onReady?.();
    }
  }, [isReady, onReady]);

  return (
    <>
      <AppTunnel.Sink />
      <Application onInit={handleInit} {...resolvedProps}>
        <WorldProvider world={world}>{isReady && <Scene />}</WorldProvider>
      </Application>
    </>
  );
}
