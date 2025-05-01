import {Assets} from 'pixi.js';

import type {UnresolvedAsset} from 'pixi.js';

export const key = (url: string | UnresolvedAsset) =>
  typeof url === 'string' ? url : (url.alias ?? url.src ?? '')?.toString();

export const createKey = (urls: string | UnresolvedAsset | string[] | UnresolvedAsset[]) =>
  new Set(Array.isArray(urls) ? urls.map(key) : [key(urls)]);

export const hashKey = (key: Set<string>) => {
  return Array.from(key).sort().join('|');
};

export const didKeyChange = (
  urls: string | UnresolvedAsset | string[] | UnresolvedAsset[],
  keys: Set<string>,
) => (Array.isArray(urls) ? !urls.every(url => keys.has(key(url))) : !keys.has(key(urls)));

export const isLoaded = (urls: string | UnresolvedAsset | string[] | UnresolvedAsset[]) =>
  Array.isArray(urls) ? urls.every(url => Assets.cache.has(key(url))) : Assets.cache.has(key(urls));

export const isBundleLoaded = (bundles: string | string[]) => {
  const bundleArray = Array.isArray(bundles) ? bundles : [bundles];
  return bundleArray.every(bundle => {
    const assets = Assets.resolver.resolveBundle(bundle);
    return Object.keys(assets).every(asset => Assets.cache.has(key(asset)));
  });
};

export const load = (urls: string | UnresolvedAsset | string[] | UnresolvedAsset[]) =>
  Assets.load(urls);

export const loadBundle = <T = unknown>(bundles: string | string[]): Promise<T> =>
  Assets.loadBundle(bundles);

export const resolve = <T = unknown>(
  urls: string | UnresolvedAsset | string[] | UnresolvedAsset[],
) =>
  Array.isArray(urls)
    ? urls.reduce((acc, url) => {
        const k = key(url);
        if (Assets.cache.has(k)) acc[k] = Assets.cache.get(k);
        return acc;
      }, {} as Record<string, T>)
    : Assets.cache.get(key(urls));

export const resolveBundle = <T = unknown>(bundles: string | string[]) => {
  const bundleArray = Array.isArray(bundles) ? bundles : [bundles];
  return bundleArray.reduce((acc, bundle) => {
    const assetMap = Assets.resolver.resolveBundle(bundle);
    const assets = Object.keys(assetMap).reduce((acc, asset) => {
      const k = key(asset);
      if (Assets.cache.has(k)) acc[k] = Assets.cache.get(k);
      return acc;
    }, {} as Record<string, T>);
    return {...acc, ...assets};
  }, {} as any);
};

export const remove = (urls?: string | UnresolvedAsset | string[] | UnresolvedAsset[]) => {
  if (urls) {
    Array.isArray(urls)
      ? urls.forEach(url => Assets.cache.remove(key(url)))
      : Assets.cache.remove(key(urls));
  } else {
    Assets.cache.reset();
  }
};

export function cached<T>(cache: Map<string, Promise<T>>, key: Set<string>) {
  const k = hashKey(key);
  return cache.get(k);
}
