import {createRoute} from '@tanstack/react-router';
import {rootLayoutRoute} from '../root';
import {Title} from './Title';

export const titleRoute = createRoute({
  getParentRoute: () => rootLayoutRoute,
  path: '/title',
  component: Title,
});
