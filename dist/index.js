// src/session/fsm.ts
import { MemorySessionStorage, session } from "grammy";
function createFSMSession(opts = {}) {
  const storage = opts.storage ?? new MemorySessionStorage();
  const initial = () => ({
    _fsm: null,
    ...opts.initialUserData ? opts.initialUserData() : {}
  });
  const sessionOptions = {
    initial,
    storage
  };
  if (opts.getSessionKey) {
    sessionOptions.getSessionKey = opts.getSessionKey;
  }
  const sessionMw = session(sessionOptions);
  const fsmMw = async (ctx, next) => {
    let current = ctx.session._fsm ?? null;
    const controls = {
      get state() {
        return current;
      },
      async set(value, data) {
        current = { value, ...data ? { data } : {} };
        ctx.session._fsm = current;
      },
      async patch(data) {
        if (!current) current = { value: "", data: {} };
        current.data = { ...current.data ?? {}, ...data };
        ctx.session._fsm = current;
      },
      async clear() {
        current = null;
        ctx.session._fsm = null;
      },
      is(...values) {
        return !!current && values.includes(current.value);
      }
    };
    ctx.fsm = controls;
    await next();
  };
  return [sessionMw, fsmMw];
}

// src/guards/when-state.ts
function whenState(values, handler) {
  const list = Array.isArray(values) ? values : [values];
  return async (ctx, next) => {
    if (ctx.fsm?.is(...list)) return handler(ctx, next);
    return next();
  };
}

// src/guards/in-state.ts
function inState(...values) {
  return (ctx) => ctx.fsm?.is(...values) ?? false;
}

// src/session/fsm-keys.ts
var chatSessionKey = (ctx) => ctx.chat?.id ? `chat:${ctx.chat.id}` : void 0;
var userSessionKey = (ctx) => ctx.from?.id ? `user:${ctx.from.id}` : void 0;
var chatUserSessionKey = (ctx) => ctx.chat?.id && ctx.from?.id ? `chat:${ctx.chat.id}:user:${ctx.from.id}` : void 0;
export {
  chatSessionKey,
  chatUserSessionKey,
  createFSMSession,
  inState,
  userSessionKey,
  whenState
};
//# sourceMappingURL=index.js.map