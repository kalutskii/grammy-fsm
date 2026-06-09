import type { Context } from 'grammy';

import type { StateData, StateRecord, StateValue } from './state.types';

export type StateControllers = {
  /**
   * The current FSM state as a StateRecord, or null.
   * Null is returned when no state has been set yet.
   */
  readonly state: StateRecord | null;
  /**
   * Sets the FSM state to the specified value and data.
   * @param value - The new state value to transition to.
   * @param data  - Optional data to attach to the state.
   */
  set(value: StateValue, data?: StateData): Promise<void>;
  /**
   * Patches the current state by merging the given data.
   * @param data - Key-value pairs to merge into the state.
   */
  patch(data: StateData): Promise<void>;
  /**
   * Clears the current FSM state, setting it to null.
   * After calling this, the state property is null.
   */
  clear(): Promise<void>;
  /**
   * Returns true if the current state matches any given value.
   * @param values - One or more state values to check against.
   */
  is(...values: StateValue[]): boolean;
};

/**
 * A context flavor that extends GrammY's Context type by adding
 * an `fsm` property of type StateControllers for FSM management.
 */
export type FSMFlavor = { fsm: StateControllers };
