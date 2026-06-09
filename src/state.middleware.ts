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
 * Creates middleware that injects FSM controls into the context
 * via ctx.fsm; must be used after GrammY's session middleware.
 */
export function stateMiddleware<C extends Context & SessionFlavor<StateSession>>(): MiddlewareFn<C & FSMFlavor> {
  return async (ctx, next) => {
    ctx.fsm = new StateController(
      () => ctx.session._state,
      (state) => {
        ctx.session._state = state;
      }
    );

    await next();
  };
}
