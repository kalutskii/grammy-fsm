# grammy-fsm

Lightweight [grammY](https://grammy.dev) plugin that adds finite state machine
(FSM) support on top of the built-in session middleware.

---

## Features

- Minimal, typed FSM API attached directly to `ctx.fsm`
- Store a state value and arbitrary typed data per session
- `onState()` guard middleware for declarative, state-scoped handlers
- Zero runtime dependencies beyond grammY itself

---

## Installation

```bash
# npm / yarn / pnpm
npm install @kalutskii/grammy-fsm

# bun
bun add @kalutskii/grammy-fsm
```

> Requires `grammy >= 1.38` and `typescript >= 5.9` as peer dependencies.

---

## Quick start

```ts
import { FSMFlavor, StateSession, onState, stateMiddleware } from '@kalutskii/grammy-fsm';
import { Bot, session } from 'grammy';

// 1. Extend the context type
type MyContext = FSMFlavor;

const bot = new Bot<MyContext>('<TOKEN>');

// 2. Register session and FSM middleware (order matters)
bot.use(session<StateSession>({ initial: () => ({ _state: null }) }));
bot.use(stateMiddleware());

// 3. Define states as plain constants
const State = {
  AwaitPassword: 'auth.awaitPassword',
  AwaitProfile: 'auth.awaitProfile',
} as const;

// 4. Set state from any handler
bot.command('start', async (ctx) => {
  await ctx.fsm.set(State.AwaitPassword);
  await ctx.reply('Welcome! Please enter your password:');
});

// 5. React only when the user is in a specific state
bot.on(
  'message:text',
  onState(State.AwaitPassword, async (ctx) => {
    if (ctx.message.text === 'secret') {
      await ctx.fsm.set(State.AwaitProfile, { attempts: 0 });
      await ctx.reply('Authenticated! Now send your name:');
    } else {
      await ctx.fsm.patch({ attempts: (ctx.fsm.state?.data?.attempts ?? 0) + 1 });
      await ctx.reply('Wrong password, try again.');
    }
  })
);

bot.on(
  'message:text',
  onState(State.AwaitProfile, async (ctx) => {
    await ctx.fsm.clear();
    await ctx.reply(`Nice to meet you, ${ctx.message.text}!`);
  })
);

bot.start();
```

---

## API

### `stateMiddleware()`

Creates middleware that injects `ctx.fsm` into every update context.
Must be registered **after** grammY's `session()` middleware.

```ts
bot.use(session<StateSession>({ initial: () => ({ _state: null }) }));
bot.use(stateMiddleware());
```

---

### `ctx.fsm`

The FSM controller available in every handler once the middleware is applied.

| Member                      | Description                                           |
| --------------------------- | ----------------------------------------------------- |
| `ctx.fsm.state`             | Current `StateRecord` (`{ value, data? }`) or `null`  |
| `ctx.fsm.set(value, data?)` | Transition to a new state, optionally with data       |
| `ctx.fsm.patch(data)`       | Merge data into the current state without changing it |
| `ctx.fsm.clear()`           | Reset the state to `null`                             |
| `ctx.fsm.is(...values)`     | Returns `true` if the current state matches any value |

---

### `onState(values, handler)`

Guard middleware that executes `handler` only when the current FSM state
matches one of the given values; otherwise calls `next()` transparently.

```ts
// Single value
bot.on('message:text', onState('auth.awaitPassword', handler));

// Multiple values
bot.on('message:text', onState(['step.one', 'step.two'], handler));
```

---

## Types

| Type               | Description                                              |
| ------------------ | -------------------------------------------------------- |
| `StateValue`       | `string` — the state identifier                          |
| `StateData`        | `Record<string, unknown> \| undefined` — attached data   |
| `StateRecord`      | `{ value: StateValue; data?: StateData }` — full record  |
| `StateSession`     | Session shape: `{ _state: StateRecord \| null }`         |
| `FSMFlavor<C>`     | Context flavor that adds `ctx.fsm` to any grammY context |
| `StateControllers` | Interface that `ctx.fsm` implements                      |

---

## License

MIT
