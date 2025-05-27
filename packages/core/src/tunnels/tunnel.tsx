import {ReactNode, useLayoutEffect} from 'react';
import {useSyncExternalStore} from 'react';

export function tunnel() {
  let listeners: (() => void)[] = [];
  let value: ReactNode[] = [];

  const getSnapshot = () => value;
  const subscribe = (listener: () => void) => {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  };
  const push = (child: ReactNode) => {
    value = [...value, child];
    listeners.forEach(l => l());
  };
  const remove = (child: ReactNode) => {
    value = value.filter(x => x !== child);
    listeners.forEach(l => l());
  };

  return {
    Sink: () => {
      const children = useSyncExternalStore(subscribe, getSnapshot);
      return <>{children}</>;
    },
    Source: ({children}: {children: ReactNode}) => {
      useLayoutEffect(() => {
        push(children);
        return () => {
          remove(children);
        };
      }, [children]);
      return <></>;
    },
  };
}
