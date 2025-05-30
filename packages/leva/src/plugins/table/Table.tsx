import {memo, useCallback, useMemo, useRef, useState} from 'react';
import {useInputContext, Components, styled} from 'leva/plugin';
import {useVirtualizer} from '@tanstack/react-virtual';
import {
  CellContext,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  Table as ReactTable,
  RowData,
  useReactTable,
} from '@tanstack/react-table';
import type {TableProps, TableSettings} from './types';

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData extends RowData, TValue> {
    editable?: boolean;
    onChange?: (value: string, context: {rowIndex: number; columnId: string}) => void;
  }
}

export function Table<T>() {
  const [rowSelection, setRowSelection] = useState<{}>({});
  const {label, value, settings} = useInputContext<{
    value: TableProps<T>['data'];
    settings: TableSettings<T>;
  }>();

  // When we click on a cell we want to turn the entire column into editable inputs.
  const columns = useMemo(
    () =>
      settings.columns.map(column => ({
        ...column,
        cell: function Cell({getValue, row, column: {id, getIndex}}: CellContext<T, unknown>) {
          const onChange = useCallback(
            (e: React.ChangeEvent<HTMLInputElement>) => {
              column.meta?.onChange?.(e.target.value, {rowIndex: row.index, columnId: id});
            },
            [row, id],
          );

          const onFocus = useCallback(() => row.toggleSelected(true), [row]);
          const onBlur = useCallback(() => row.toggleSelected(false), [row]);

          if (!column.meta?.editable) {
            return (
              <TableId selected={getIndex() === 0 && row.getIsSelected()}>
                {getValue() as string}
              </TableId>
            );
          }

          return (
            <EditableCell
              value={getValue() as string}
              onChange={onChange}
              onFocus={onFocus}
              onBlur={onBlur}
            />
          );
        },
      })),
    [settings.columns],
  );

  const t = useReactTable({
    data: value,
    columns,
    enableRowSelection: true,
    state: {
      rowSelection,
    },
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });
  const {rows} = t.getRowModel();

  const parentRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 20,
    overscan: 20,
  });

  return (
    <>
      <Components.Row>
        <Wrapper>
          <TableWrapper ref={parentRef}>
            <TableSticky>
              <thead>
                <TableHeaderRows table={t} />
              </thead>
            </TableSticky>
            <table style={{borderCollapse: 'collapse'}}>
              <thead>
                <TableHeaderRows table={t} placeholder />
              </thead>
              <tbody>
                {virtualizer.getVirtualItems().map((virtualRow, index) => {
                  const row = rows[virtualRow.index];
                  return (
                    <TableRow
                      key={row.id}
                      selected={row.getIsSelected()}
                      style={{
                        height: `${virtualRow.size}px`,
                        transform: `translateY(${virtualRow.start - index * virtualRow.size}px)`,
                      }}
                    >
                      {row.getVisibleCells().map(cell => {
                        return (
                          <td key={cell.id}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        );
                      })}
                    </TableRow>
                  );
                })}
              </tbody>
            </table>
          </TableWrapper>
        </Wrapper>
      </Components.Row>
      <Components.Row input>
        <Components.Label>{label}</Components.Label>
        <Components.String
          editable
          displayValue=""
          onChange={() => {}}
          onUpdate={() => {}}
        ></Components.String>
      </Components.Row>
    </>
  );
}

const TableHeaderRows = memo(function TableHeaderRows<T>({
  table,
  placeholder,
}: {
  table: ReactTable<T>;
  placeholder?: boolean;
}) {
  return table.getHeaderGroups().map(headerGroup => (
    <tr key={headerGroup.id}>
      {headerGroup.headers.map(header => {
        return (
          <th
            key={header.id}
            colSpan={header.colSpan}
            style={{
              textAlign: 'left',
              width: header.getSize(),
            }}
          >
            {placeholder || header.isPlaceholder ? null : (
              <div
                {...{
                  className: header.column.getCanSort() ? 'cursor-pointer select-none' : '',
                  onClick: header.column.getToggleSortingHandler(),
                }}
              >
                {flexRender(header.column.columnDef.header, header.getContext())}
                {{
                  asc: ' 🔼',
                  desc: ' 🔽',
                }[header.column.getIsSorted() as string] ?? null}
              </div>
            )}
          </th>
        );
      })}
    </tr>
  ));
}) as <T>(props: {table: ReactTable<T>; placeholder?: boolean}) => React.ReactElement;

const Wrapper = styled('div', {
  position: 'relative',
  height: 200,
  width: '100%',
  marginBottom: '$sm',
});

const TableWrapper = styled('div', {
  height: '100%',
  width: '100%',
  position: 'relative',
  overflow: 'auto',
});

const TableSticky = styled('table', {
  position: 'sticky',
  top: 0,
  zIndex: 1,
  backgroundColor: '$elevation2',
});

const TableRow = styled('tr', {
  variants: {
    selected: {
      true: {
        backgroundColor: '$elevation3',
      },
      false: {
        backgroundColor: 'transparent',
      },
    },
  },
});

const TableId = styled('span', {
  variants: {
    selected: {
      true: {
        color: '$vivid1',
      },
      false: {
        color: '$text',
      },
    },
  },
});

const EditableCell = styled('input', {
  fontFamily: '$mono',
  fontSize: '$sm',
  padding: '$xs',
  backgroundColor: 'transparent',
  border: 'none',
  outline: 'none',
  color: '$text',
  '&:focus': {
    color: '$highlight3',
  },
  width: '100%',
  height: '100%',
}) as React.FC<React.InputHTMLAttributes<HTMLInputElement>>;
