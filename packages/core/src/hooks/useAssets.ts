import {useEffect} from 'react';
import {useAssetState} from './useAssetState';
import {isLoaded, load, resolve} from '../util/asset';

import type {UnresolvedAsset} from 'pixi.js';
import type {AssetState, AssetUrl} from '../types';

export function useAssets<T>(urls: string | UnresolvedAsset): AssetState<T | undefined>;
export function useAssets<T>(urls: string[] | UnresolvedAsset[]): AssetState<Record<string, T>>;

export function useAssets<T>(urls: AssetUrl) {
  const [state, setState, thenable] = useAssetState<T, AssetUrl>(urls, isLoaded, load, resolve);

  useEffect(() => {
    const pending = new WeakSet([thenable]);
    (async () => {
      try {
        const data = await thenable;
        if (pending.has(thenable)) {
          setState({status: 'loaded', isLoaded: true, error: null, data});
        }
      } catch (error: unknown) {
        if (pending.has(thenable)) {
          setState({
            status: 'error',
            isLoaded: false,
            error: error instanceof Error ? error : new Error(String(error)),
            data: null,
          });
        }
      }
    })();
  }, [setState, thenable]);

  return state;
}
