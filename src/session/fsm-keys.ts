import type { Context } from 'grammy';

import type { SessionKeyFn } from './fsm';

// Keys by chat.id
export const chatSessionKey: SessionKeyFn = <C extends Context>(ctx: C) => (ctx.chat?.id ? `chat:${ctx.chat.id}` : undefined);

// Keys by user.id (in any chat)
export const userSessionKey: SessionKeyFn = <C extends Context>(ctx: C) => (ctx.from?.id ? `user:${ctx.from.id}` : undefined);

// Keys by chat.id and user.id (useful for groups)
export const chatUserSessionKey: SessionKeyFn = <C extends Context>(ctx: C) =>
  ctx.chat?.id && ctx.from?.id ? `chat:${ctx.chat.id}:user:${ctx.from.id}` : undefined;

export type { SessionKeyFn };
