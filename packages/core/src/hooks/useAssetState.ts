import React, {useMemo} from 'react';
import {useEffect, useState} from 'react';
import {didKeyChange, createKey, cached} from '../util/asset';
import {loadFromCache, usePromiseCache} from './useAssetCache';

import type {
  AssetState,
  HookState,
  PendingAssetState,
  LoadedAssetState,
  ErrorAssetState,
  AssetUrl,
} from '../types';

type LoadedAssetStateReturn<T> = readonly [
  LoadedAssetState<T>,
  React.Dispatch<React.SetStateAction<AssetState<T>>>,
  Promise<T>,
];

type PendingAssetStateReturn<T> = readonly [
  PendingAssetState,
  React.Dispatch<React.SetStateAction<AssetState<T>>>,
  Promise<T>,
];

type ErrorAssetStateReturn<T> = readonly [
  ErrorAssetState,
  React.Dispatch<React.SetStateAction<AssetState<T>>>,
  Promise<T>,
];

type AssetStateReturn<T> =
  | LoadedAssetStateReturn<T>
  | PendingAssetStateReturn<T>
  | ErrorAssetStateReturn<T>;

export function useAssetState<T, P extends AssetUrl>(
  urls: P,
  isLoaded: (urls: P) => boolean,
  load: (urls: P) => Promise<T>,
  resolve: (urls: P) => T,
): AssetStateReturn<T> {
  const key = useMemo(() => createKey(urls), [urls]);
  const cache = usePromiseCache<T>();
  const [assetState, setAssetState] = useState<AssetState<T>>(() => {
    const loaded = isLoaded(urls);
    return loaded
      ? {
          status: 'loaded',
          isLoaded: true,
          error: null,
          data: resolve(urls),
        }
      : {
          status: 'pending',
          isLoaded: false,
          error: null,
          data: null,
        };
  });

  const [state, setState] = useState<HookState<T>>(() => ({
    thenable: loadFromCache(cache, key, () => load(urls)),
    key,
  }));

  useEffect(() => {
    const promise = cached(cache, key);
    if (didKeyChange(urls, state.key) || state.thenable !== promise) {
      setState({thenable: loadFromCache(cache, key, () => load(urls)), key});
      if (isLoaded(urls)) {
        setAssetState({status: 'loaded', isLoaded: true, error: null, data: resolve(urls)});
      } else {
        setAssetState({status: 'pending', isLoaded: false, error: null, data: null});
      }
    }
  }, [cache, isLoaded, key, load, resolve, state, urls]);

  if (assetState.status === 'error') {
    return [assetState, setAssetState, state.thenable] as const;
  }

  if (assetState.status === 'pending') {
    return [assetState, setAssetState, state.thenable] as const;
  }

  return [assetState, setAssetState, state.thenable] as const;
}
