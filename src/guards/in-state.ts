import type { FSMFlavor, StateValue } from '../session/fsm';

export function inState<C extends FSMFlavor>(...values: StateValue[]) {
  // Predicate for checking FSM state

  return (ctx: C) => ctx.fsm?.is(...values) ?? false;
}
