import type { MiddlewareFn } from 'grammy';

import type { FSMFlavor } from './state.api.types';
import type { StateValue } from './state.types';

/**
 * Middleware guard that runs a handler when the FSM state matches
 * one of the given values; otherwise it calls next() to continue.
 * @param values  - A state value or an array of values to match.
 * @param handler - The handler to execute on a matching state.
 */
export function onState<C extends FSMFlavor>(
  values: StateValue[] | StateValue,
  handler: MiddlewareFn<C>
): MiddlewareFn<C> {
  return async (ctx, next) => {
    if (ctx.fsm?.is(...(Array.isArray(values) ? values : [values]))) {
      return handler(ctx, next);
    } else {
      return next();
    }
  };
}
