# Declarative Puzzles

PuzzleKit supports declarative puzzle definitions, allowing developers to configure supported puzzle types without implementing a new module.

A declarative definition describes a puzzle's identity, module type, configuration, and optional constraints. The registered module remains responsible for its mechanics.

## 1. How It Works

A declarative puzzle definition provides the information needed to create a puzzle instance.

The runtime:

1. Validates the definition's structure.
2. Checks that the required module is registered.
3. Validates referenced constraints.
4. Creates the puzzle instance.
5. Delegates initialization to the registered module.

Declarative definitions do not replace puzzle modules. They provide a structured way to configure existing ones.

## 2. Definition Structure

A puzzle definition follows this structure:

```ts
interface PuzzleDefinition<TConfig = unknown> {
  id: string;
  type: string;
  version: string;
  config: TConfig;
  constraints?: ConstraintReference[];
}
```

The fields serve different purposes:

| Field | Description |
|---|---|
| `id` | Identifies the puzzle definition |
| `type` | Identifies the registered module to use |
| `version` | Specifies the definition version |
| `config` | Provides configuration to the module |
| `constraints` | References optional registered constraints |

## 3. Creating a Definition

For example, a Sliding Puzzle can be defined as:

```ts
const definition = {
  id: "sliding-puzzle-01",
  type: "sliding-puzzle",
  version: "1.0.0",
  config: {
    size: 3,
  },
};
```

The configuration is specific to the registered module.

A different module can have an entirely different configuration structure.

## 4. Creating a Puzzle from a Definition

Register the module with a runtime and pass the definition to `create()`:

```ts
import { PuzzleRuntime } from "@puzzlekit/core";
import { slidingPuzzleModule } from "./sliding-puzzle.module";

const runtime = new PuzzleRuntime();

runtime.registerModule(slidingPuzzleModule);

const puzzle = runtime.create({ definition });
```

The runtime validates the definition and delegates initialization to the registered module.

## 5. Loading JSON Definitions

Definitions can also be supplied as JSON.

For example:

```json
{
  "id": "sliding-puzzle-01",
  "type": "sliding-puzzle",
  "version": "1.0.0",
  "config": {
    "size": 3
  }
}
```

Use `createFromJSON()` to load a JSON definition:

```ts
const jsonDefinition = JSON.stringify({
  id: "sliding-puzzle-01",
  type: "sliding-puzzle",
  version: "1.0.0",
  config: {
    size: 3,
  },
});

const puzzle = runtime.createFromJSON(jsonDefinition);
```

The runtime validates the JSON definition before creating the puzzle.

Note that structural validation does not replace module-specific configuration validation. The module still validates the configuration it receives during initialization.

## 6. Adding Constraints

Definitions can reference registered constraints.

For example:

```ts
const definition = {
  id: "my-puzzle",
  type: "sliding-puzzle",
  version: "1.0.0",
  config: {
    size: 3,
  },
  constraints: [
    {
      id: "required-fields",
      config: {
        fields: ["size"],
      },
    },
  ],
};
```

The referenced constraint must be registered with the runtime before the definition is created.

See the [Constraints Guide](./constraints.md) for registration and implementation details.

## 7. When to Use Declarative Definitions

Declarative definitions are useful when:

- A puzzle can be expressed using an existing module.
- Developers need to create multiple configurations of the same puzzle type.
- Puzzle configurations need to be stored or loaded as JSON.
- Puzzle definitions need to be generated or modified independently of game logic.

When a puzzle introduces mechanics that existing modules cannot express, developers can implement a custom module instead.

## Declarative Definitions and Custom Modules

PuzzleKit supports both approaches through the same runtime.

- **Declarative definitions** configure existing puzzle modules.
- **Custom modules** introduce new puzzle mechanics.

This allows developers to reuse existing functionality while retaining the flexibility to build entirely new puzzle types.