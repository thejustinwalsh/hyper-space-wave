import {createPlugin} from 'leva/plugin';
import {Table} from './Table';
import type {TableProps} from './types';

export const table = createPlugin({
  sanitize: <T,>(value: TableProps<T> | T[]) => {
    return Array.isArray(value) ? value : (value.data ?? []);
  },
  format: <T,>(value: TableProps<T>) => value,
  normalize: <T,>(value: TableProps<T> | T[]) => {
    const v = value as Partial<TableProps<T>> | T[];
    const data = Array.isArray(v) ? v : (v.data ?? []);
    const columns = Array.isArray(v) ? undefined : v.columns;
    return {
      value: data,
      ...(columns ? {settings: {columns}} : {}),
    };
  },
  component: Table,
});
