import {createRoute} from '@tanstack/react-router';
import {rootLayoutRoute} from '../root';
import {Game} from './Game';

export const gameRoute = createRoute({
  getParentRoute: () => rootLayoutRoute,
  path: '/game',
  component: Game,
});
