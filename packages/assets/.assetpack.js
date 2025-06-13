import {pixiPipes} from '@assetpack/core/pixi';

export default {
  entry: './bundle',
  output: './dist',
  cache: true,
  pipes: pixiPipes({
    cacheBust: true,
    resolutions: {default: 1, low: 0.5},
    compression: {png: true, webp: true},
    texturePacker: {nameStyle: 'short'},
    manifest: {
      trimExtensions: true,
    },
  }),
};
