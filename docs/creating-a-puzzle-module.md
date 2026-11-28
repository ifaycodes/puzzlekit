# Creating a Custom Puzzle Module

PuzzleKit allows developers to create custom puzzle types without modifying the core engine.

A puzzle module defines the mechanics of a puzzle: how it is initialized, which actions players can perform, how those actions affect its state, and when the puzzle is complete.

This guide walks through creating and registering a custom module using a Number Guessing game.

## 1. Understand the Module Contract

Every PuzzleKit module implements the `PuzzleModule` interface:

```ts
interface PuzzleModule<TConfig, TState, TActionPayload> {
  id: string;
  version: string;
  initialize(config: TConfig): TState;
  processAction(
    state: TState,
    action: PuzzleAction<TActionPayload>,
    config: TConfig
  ): ActionResult<TState>;
  isComplete(state: TState, config: TConfig): boolean;
  serialize(state: TState): string;
  deserialize(data: string): TState;
}
```

The methods have distinct responsibilities:

- `initialize`: Creates the initial puzzle state from its configuration.
- `processAction`: Validates and processes player actions, returning an updated state or a rejection.
- `isComplete`: Determines whether the puzzle has reached its completion condition.
- `serialize`: Converts the state into a string for storage.
- `deserialize`: Restores state from serialized data.

The generic parameters represent the module's configuration, state, and action payload.

## 2. Define the Puzzle Types

Start by defining the configuration, state, and action payload.

```ts
interface NumberGuessingConfig {
  target: number;
  maxAttempts: number;
}

interface NumberGuessingState {
  attempts: number;
  maxAttempts: number;
  solved: boolean;
}

interface GuessPayload {
  value: number;
}
```

Configuration contains information needed to initialize and operate the puzzle. State contains information that changes as the player interacts with it. Action payloads describe the data required to process player actions.

## 3. Implement the Puzzle Module

```ts
import type { PuzzleModule } from "@puzzlekit/core";

const numberGuessingModule: PuzzleModule<
  NumberGuessingConfig,
  NumberGuessingState,
  GuessPayload
> = {
  id: "number-guessing",
  version: "1.0.0",

  initialize(config) {
    if (!Number.isInteger(config.target) ||
        config.target < 1 ||
        config.target > 100) {
      throw new Error("Target must be an integer between 1 and 100.");
    }

    if (!Number.isInteger(config.maxAttempts) ||
        config.maxAttempts < 1) {
      throw new Error("Maximum attempts must be a positive integer.");
    }

    return {
      attempts: 0,
      maxAttempts: config.maxAttempts,
      solved: false,
    };
  },

  processAction(state, action, config) {
    if (action.type !== "GUESS") {
      return {
        accepted: false,
        reason: "Unknown action type.",
      };
    }

    const { value } = action.payload;

    if (!Number.isInteger(value) || value < 1 || value > 100) {
      return {
        accepted: false,
        reason: "Guess must be an integer between 1 and 100.",
      };
    }

    if (state.solved || state.attempts >= state.maxAttempts) {
      return {
        accepted: false,
        reason: "No more guesses are allowed.",
      };
    }

    const solved = value === config.target;

    return {
      accepted: true,
      state: {
        ...state,
        attempts: state.attempts + 1,
        solved,
      },
    };
  },

  isComplete(state) {
    return state.solved || state.attempts >= state.maxAttempts;
  },

  serialize(state) {
    return JSON.stringify(state);
  },

  deserialize(data) {
    return JSON.parse(data) as NumberGuessingState;
  },
};
```

### Important implementation considerations

**Keep action processing immutable.** Do not modify the incoming state directly. Return a new state when an action is accepted.

**Validate player actions.** Check action types, payload values, and puzzle-specific rules before accepting an action.

**Keep configuration separate from player state.** The runtime passes the original configuration as the third argument to `processAction`. This allows modules to use information such as a hidden target without placing it in the player-visible state.

**Return an ActionResult.** Accepted actions must return the updated state. Rejected actions should return a reason and leave the original state unchanged.

## 4. Register the Module

Create a runtime and register your module.

```ts
import { PuzzleRuntime } from "@puzzlekit/core";

const runtime = new PuzzleRuntime();

runtime.registerModule(numberGuessingModule);
```

Registration makes the module available to the runtime. It does not create a puzzle instance.

## 5. Create a Puzzle Instance

Pass a definition containing the module type and its configuration.

```ts
const puzzle = runtime.create<NumberGuessingState>({
  definition: {
    id: "guessing-game",
    type: "number-guessing",
    version: "1.0.0",
    config: {
      target: 42,
      maxAttempts: 5,
    },
  },
});
```

The runtime resolves the registered module using the definition's `type` and calls its `initialize` method.

## 6. Dispatch Player Actions

Players interact with the puzzle by dispatching actions.

```ts
puzzle.dispatch({
  type: "GUESS",
  payload: { value: 30 },
});

puzzle.dispatch({
  type: "GUESS",
  payload: { value: 42 },
});
```

The runtime passes each action to the module, handles the result, updates the state when accepted, and checks for completion.

## 7. Read State and Completion Status

Use the puzzle handle to access the current state and completion status.

```ts
console.log(puzzle.getState());
console.log("Completed:", puzzle.isComplete());
```

The resulting state is:

```ts
{
  attempts: 2,
  maxAttempts: 5,
  solved: true
}
```

The runtime also exposes events that applications can subscribe to for responding to puzzle activity.

## 8. Save and Restore Puzzle Sessions

PuzzleKit provides session serialization through the puzzle handle.

```ts
const savedSession = puzzle.serialize();
```

To restore the session:

```ts
const restoredPuzzle =
  runtime.restore<NumberGuessingState>(savedSession);
```

The corresponding module must be registered with the runtime before restoration. Its ID and version must match the saved session.

## 9. Test Your Module

Test your module independently of the runtime and then test its integration with the runtime.

Useful test cases include:

- Initial state is created correctly.
- Invalid configuration is rejected.
- Valid actions update state correctly.
- Invalid actions are rejected.
- Rejected actions do not mutate the original state.
- Completion is detected correctly.
- Serialization and deserialization preserve state.
- Runtime registration and dispatch work as expected.

## 10. What You Are Responsible For

PuzzleKit provides the shared runtime, module registration, state management, action dispatching, event handling, completion checking, session serialization, primitives, and optional constraints.

As a module developer, you are responsible for:

- Defining your puzzle's configuration and state.
- Implementing its mechanics and action processing.
- Validating puzzle-specific rules.
- Defining its completion conditions.
- Implementing serialization and deserialization.

You do not need to modify PuzzleKit core to introduce a new puzzle type.

**The central idea:** PuzzleKit manages the puzzle lifecycle; your module defines what makes your puzzle unique.