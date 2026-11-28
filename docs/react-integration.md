# React Integration

PuzzleKit provides a React adapter that makes it easier to integrate puzzle instances into React applications.

The adapter connects the framework-independent core runtime to React components, allowing them to access puzzle instances and respond to state changes.

## 1. Installation

The React adapter is available as a separate workspace package.

For local development within the PuzzleKit repository:

```bash
npm install
npm run build
```

The adapter requires React and `@puzzlekit/core` as peer dependencies.

PuzzleKit has not yet been published to npm, so external installation instructions will be added when public packages become available.

## 2. Creating a Puzzle Instance

Before connecting a puzzle to React, create an instance using the core runtime.

```tsx
import { PuzzleRuntime } from "@puzzlekit/core";
import { slidingPuzzleModule } from "./sliding-puzzle.module";

const runtime = new PuzzleRuntime();

runtime.registerModule(slidingPuzzleModule);

const puzzle = runtime.create({
  definition: {
    id: "my-sliding-puzzle",
    type: "sliding-puzzle",
    version: "1.0.0",
    config: {
      size: 3,
    },
  },
});
```

The resulting puzzle handle is passed to the React adapter.

## 3. PuzzleProvider

`PuzzleProvider` makes a puzzle instance available to its child components through React context.

Wrap the components that need access to the puzzle:

```tsx
import { PuzzleProvider } from "@puzzlekit/react";

function App() {
  return (
    <PuzzleProvider puzzle={puzzle}>
      <PuzzleBoard />
    </PuzzleProvider>
  );
}
```

Components inside the provider can now access the puzzle using the adapter's hooks.

## 4. usePuzzle

The `usePuzzle` hook provides access to the current puzzle handle.

It can be used to dispatch actions, reset the puzzle, check completion, and perform other puzzle operations.

```tsx
import { usePuzzle } from "@puzzlekit/react";

function PuzzleControls() {
  const puzzle = usePuzzle();

  const handleReset = () => {
    puzzle.reset();
  };

  return (
    <button onClick={handleReset}>
      Reset Puzzle
    </button>
  );
}
```

## 5. usePuzzleState

The `usePuzzleState` hook subscribes to puzzle state updates and causes the component to re-render when the state changes.

```tsx
import { usePuzzleState } from "@puzzlekit/react";
import type { SlidingPuzzleState } from "./sliding-puzzle.types";

function PuzzleBoard() {
  const state = usePuzzleState<SlidingPuzzleState>();

  return (
    <div>
      {state.tiles.map((tile, index) => (
        <div key={index}>
          {tile === 0 ? "" : tile}
        </div>
      ))}
    </div>
  );
}
```

The hook keeps the UI synchronized with the current puzzle state.

## 6. Dispatching Actions from Components

Components can use the puzzle handle to dispatch player actions.

For example, a Sliding Puzzle component can dispatch a tile movement:

```tsx
import {
  usePuzzle,
  usePuzzleState,
} from "@puzzlekit/react";

function PuzzleBoard() {
  const puzzle = usePuzzle();
  const state = usePuzzleState<SlidingPuzzleState>();

  const moveTile = (tileIndex: number) => {
    puzzle.dispatch({
      type: "MOVE_TILE",
      payload: {
        tileIndex,
      },
    });
  };

  return (
    <div>
      {state.tiles.map((tile, index) => (
        <button
          key={index}
          onClick={() => moveTile(index)}
        >
          {tile === 0 ? "" : tile}
        </button>
      ))}
    </div>
  );
}
```

The component expresses the player's intention. The puzzle module and runtime determine whether the action is accepted and how the state changes.

## 7. Using Multiple Components

The provider allows different components to interact with the same puzzle instance.

For example:

- A board component can render the current state.
- A controls component can reset the puzzle.
- A status component can display the move count or completion status.

Each component can access the same puzzle handle and subscribe to state updates independently.

## 8. Complete Example

A simple application can combine the provider and hooks as follows:

```tsx
function PuzzleBoard() {
  const puzzle = usePuzzle();
  const state = usePuzzleState<SlidingPuzzleState>();

  return (
    <div>
      <p>Moves: {state.moves}</p>

      <div className="board">
        {state.tiles.map((tile, index) => (
          <button
            key={index}
            onClick={() =>
              puzzle.dispatch({
                type: "MOVE_TILE",
                payload: { tileIndex: index },
              })
            }
          >
            {tile === 0 ? "" : tile}
          </button>
        ))}
      </div>

      <button onClick={() => puzzle.reset()}>
        Reset
      </button>
    </div>
  );
}

function App() {
  return (
    <PuzzleProvider puzzle={puzzle}>
      <PuzzleBoard />
    </PuzzleProvider>
  );
}
```

## 9. Framework Independence

The React adapter is an optional integration layer.

Developers who use other frontend frameworks or build environments can interact directly with the core runtime and puzzle handles.

This keeps PuzzleKit's game logic independent of its presentation layer.