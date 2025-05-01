'use dom';

import {App} from '@hyper-space-wave/core';
import type {DOMProps} from 'expo/dom';

export type AppDOMComponentProps = {
  width?: number;
  height?: number;
  dom?: DOMProps;
  onReady?: () => Promise<void>;
};

export default function AppDOMComponent({width, height, onReady}: AppDOMComponentProps) {
  return (
    <App width={width} height={height} baseUrl={process.env.EXPO_BASE_URL} onReady={onReady} />
  );
}
