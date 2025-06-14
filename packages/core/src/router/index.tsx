import {createMemoryHistory, createRouter, RouterProvider} from '@tanstack/react-router';
import {rootLayoutRoute, rootRoute} from './root';
import {titleRoute} from './title';
import {gameRoute} from './game';

const memoryHistory = createMemoryHistory({
  initialEntries: ['/game'],
});

const routeTree = rootRoute.addChildren([rootLayoutRoute.addChildren([titleRoute, gameRoute])]);

const router = createRouter({
  routeTree,
  history: memoryHistory,
  defaultErrorComponent: ({error}) => {
    console.error('Router error:', error);
    return <></>;
  },
});

export function Router() {
  return <RouterProvider router={router} />;
}
