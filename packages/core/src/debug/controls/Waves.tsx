import {useMemo, useCallback} from 'react';
import {useControls, button} from 'leva';
import {useActions, useWorld} from 'koota/react';
import {useTick} from '@pixi/react';

import {table} from '@hyper-space-wave/leva';
import {WorldTraits} from '../../state/traits';
import {actions} from '../../state/actions';
import {generateWaveSequence} from '../../util/wave-generator';
import {useWorldTrait} from '../../hooks/useWorldTrait';

export function Waves() {
  const world = useWorld();
  const scheduler = useWorldTrait(WorldTraits.WaveScheduler);
  const {isActive, waves} = scheduler ?? {isActive: false, waves: []};
  const {loadWaves, startWaves, stopWaves} = useActions(actions);

  const columns = useMemo(
    () => [
      {
        accessorKey: 'id',
        header: 'ID',
        size: 30,
      },
      {
        accessorKey: 'pattern',
        header: 'Pattern',
        size: 120,
      },
      {
        accessorKey: 'speed',
        header: 'Speed',
        size: 60,
      },
      {
        accessorKey: 'drops',
        header: 'Drops',
        size: 60,
      },
      {
        accessorKey: 'difficulty',
        header: 'Diff',
        size: 50,
      },
    ],
    [],
  );

  const getTableData = useCallback(() => {
    if (scheduler && scheduler.waves.length > 0) {
      return scheduler.waves.map(wave => {
        // Show just the first row across all columns
        const pattern = wave.columns
          .map(col => {
            const tile = col[0] || 'empty';
            return tile.startsWith('enemy_') ? 'X' : tile === 'hazard_zone' ? 'H' : ' ';
          })
          .join('');

        return {
          id: wave.id,
          pattern,
          speed: wave.speed.toFixed(2),
          drops: wave.drops,
          difficulty: wave.difficulty,
        };
      });
    }
    return [{id: 0, pattern: 'No waves loaded', speed: '0.00', drops: 0, difficulty: 0}];
  }, [scheduler]);

  const [wavesControl, setWaves] = useControls(
    'Waves',
    () => {
      return {
        status: {
          value: '',
          label: 'Status',
          editable: false,
        },
        currentWave: {
          value: '',
          label: 'Wave',
          editable: false,
        },
        nextSpawn: {
          value: '',
          label: 'Next Spawn',
          editable: false,
        },
        difficulty: {
          value: 0,
          label: 'Difficulty',
          editable: !isActive,
        },
        'Generate Waves': button(
          get => {
            const difficulty = get('Waves.difficulty');
            const patterns = generateWaveSequence(difficulty, difficulty + 50);
            loadWaves(patterns);
          },
          {disabled: isActive},
        ),
        'Start Waves': button(
          get => {
            const difficulty = get('Waves.difficulty');
            startWaves(difficulty);
          },
          {disabled: waves.length === 0},
        ),
        'Stop Waves': button(
          () => {
            stopWaves();
          },
          {disabled: !isActive},
        ),
        table: table({
          columns,
          data: getTableData(),
        }),
      };
    },
    [isActive, waves.length],
  );

  useTick(() => {
    const {isActive, currentWaveIndex, waves, waveInterval, waveTimer, difficulty} = world.get(
      WorldTraits.WaveScheduler,
    ) ?? {
      waves: [],
      currentWaveIndex: 0,
      waveTimer: 0,
      waveInterval: 2000,
      isActive: false,
      difficulty: wavesControl.difficulty,
    };

    setWaves({
      status: isActive ? 'Running' : 'Stopped',
      currentWave: `${currentWaveIndex} / ${waves.length}`,
      nextSpawn: isActive ? `${((waveInterval - waveTimer) / 1000).toFixed(1)}s` : '-',
      ...(isActive ? {difficulty} : {}),
      table: getTableData(),
    });
  });

  return null;
}
