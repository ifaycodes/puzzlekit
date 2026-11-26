# PuzzleKit

**An extensible TypeScript engine for building puzzle games.**

PuzzleKit provides a reusable runtime and module architecture that allows developers to build different types of puzzle games without implementing the underlying game infrastructure from scratch.

Instead of being limited to predefined puzzle types, developers can use existing modules or create entirely new ones with custom mechanics.

## The Problem

Building a puzzle game involves more than implementing its rules. Developers also need to handle:

- Puzzle initialization and state management.
- Player actions and rule validation.
- Completion detection.
- Events and feedback.
- Session serialization and restoration.
- Integration with user interfaces.

These systems are often rebuilt for every new game, even when much of the underlying infrastructure is similar.

PuzzleKit separates the reusable infrastructure from individual puzzle mechanics, allowing developers to focus on building their games.

## Features

- **Extensible module architecture:** Create custom puzzle types without modifying the core engine.
- **Shared runtime:** Manage initialization, actions, state, completion, and sessions through a common lifecycle.
- **Declarative definitions:** Define supported puzzles through structured configurations.
- **Custom constraints:** Register reusable validation logic.
- **Framework-independent core:** Use the engine independently of a particular UI framework.
- **React integration:** Connect puzzle instances to React applications using the provided adapter.
- **Session serialization:** Save and restore puzzle sessions.

## Supported Demonstrations

PuzzleKit currently includes three puzzle modules:

| Puzzle | Implementation | Demonstrated capability |
|---|---|---|
| Sliding Puzzle | Declarative | Building a puzzle using an existing module |
| Nonogram | Declarative | Implementing custom rules and puzzle validation |
| Lights Out | Custom module | Implementing independent game mechanics |

These examples demonstrate how different puzzle types can use the same runtime while maintaining their own state structures and rules.

## Architecture

PuzzleKit has three main layers:

1. **Core:** Provides the runtime, module registry, state management, action dispatching, event handling, constraints, and session management.
2. **Puzzle Modules:** Define individual puzzle mechanics, initialization, action processing, and completion conditions.
3. **Adapters:** Connect the framework-independent core to UI frameworks such as React.

A simplified view:

```text
          Developer Application
                   |
             UI Adapter
                   |
              PuzzleKit
                Core
                   |
             Puzzle Runtime
                   |
          Registered Modules
          /        |        \
      Sliding   Nonogram   Lights Out
```

## Installation

PuzzleKit is currently under development and has not yet been published to npm.

For local development, clone the repository:

```bash
git clone https://github.com/ifaycodes/puzzlekit
cd puzzlekit
npm install
```

## Quick Start

A puzzle module defines how a puzzle is initialized, how actions are processed, and how completion is determined.

For example:

```ts
import { PuzzleRuntime } from "@puzzlekit/core";
import { slidingPuzzleModule } from "@puzzlekit/sliding-puzzle";

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

const state = puzzle.getState();

console.log(state);
```

The runtime handles the puzzle lifecycle while the registered module handles the game mechanics.

See [Creating a Puzzle Module](docs/creating-a-puzzle-module.md) to learn how to implement your own puzzle type.

## React Integration

PuzzleKit includes a React adapter for connecting puzzle instances to React applications.

```tsx
import { PuzzleProvider, usePuzzle, usePuzzleState } from "@puzzlekit/react";

function PuzzleBoard() {
  const puzzle = usePuzzle();
  const state = usePuzzleState();

  // Render the board and dispatch player actions.
  return <div>{/* Puzzle interface */}</div>;
}
```

See the React integration guide for more details.

## Project Structure

```text
puzzlekit/
├── packages/
│   ├── core/
│   ├── react/
│   └── modules/
│       ├── sliding-puzzle/
│       └── nonogram/
├── my_apps/
│   ├── json-definition-demo/
│   └── custom-module-registration/
│       └── lights-out/
├── examples/
└── docs/
```

## Documentation

- [Getting Started](docs/getting-started.md)
- [Core Concepts](docs/core-concepts.md)
- [Creating a Puzzle Module](docs/creating-a-puzzle-module.md)
- [Declarative Puzzles](docs/declarative-puzzle.md)
- [Constraints](docs/constraints.md)
- [React Integration](docs/react-integration.md)

## Development

Run the tests:

```bash
npm test
```

Run type checking:

```bash
npm run typecheck
```

Build the packages:

```bash
npm run build
```

Run the demo application:

```bash
cd my_apps/json-definition-demo/
or
cd my_apps/custom-module-registration/lights-out/

npm run dev
```

## Project Status

PuzzleKit is an experimental project developed for the Kiro Hackathon. Its current implementation focuses on the core runtime, extensible puzzle modules, declarative definitions, constraints, and React integration.

## License

MIT