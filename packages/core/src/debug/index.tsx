import React from 'react';
import {IS_MOBILE} from '../util/constants';

const LazyDebug = React.lazy(() => import('./components/Debug'));

export const Debug = () => {
  return process.env.NODE_ENV === 'production' || IS_MOBILE ? null : <LazyDebug />;
};
