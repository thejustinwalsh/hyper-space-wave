import {useExtend} from '@pixi/react';
import {Sprite, Texture} from 'pixi.js';
import {useAssetBundle} from '../hooks/useAssetBundle';
import {useMemo} from 'react';
import {ScrollingTilingSprite} from './ScrollingTilingSprite';

export function ScrollingBackground() {
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
}
