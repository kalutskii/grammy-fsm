/**
 * String value that represents the current state of the FSM.
 * Any string can be used, e.g. "auth.awaitPhone" or "idle".
 */
export type StateValue = string;

/**
 * Optional data object associated with the current FSM state.
 * Can hold any key-value pairs relevant to the current state.
 */
export type StateData = Record<string, unknown> | undefined;

/**
 * Record that describes the current FSM state via its value
 * and an optional data object holding relevant information.
 */
export type StateRecord = { value: StateValue; data?: StateData };
