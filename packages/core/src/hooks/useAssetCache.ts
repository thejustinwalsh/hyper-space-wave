import {useCallback, useSyncExternalStore, useTransition} from 'react';
import {hashKey, remove} from '../util/asset';

export const clearCache = () => {
  GlobalCacheStore.cache = new Map<string, Promise<unknown>>();
};

const GlobalCacheStore = {
  cache: new Map<string, Promise<unknown>>(),
  listeners: [] as (() => void)[],

  reset: <T>() => {
    GlobalCacheStore.cache = new Map<string, Promise<T>>();
    GlobalCacheStore.listeners.forEach(l => l());
  },
  set: <T>(key: string, promise: Promise<T>) => {
    const newCache = new Map<string, Promise<unknown>>();
    newCache.set(key, promise);
    GlobalCacheStore.cache = newCache;
    GlobalCacheStore.listeners.forEach(l => l());
  },

  subscribe: (listener: () => void) => {
    GlobalCacheStore.listeners = [...GlobalCacheStore.listeners, listener];
    return () => {
      GlobalCacheStore.listeners = GlobalCacheStore.listeners.filter(l => l !== listener);
    };
  },
  getSnapshot: () => {
    return GlobalCacheStore.cache;
  },
};

const useCacheRefresh = () => {
  return useCallback(() => {
    GlobalCacheStore.reset();
  }, []);
};

export function loadFromCache<T>(
  cache: Map<string, Promise<T>>,
  key: Set<string>,
  load: () => Promise<T>,
) {
  const k = hashKey(key);
  let cached = cache.get(k);
  if (!cached) {
    cached = load();
    cache.set(k, cached);
  }
  return cached;
}

export function usePromiseCache<T>() {
  return useSyncExternalStore(GlobalCacheStore.subscribe, GlobalCacheStore.getSnapshot) as Map<
    string,
    Promise<T>
  >;
}

export function useAssetCache() {
  const cacheRefresh = useCacheRefresh();
  const [isPending, startTransition] = useTransition();

  const refresh = useCallback(
    (keys?: string[]) => {
      startTransition(() => {
        remove(keys);
        cacheRefresh();
      });
    },
    [cacheRefresh],
  );

  const clear = useCallback(
    (reset: boolean = false) => {
      startTransition(() => {
        if (reset) {
          remove();
        }
        cacheRefresh();
      });
    },
    [cacheRefresh],
  );

  return [isPending, refresh, clear] as const;
}
