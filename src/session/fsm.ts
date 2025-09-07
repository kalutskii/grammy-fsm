import type { Context, MiddlewareFn } from 'grammy';
import { MemorySessionStorage, type SessionFlavor, type StorageAdapter, session } from 'grammy';

// State value, example: "auth:await_phone"
export type StateValue = string;
export type StateData = Record<string, unknown> | undefined;

// Record of FSM state
export interface FSMRecord {
  value: StateValue;
  data?: StateData;
}

// FSM controls interface
export interface FSMControls {
  readonly state: FSMRecord | null;
  set(value: StateValue, data?: StateData): Promise<void>;
  patch(data: Record<string, unknown>): Promise<void>;
  clear(): Promise<void>;
  is(...values: StateValue[]): boolean;
}

// Context with FSM controls
export type FSMFlavor<C extends Context = Context> = C & { fsm: FSMControls };

// GrammY-session envelope
export type FSMSessionEnvelope<U extends Record<string, unknown> = {}> = U & {
  _fsm: FSMRecord | null;
};

// GrammY awaits context WITHOUT session: Omit<C, "session">
export type SessionKeyFn<C extends Context = Context> = (ctx: Omit<C, 'session'>) => string | undefined | Promise<string | undefined>;

// Create FSM session options
export interface CreateFSMSessionOptions<C extends Context, U extends Record<string, unknown> = {}> {
  getSessionKey?: SessionKeyFn<C>;
  storage?: StorageAdapter<FSMSessionEnvelope<U>>;
  initialUserData?: () => U;
}

export function createFSMSession<C extends Context = Context, U extends Record<string, unknown> = {}>(
  opts: CreateFSMSessionOptions<C, U> = {}
): [MiddlewareFn<C & SessionFlavor<FSMSessionEnvelope<U>>>, MiddlewareFn<FSMFlavor<C & SessionFlavor<FSMSessionEnvelope<U>>>>] {
  // Either provided storage or a new default memory storage
  const storage = opts.storage ?? new MemorySessionStorage<FSMSessionEnvelope<U>>();

  const initial = (): FSMSessionEnvelope<U> => ({
    _fsm: null,
    ...(opts.initialUserData ? opts.initialUserData() : ({} as U)),
  });

  // GrammY session middleware
  const sessionOptions: Record<string, unknown> = {
    initial,
    storage,
  };

  if (opts.getSessionKey) {
    (sessionOptions as any).getSessionKey = opts.getSessionKey;
  }
  const sessionMw = session<FSMSessionEnvelope<U>, C>(sessionOptions as any);

  const fsmMw: MiddlewareFn<FSMFlavor<C & SessionFlavor<FSMSessionEnvelope<U>>>> = async (ctx, next) => {
    let current: FSMRecord | null = ctx.session._fsm ?? null;

    const controls: FSMControls = {
      get state() {
        return current;
      },
      async set(value, data) {
        current = { value, ...(data ? { data } : {}) };
        ctx.session._fsm = current;
      },
      async patch(data) {
        if (!current) current = { value: '', data: {} };
        current.data = { ...(current.data ?? {}), ...data };
        ctx.session._fsm = current;
      },
      async clear() {
        current = null;
        ctx.session._fsm = null;
      },
      is(...values) {
        return !!current && values.includes(current.value);
      },
    };

    (ctx as any).fsm = controls;
    await next();
  };

  return [sessionMw, fsmMw];
}
