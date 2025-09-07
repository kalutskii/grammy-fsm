import { Context, StorageAdapter, MiddlewareFn, SessionFlavor } from 'grammy';

type StateValue = string;
type StateData = Record<string, unknown> | undefined;
interface FSMRecord {
    value: StateValue;
    data?: StateData;
}
interface FSMControls {
    readonly state: FSMRecord | null;
    set(value: StateValue, data?: StateData): Promise<void>;
    patch(data: Record<string, unknown>): Promise<void>;
    clear(): Promise<void>;
    is(...values: StateValue[]): boolean;
}
type FSMFlavor<C extends Context = Context> = C & {
    fsm: FSMControls;
};
type FSMSessionEnvelope<U extends Record<string, unknown> = {}> = U & {
    _fsm: FSMRecord | null;
};
type SessionKeyFn<C extends Context = Context> = (ctx: Omit<C, 'session'>) => string | undefined | Promise<string | undefined>;
interface CreateFSMSessionOptions<C extends Context, U extends Record<string, unknown> = {}> {
    getSessionKey?: SessionKeyFn<C>;
    storage?: StorageAdapter<FSMSessionEnvelope<U>>;
    initialUserData?: () => U;
}
declare function createFSMSession<C extends Context = Context, U extends Record<string, unknown> = {}>(opts?: CreateFSMSessionOptions<C, U>): [MiddlewareFn<C & SessionFlavor<FSMSessionEnvelope<U>>>, MiddlewareFn<FSMFlavor<C & SessionFlavor<FSMSessionEnvelope<U>>>>];

declare function whenState<C extends FSMFlavor>(values: StateValue[] | StateValue, handler: MiddlewareFn<C>): MiddlewareFn<C>;

declare function inState<C extends FSMFlavor>(...values: StateValue[]): (ctx: C) => boolean;

declare const chatSessionKey: SessionKeyFn;
declare const userSessionKey: SessionKeyFn;
declare const chatUserSessionKey: SessionKeyFn;

export { type FSMControls, type FSMFlavor, type FSMRecord, type FSMSessionEnvelope, type SessionKeyFn, type StateData, type StateValue, chatSessionKey, chatUserSessionKey, createFSMSession, inState, userSessionKey, whenState };
