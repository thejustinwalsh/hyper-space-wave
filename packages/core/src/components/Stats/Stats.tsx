import {useEffect, useState} from 'react';
import {useTick} from '@pixi/react';
// @ts-expect-error: Ignore missing types for stats.js
import StatsImpl from 'stats.js';
import {IS_MOBILE} from '../../util/constants';

export type StatsProps = {
  showPanel?: number;
  className?: string;
  parent?: React.RefObject<HTMLElement>;
};

export default function Stats({showPanel = 0, className, parent}: StatsProps): null {
  const [stats] = useState(() => new StatsImpl());

  useEffect(() => {
    const node = (parent && parent.current) || document.body;
    stats.showPanel(showPanel);
    if (IS_MOBILE) {
      stats.dom.style.top = '50px';
      stats.dom.style.left = '50px';
    }
    node?.appendChild(stats.dom);
    if (className) stats.dom.classList.add(...className.split(' ').filter(cls => cls));
    return () => {
      node?.removeChild(stats.dom);
    };
  }, [parent, stats, className, showPanel]);

  useTick(() => {
    stats.update();
  });

  return null;
}
