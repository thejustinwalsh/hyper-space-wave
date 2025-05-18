import React from 'react';

const LazyDebug = React.lazy(() => import('./Debug'));

export const Debug = () => {
  return process.env.NODE_ENV !== 'production' ? <LazyDebug /> : null;
};
