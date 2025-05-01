import type {ResolvedAsset, UnresolvedAsset} from 'pixi.js';

export type LoadedAssetState<T> = {
  status: 'loaded';
  isLoaded: true;
  error: null;
  data: T;
};

export type PendingAssetState = {
  status: 'pending';
  isLoaded: false;
  error: null;
  data: null;
};

export type ErrorAssetState = {
  status: 'error';
  isLoaded: false;
  error: Error;
  data: null;
};

export type UnloadedAssetState = {
  status: 'pending' | 'error';
  isLoaded: false;
  error: Error | null;
  data: null;
};

export type AssetState<T> = LoadedAssetState<T> | PendingAssetState | ErrorAssetState;

export type HookState<T> = {
  thenable: Promise<T>;
  key: Set<string>;
};

export type AssetUrl = string | UnresolvedAsset | string[] | UnresolvedAsset[];

export type AssetBundle<T = unknown> =
  | Record<string, ResolvedAsset<T>>
  | Record<string, Record<string, ResolvedAsset<T>>>;
