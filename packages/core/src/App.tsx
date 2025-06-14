import {Application} from '@pixi/react';

import {useCallback, useEffect, useMemo, useState} from 'react';
import {EventSystem, TextureSource} from 'pixi.js';
import {useAssetManifest} from './hooks/useAssetManifest';

import manifest from '@hyper-space-wave/assets/manifest.json';
import {AppTunnel} from './tunnels/AppTunnel';
import {Router} from './router';

TextureSource.defaultOptions.scaleMode = 'nearest';
EventSystem.defaultEventFeatures.move = true;
EventSystem.defaultEventFeatures.globalMove = true;

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
        {isReady && <Router />}
      </Application>
    </>
  );
}
