import {memo, useCallback, useRef} from 'react';
import {Ticker, TilingSprite} from 'pixi.js';
import {PixiElements, useApplication, useExtend, useTick} from '@pixi/react';
import {useWorldTrait} from '../hooks/useWorldTrait';
import {WorldTraits} from '../state/traits';
import {assert} from '../util/assert';

export type ScrollingTilingSpriteProps = PixiElements['pixiTilingSprite'] & {
  scroll?: [number, number];
};

export const ScrollingTilingSprite = memo(({scroll, ...props}: ScrollingTilingSpriteProps) => {
  useExtend({TilingSprite});

  const {app} = useApplication();
  const delta = useWorldTrait(WorldTraits.Delta);
  const ref = useRef<TilingSprite>(null);

  const update = useCallback(
    (t: Ticker) => {
      const {dilation} = assert(delta);
      ref.current?.tilePosition.set(
        ref.current.tilePosition.x + (scroll?.[0] ?? 0) * (t.deltaTime * dilation),
        ref.current.tilePosition.y + (scroll?.[1] ?? 0) * (t.deltaTime * dilation),
      );
    },
    [delta, scroll],
  );
  useTick(update);

  return (
    <pixiTilingSprite
      ref={ref}
      tilePosition={{x: 42, y: 0}}
      width={app.renderer.screen.width}
      height={app.renderer.screen.height}
      {...props}
    />
  );
});
ScrollingTilingSprite.displayName = 'ScrollingTilingSprite';
