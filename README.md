## grammy-fsm

Extension for the [grammY](https://grammy.dev) framework that adds **finite state machine (FSM)** capabilities over grammy-session feature:

- Simple finite state machine API on top of grammY
- Typed state keys and values
- Utilities for filtering updates by state
- Guards (`inState`, `whenState`) for declarative handler conditions
- Works seamlessly with `ctx.session`

---

### Installation

```bash
bun add grammy-fsm@github:kalutskii/grammy-fsm
# or
npm add grammy-fsm@github:kalutskii/grammy-fsm
```

---

### Quick start

```ts
import { Bot } from 'grammy';
import { session } from 'grammy';
import { createFSM, inState, whenState } from 'grammy-fsm';

const bot = new Bot('<TOKEN>');

// 1. Attach FSM-aware session
bot.use(session({ initial: () => ({}) }));
bot.use(createFSM());

// 2. Define states
const AUTH_STATE = 'auth';
const PROFILE_STATE = 'profile';

// 3. Handlers
bot.command('start', async (ctx) => {
  await ctx.fsm.set(AUTH_STATE);
  await ctx.reply('Welcome! Please enter your password:');
});

// Respond only if user is in AUTH_STATE
bot.on(
  'message:text',
  whenState(AUTH_STATE, async (ctx) => {
    if (ctx.message.text === 'secret') {
      await ctx.fsm.set(PROFILE_STATE);
      await ctx.reply('Authenticated! Now send me your profile info.');
    } else {
      await ctx.reply('Wrong password, try again.');
    }
  })
);

// Example guard using inState
bot.command(
  'whoami',
  inState(PROFILE_STATE, async (ctx) => {
    await ctx.reply(`You are in state: ${ctx.fsm.state}`);
  })
);

bot.start();
```

---

### API Overview

#### `createFSM()`

Middleware that attaches `ctx.fsm` object to the context.

- `ctx.fsm.state` → current state key (string or `null`)
- `ctx.fsm.set(stateKey: string)` → set new state
- `ctx.fsm.leave()` → reset state

---

#### `inState(stateKey, handler)`

Guard middleware. Runs handler only if user is **exactly** in given state.

```ts
bot.command(
  'profile',
  inState(PROFILE_STATE, async (ctx) => {
    await ctx.reply('You are editing your profile.');
  })
);
```

---

#### `whenState(stateKey, handler)`

Guard middleware for specific **event types**, more flexible than `inState`.

```ts
bot.on(
  'message:text',
  whenState(AUTH_STATE, async (ctx) => {
    // runs only if user is in AUTH_STATE
  })
);
```
