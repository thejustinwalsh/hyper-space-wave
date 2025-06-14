import {createRootRoute, createRoute} from '@tanstack/react-router';
import {Root} from './Root';

export const rootRoute = createRootRoute();

export const rootLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'index',
  component: Root,
});
