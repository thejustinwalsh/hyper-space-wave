import {memo, useCallback, useRef} from 'react';
import {TilingSprite} from 'pixi.js';
import {PixiElements, useApplication, useExtend} from '@pixi/react';
import {useSimTick} from '../hooks/useSimTick';

export type ScrollingTilingSpriteProps = PixiElements['pixiTilingSprite'] & {
  scroll?: [number, number];
};

export const ScrollingTilingSprite = memo(({scroll, ...props}: ScrollingTilingSpriteProps) => {
  useExtend({TilingSprite});

  const {app} = useApplication();
  const ref = useRef<TilingSprite>(null);

  const update = useCallback(
    (deltaTime: number) => {
      ref.current?.tilePosition.set(
        ref.current.tilePosition.x + (scroll?.[0] ?? 0) * deltaTime * 10,
        ref.current.tilePosition.y + (scroll?.[1] ?? 0) * deltaTime * 10,
      );
    },
    [scroll],
  );
  useSimTick(update);

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
