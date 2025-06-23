import {useMemo} from 'react';
import {useControls} from 'leva';

import {table} from '@hyper-space-wave/leva';

export function Waves() {
  const [columns, data] = useMemo(() => {
    const columns = [
      {
        accessorKey: 'id',
        header: 'ID',
        size: 30,
      },
      {
        accessorKey: 'wave',
        header: 'Wave',
        size: 60,
        meta: {
          editable: true,
        },
      },
      {
        accessorKey: 'speed',
        header: 'Speed',
        size: 60,
        meta: {
          editable: true,
        },
      },
      {
        accessorKey: 'drops',
        header: 'Drops',
        size: 60,
        meta: {
          editable: true,
        },
      },
    ];
    const data = Array.from({length: 100}, (_, i) => ({
      id: i + 1,
      wave: Array.from({length: 5}, () => ['X', ' '][Math.floor(Math.random() * 2)]).join(''),
      speed: (Math.random() * 10).toFixed(2),
      drops: Math.floor(Math.random() * 5),
    }));
    return [columns, data];
  }, []);

  const [_waves, _setWaves] = useControls('Waves', () => {
    return {
      table: table({
        columns,
        data,
      }),
    };
  });

  return null;
}
