import {createPlugin} from 'leva/plugin';
import {Table} from './Table';
import type {TableProps} from './types';

export const table = <T,>(input?: TableProps<T>) => {
  return createPlugin({
    sanitize: (value: TableProps<T>) => {
      return value.data;
    },
    format: (value: TableProps<T>) => value,
    normalize: (value: TableProps<T>) => ({
      value: value.data ?? [],
      settings: {
        columns: value.columns ?? [],
      },
    }),
    component: Table<T>,
  })(input);
};
