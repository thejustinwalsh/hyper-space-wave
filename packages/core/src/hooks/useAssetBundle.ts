import {useEffect} from 'react';
import {useAssetState} from './useAssetState';
import {isBundleLoaded, loadBundle, resolveBundle} from '../util/asset';

import type {AssetState} from '../types';

export function useAssetBundle<T extends Record<string, unknown>>(
  bundles: string | string[],
): AssetState<T> {
  const [state, setState, thenable] = useAssetState<T, string | string[]>(
    bundles,
    isBundleLoaded,
    loadBundle,
    resolveBundle,
  );

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
