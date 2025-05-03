import {Application} from '@pixi/react';

import {useCallback, useEffect, useMemo, useState} from 'react';
import {useApplication, useExtend} from '@pixi/react';
import {AbstractRenderer, EventSystem, Sprite, Texture, TextureSource} from 'pixi.js';
import {useActions} from 'koota/react';
import {useAssetManifest} from './hooks/useAssetManifest';

import manifest from '@hyper-space-wave/assets/manifest.json';
import {useAssetBundle} from './hooks/useAssetBundle';
import {Stats} from './components/Stats';
import ScrollingTilingSprite from './components/ScrollingTilingSprite';
import {WorldProvider} from 'koota/react';
import {Loot} from './components/Loot';
import {Players} from './components/Players';

import {world, systems} from './state/init';
import {actions} from './state/actions';
import {useSystems} from './hooks/useSystem';

TextureSource.defaultOptions.scaleMode = 'nearest';
AbstractRenderer.defaultOptions.roundPixels = true;
EventSystem.defaultEventFeatures.move = true;
EventSystem.defaultEventFeatures.globalMove = true;

export const Scene = () => {
  const {app} = useApplication();
  useSystems(systems);
  const {spawnPlayer} = useActions(actions);

  useEffect(() => {
    app.ticker.maxFPS = 60;
    spawnPlayer(
      0,
      {x: 100, y: 100},
      {x: 28, y: 28, width: 8, height: 8},
      {x: 0, y: 0, width: app.renderer.width, height: app.renderer.height},
    );
  }, [spawnPlayer]);

  return (
    <>
      <BackgroundSprite />
      <Players />
      <Loot />
    </>
  );
};

export const BackgroundSprite = () => {
  useExtend({Sprite});

  const {isLoaded, data: bundle} = useAssetBundle<Record<string, Texture>>('default');

  const texture = useMemo(() => {
    return bundle?.['background-vertical-seamless'] ?? Texture.EMPTY;
  }, [isLoaded]);

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
    <Application onInit={handleInit} {...resolvedProps}>
      <Stats />
      <WorldProvider world={world}>{isReady && <Scene />}</WorldProvider>
    </Application>
  );
}
