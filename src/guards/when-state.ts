import type { MiddlewareFn } from 'grammy';

import type { FSMFlavor, StateValue } from '../session/fsm';

export function whenState<C extends FSMFlavor>(values: StateValue[] | StateValue, handler: MiddlewareFn<C>): MiddlewareFn<C> {
  // Filters handler execution based on FSM state

  const list = Array.isArray(values) ? values : [values];

  return async (ctx, next) => {
    if (ctx.fsm?.is(...list)) return handler(ctx, next);
    return next();
  };
}
