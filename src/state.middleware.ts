import type { Context, MiddlewareFn } from 'grammy';
import type { SessionFlavor } from 'grammy';

import { StateController } from './state.api';
import type { FSMFlavor } from './state.api.types';
import type { StateRecord } from './state.types';

/**
 * Session shape required by stateMiddleware to persist the FSM
 * state across requests via GrammY's built-in session plugin.
 */
export type StateSession = { _state: StateRecord | null };

/**
 * Context type that includes both session and FSM properties;
 * Internally used by stateMiddleware to ensure correct typings.
 */
type StateMiddlewareContext = Context & SessionFlavor<StateSession> & FSMFlavor;

/**
 * Creates middleware that injects FSM controls into the context
 * via ctx.fsm; must be used after GrammY's session middleware.
 */
export function stateMiddleware<C extends StateMiddlewareContext>(): MiddlewareFn<C> {
  return async (ctx, next) => {
    ctx.fsm = new StateController(
      () => ctx.session._state,
      (state) => (ctx.session._state = state)
    );

    await next();
  };
}
