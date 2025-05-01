import {useRef} from 'react';
import {TilingSprite} from 'pixi.js';
import {useApplication, useExtend, useTick} from '@pixi/react';

export type ScrollingTilingSpriteProps = JSX.IntrinsicElements['pixiTilingSprite'] & {
  scroll?: [number, number];
};

export default function ScrollingTilingSprite({scroll, ...props}: ScrollingTilingSpriteProps) {
  useExtend({TilingSprite});

  const {app} = useApplication();
  const ref = useRef<TilingSprite>(null);

  useTick(() => {
    ref.current?.tilePosition.set(
      ref.current.tilePosition.x + (scroll?.[0] ?? 0),
      ref.current.tilePosition.y + (scroll?.[1] ?? 0),
    );
  });

  return (
    <pixiTilingSprite
      ref={ref}
      tilePosition={{x: 42, y: 0}}
      width={app.renderer.screen.width}
      height={app.renderer.screen.height}
      {...props}
    />
  );
}
