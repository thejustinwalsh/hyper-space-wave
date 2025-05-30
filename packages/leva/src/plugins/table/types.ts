import type {ColumnDef} from '@tanstack/react-table';

export type TableProps<T> = {
  columns: ColumnDef<T>[];
  data: T[];
};

export type TableSettings<T> = {
  columns: ColumnDef<T>[];
};
