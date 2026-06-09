import type { StateControllers } from './state.api.types';
import type { StateData, StateRecord, StateValue } from './state.types';

/**
 * Implements the StateControllers interface to manage and
 * interact with the FSM state (see state.api.types.ts).
 */
export class StateController implements StateControllers {
  constructor(
    private readonly getter: () => StateRecord | null,
    private readonly setter: (state: StateRecord | null) => void
  ) {}

  get state(): StateRecord | null {
    return this.getter();
  }

  async set(value: StateValue, data?: StateData): Promise<void> {
    this.setter(data ? { value, data } : { value });
  }

  async patch(data: StateData): Promise<void> {
    const current = this.getter();

    this.setter({
      value: current?.value ?? '',
      data: { ...(current?.data ?? {}), ...data },
    });
  }

  async clear(): Promise<void> {
    this.setter(null);
  }

  is(...values: StateValue[]): boolean {
    return !!this.state && values.includes(this.state.value);
  }
}
