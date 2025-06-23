import {useQuery} from 'koota/react';
import {Instance} from '../../state/traits';
import {useEffect} from 'react';
import {useControls} from 'leva';

export function Entities() {
  const entities = useQuery(Instance);

  const [_stats, setStats] = useControls('Entities', () => {
    return {
      entities: {
        value: '',
        label: 'active',
        editable: false,
      },
    };
  });

  useEffect(() => {
    setStats({
      entities: entities.length.toFixed(0),
    });
  }, [entities, setStats]);

  return null;
}
