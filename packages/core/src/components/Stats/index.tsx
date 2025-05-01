import React from 'react';

import type {StatsProps} from './Stats';

const LazyStats = React.lazy(() => import('./Stats'));

export const Stats = (props: StatsProps) => {
  return process.env.NODE_ENV !== 'production' ? <LazyStats {...props} /> : null;
};
