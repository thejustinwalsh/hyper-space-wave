import React from 'react';
import {IS_MOBILE} from '../util/constants';

const LazyDebugControls = React.lazy(() => import('./DebugControls'));

export const Debug = () => {
  return process.env.NODE_ENV === 'production' || IS_MOBILE ? null : <LazyDebugControls />;
};
