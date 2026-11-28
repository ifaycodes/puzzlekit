# Requirements Document

## Introduction

PuzzleKit is a TypeScript toolkit for building and playing puzzles. It delivers a framework-independent core runtime that hosts pluggable puzzle modules, a React adapter that binds puzzle state to components, and ready-made sliding puzzle and nonogram modules. Developers create puzzle instances from definitions supplied as objects or JSON, play them through a handle, observe lifecycle events, validate actions and state with constraints, and save and restore sessions.

The goals of PuzzleKit are:

- A single, ordered action pipeline that keeps module rules, constraints, state, events, and completion consistent.
- An extension path that lets developers add new puzzle types without changing the core.
- Isolated puzzle state that callers cannot corrupt by mutation.
- Repeatable build, type-check, and test commands for contributors.

## Glossary

- **Runtime**: The `PuzzleRuntime` class, the public facade of the engine.
- **Handle**: A `PuzzleHandle` object returned by the Runtime that exposes operations on one puzzle instance.
- **Module**: An object implementing the `PuzzleModule` contract (`id`, `version`, `initialize`, `processAction`, `isComplete`, `serialize`, `deserialize`).
- **Module_Registry**: The `ModuleRegistry` that stores Modules by `id`.
- **Instance_Manager**: The `InstanceManager` that stores instances, their Modules, and their definitions, keyed by instance id.
- **Instance**: A `PuzzleInstance` record with `id`, `definitionId`, `moduleId`, `status`, `createdAt`, and `updatedAt`.
- **Status**: One of `ready`, `active`, or `completed`.
- **State_Manager**: The `StateManager` that stores one state value per instance id.
- **Definition**: A `PuzzleDefinition` with `id`, `type`, `version`, `config`, and optional `constraints`.
- **Definition_Validator**: The `validatePuzzleDefinition` function.
- **Constraint**: An object with `id`, optional `description`, `target` (`state`, `action`, or `element`), and a `validate` function returning a `ConstraintResult`.
- **Constraint_Registry**: The `ConstraintRegistry` that stores Constraints by `id`. The Runtime exposes it as the public property `constraintRegistry`.
- **Constraint_Engine**: The `ConstraintEngine` that evaluates Constraint references against a context.
- **Constraint_Reference**: An object `{ id, config? }` listed in a Definition's `constraints`.
- **Built_In_Constraint**: One of `unique-values`, `required-fields`, or `valid-range`.
- **Action**: A `PuzzleAction` with `type` and `payload`.
- **Action_Result**: Either an accepted result (`accepted: true`, `state`, optional `feedback` and `events`) or a rejected result (`accepted: false`, `reason`, optional `feedback` and `events`).
- **Action_Dispatcher**: The `ActionDispatcher` that runs the dispatch pipeline.
- **Event_Manager**: The `EventManager` that delivers events to per-instance listeners and global listeners.
- **Puzzle_Event**: An object with `type`, `instanceId`, `timestamp`, and `payload`.
- **Completion_Checker**: The `CompletionChecker` that evaluates `Module.isComplete`.
- **Session_Serializer**: The `SessionSerializer` that produces and restores session strings.
- **Session**: The JSON object `{ formatVersion: 1, definition, instance, moduleVersion, state }` where `state` is the Module's serialized string.
- **Sliding_Puzzle_Module**: The Module with id `sliding-puzzle` and version `1.0.0`.
- **Nonogram_Module**: The Module with id `nonogram` and version `1.0.0`.
- **Lights_Out_Module**: The example custom Module with id `lights-out` and version `1.0.0`.
- **React_Adapter**: The `@puzzlekit/react` package exporting `PuzzleProvider`, `usePuzzle`, and `usePuzzleState`.
- **Primitives**: Type and helper definitions for grid, spatial, words, and common concepts exported from `@puzzlekit/core`.
- **Workspace**: The npm workspace root of the repository.

## Requirements

### Requirement 1: Module Registration

**User Story:** As a developer, I want to register puzzle modules with the runtime, so that definitions can refer to them by type.

#### Acceptance Criteria

1. WHEN `registerModule` is called with a Module whose `id` is not registered, THE Module_Registry SHALL store the Module under its `id`.
2. IF `registerModule` is called with a Module whose `id` is already registered, THEN THE Module_Registry SHALL throw an error with the message `Module "<id>" is already registered.`
3. IF a Module is requested by an `id` that is not registered, THEN THE Module_Registry SHALL throw an error with the message `Module "<id>" is not registered.`
4. THE Module_Registry SHALL provide `has(id)` returning whether the `id` is registered.
5. THE Module_Registry SHALL provide `unregister(id)` returning `true` when a Module was removed and `false` otherwise.

### Requirement 2: Programmatic Puzzle Creation

**User Story:** As a developer, I want to create puzzle instances from a definition object, so that I can play a puzzle through a handle.

#### Acceptance Criteria

1. WHEN `create({ definition })` is called with a Definition whose `type` matches a registered Module `id`, THE Runtime SHALL return a Handle bound to a new Instance.
2. WHEN an Instance is created, THE Instance_Manager SHALL assign the Instance an id generated by `crypto.randomUUID()`.
3. WHEN an Instance is created, THE Instance_Manager SHALL set `definitionId` to the Definition `id`, `moduleId` to the Module `id`, `status` to `ready`, and `createdAt` and `updatedAt` to the current time in milliseconds.
4. WHEN an Instance is created, THE Instance_Manager SHALL call `Module.initialize(definition.config)` and store the returned state in the State_Manager.
5. IF the Definition `type` does not match a registered Module, THEN THE Runtime SHALL throw the Module_Registry "is not registered" error.
6. IF `Module.initialize` throws, THEN THE Runtime SHALL propagate the thrown error to the caller.
7. WHEN `create` is called twice with the same Definition, THE Runtime SHALL return two Handles bound to distinct Instances with independent state.

### Requirement 3: JSON Puzzle Creation

**User Story:** As a developer, I want to create puzzles from JSON text, so that puzzles can be authored as data.

#### Acceptance Criteria

1. WHEN `createFromJSON(json)` is called with valid JSON text describing a valid Definition, THE Runtime SHALL create and return a Handle for that Definition.
2. IF `json` is not parseable JSON, THEN THE Runtime SHALL throw an error with the message `Invalid JSON: could not parse puzzle definition`.
3. WHEN `json` is parsed, THE Runtime SHALL validate the result with the Definition_Validator before creating an Instance.
4. WHEN a validated Definition lists Constraint_References, THE Runtime SHALL look up each referenced `id` in the Constraint_Registry before creating an Instance.
5. IF a validated Definition references a Constraint `id` that is not registered, THEN THE Runtime SHALL throw the Constraint_Registry "is not registered" error and SHALL NOT create an Instance.

### Requirement 4: Definition Validation

**User Story:** As a developer, I want definitions validated structurally, so that malformed data is rejected with clear messages.

#### Acceptance Criteria

1. IF the input is not a non-null, non-array object, THEN THE Definition_Validator SHALL throw `Puzzle definition must be an object.`
2. IF `id` is not a string containing a non-whitespace character, THEN THE Definition_Validator SHALL throw `Puzzle definition must have a valid id.`
3. IF `type` is not a string containing a non-whitespace character, THEN THE Definition_Validator SHALL throw `Puzzle definition must have a valid type.`
4. IF `version` is not a string containing a non-whitespace character, THEN THE Definition_Validator SHALL throw `Puzzle definition must have a valid version.`
5. IF `config` is not a non-null, non-array object, THEN THE Definition_Validator SHALL throw `Puzzle definition config must be an object.`
6. IF `constraints` is present and is not an array, THEN THE Definition_Validator SHALL throw `Constraints must be an array.`
7. IF an element of `constraints` is not a non-null, non-array object, THEN THE Definition_Validator SHALL throw `Each constraint must be an object.`
8. IF an element of `constraints` has an `id` that is not a string containing a non-whitespace character, THEN THE Definition_Validator SHALL throw `Each constraint must have a valid id.`
9. WHEN validation succeeds, THE Definition_Validator SHALL return an object containing only `id`, `type`, `version`, `config`, and `constraints`, with each Constraint_Reference reduced to `id` and, when defined, `config`.

### Requirement 5: Action Dispatch Pipeline

**User Story:** As a developer, I want a single, ordered pipeline for player actions, so that rules, constraints, state, events, and completion stay consistent.

#### Acceptance Criteria

1. WHEN `Handle.dispatch(action)` is called, THE Action_Dispatcher SHALL execute these steps in order: completed-status check, action Constraints, `Module.processAction`, state Constraints, state update, event emission, completion check.
2. IF the Instance Status is `completed`, THEN THE Action_Dispatcher SHALL return `{ accepted: false, reason: "This puzzle has already been completed." }` and emit an `action:rejected` event.
3. WHEN the Definition lists Constraint_References, THE Action_Dispatcher SHALL evaluate those whose Constraint `target` is `action` against the context `{ state, action }`.
4. IF any action Constraint returns `valid: false`, THEN THE Action_Dispatcher SHALL return a rejected Action_Result whose `reason` is the failing messages joined by a single space, using `Action constraint failed.` for a failing result without a message, and SHALL emit an `action:rejected` event.
5. WHEN action Constraints pass, THE Action_Dispatcher SHALL call `Module.processAction(currentState, action, definition.config)`.
6. IF `Module.processAction` returns a rejected Action_Result, THEN THE Action_Dispatcher SHALL emit the Module's events, emit `action:rejected` with payload `{ action, reason }`, leave state and Status unchanged, and return the Module's result.
7. WHEN `Module.processAction` returns an accepted Action_Result, THE Action_Dispatcher SHALL evaluate state Constraints against the proposed new state.
8. IF any state Constraint returns `valid: false`, THEN THE Action_Dispatcher SHALL return a rejected Action_Result whose `reason` is the failing messages joined by a single space, using `State constraint failed.` for a failing result without a message, emit an `action:rejected` event, and leave state unchanged.
9. WHEN all state Constraints pass, THE Action_Dispatcher SHALL store the new state, set the Instance Status to `active`, and set `updatedAt` to the current time.
10. WHEN a state update is stored, THE Action_Dispatcher SHALL emit, in order, each Module event, `action:accepted` with payload `{ action }`, and `state:updated` with payload `{ state }`.
11. WHEN the events of an accepted action have been emitted, THE Action_Dispatcher SHALL run the Completion_Checker for the Instance.
12. THE Action_Dispatcher SHALL return the Module's accepted Action_Result, including `feedback`, to the caller.
13. IF a Constraint_Reference lists an unregistered `id` during dispatch, THEN THE Action_Dispatcher SHALL propagate the Constraint_Registry error to the caller.
14. WHEN a Module emits events in an Action_Result, THE Action_Dispatcher SHALL wrap each as a Puzzle_Event with the Instance id, the current timestamp, and the Module-provided `type` and `payload`.

### Requirement 6: Constraints

**User Story:** As a developer, I want declarative and custom constraints, so that I can validate actions and state without modifying modules.

#### Acceptance Criteria

1. THE Runtime SHALL pre-register the Built_In_Constraints `unique-values`, `required-fields`, and `valid-range` in its Constraint_Registry, each with `target` equal to `state`.
2. IF `Constraint_Registry.register` is called with an `id` that is already registered, THEN THE Constraint_Registry SHALL throw `Constraint "<id>" is already registered.`
3. IF `Constraint_Registry.get` is called with an unregistered `id`, THEN THE Constraint_Registry SHALL throw `Constraint "<id>" is not registered.`
4. THE Runtime SHALL provide `registerConstraint(constraint)` that registers the Constraint in the Constraint_Registry.
5. WHEN `Constraint_Engine.validateForTarget(target, context, references)` is called, THE Constraint_Engine SHALL evaluate only the referenced Constraints whose `target` equals `target`, passing each Constraint_Reference `config`.
6. WHEN `Constraint_Engine.validate(target, context, references)` is called and a referenced Constraint has a different `target`, THE Constraint_Engine SHALL throw `Constraint "<id>" targets "<actual>", not "<target>".`
7. THE Constraint_Engine SHALL provide `isValid(results)` returning `true` only when every result has `valid: true`.
8. WHEN `path` is configured for a Built_In_Constraint, THE Built_In_Constraint SHALL resolve the value by following the dot-separated keys from the context, resolving to `undefined` when a key is missing or the current value is not an object.
9. WHEN `path` is omitted, THE Built_In_Constraint SHALL evaluate the whole context.
10. WHEN the value at `path` is an array, THE `unique-values` Constraint SHALL return `valid: true` if and only if the array has no duplicates under `Set` equality.
11. IF the value at `path` is not an array, THEN THE `unique-values` Constraint SHALL return `valid: false` with message `Expected an array for unique-values.`
12. WHEN the value at `path` is an object, THE `required-fields` Constraint SHALL return `valid: true` if and only if every name in `config.fields` is an own property of the object, and otherwise SHALL return the message `Missing required fields: <names>.`
13. IF the value at `path` is not an object, THEN THE `required-fields` Constraint SHALL return `valid: false` with message `Expected an object for required-fields.`
14. IF `config.fields` is not an array of strings, THEN THE `required-fields` Constraint SHALL return `valid: false` with message `required-fields needs a fields array.`
15. WHEN the value at `path` is a finite number, THE `valid-range` Constraint SHALL return `valid: true` if and only if the number is at least `min` (when defined) and at most `max` (when defined).
16. IF the value at `path` is not a finite number, THEN THE `valid-range` Constraint SHALL return `valid: false` with message `Expected a finite number for valid-range.`
17. IF `min` or `max` is defined and is not a number, THEN THE `valid-range` Constraint SHALL return `valid: false` with message `Range boundaries must be numbers.`
18. IF `min` is greater than `max`, THEN THE `valid-range` Constraint SHALL return `valid: false` with message `Minimum cannot exceed maximum.`

### Requirement 7: Events

**User Story:** As a developer, I want to observe puzzle lifecycle events, so that a UI can react to changes.

#### Acceptance Criteria

1. WHEN `Handle.subscribe(listener)` is called, THE Event_Manager SHALL deliver every event whose `instanceId` equals the Handle's Instance id to the listener, and SHALL return an unsubscribe function.
2. WHEN `Runtime.subscribe(listener)` is called, THE Event_Manager SHALL deliver events from all Instances to the listener, and SHALL return an unsubscribe function.
3. WHEN an event is emitted, THE Event_Manager SHALL call per-instance listeners before global listeners.
4. WHEN an unsubscribe function is called, THE Event_Manager SHALL stop delivering events to that listener, and SHALL remove the per-instance listener set when it becomes empty.
5. THE Event_Manager SHALL provide `clear(instanceId)` removing all per-instance listeners for that id and `clearAll()` removing all per-instance and global listeners.
6. THE Runtime SHALL emit the event types `action:accepted`, `action:rejected`, `state:updated`, `puzzle:completed`, and `puzzle:reset` during dispatch, completion, and reset.
7. THE Event_Manager SHALL call listeners synchronously.

### Requirement 8: Completion Detection

**User Story:** As a developer, I want the runtime to detect completion, so that finished puzzles are locked and announced.

#### Acceptance Criteria

1. WHEN `Handle.isComplete()` is called on an Instance whose Status is `completed`, THE Completion_Checker SHALL return `true` without calling the Module.
2. WHEN the Completion_Checker evaluates an Instance whose Status is not `completed`, THE Completion_Checker SHALL call `Module.isComplete(state, definition.config)` with the current state and the Definition `config`.
3. WHEN `Module.isComplete` returns `true`, THE Completion_Checker SHALL set the Instance Status to `completed`, update `updatedAt`, and emit `puzzle:completed` with an empty payload.
4. WHEN `Module.isComplete` returns `false`, THE Completion_Checker SHALL leave Status unchanged and return `false`.
5. WHEN `Handle.isComplete()` is called, THE Handle SHALL run the Completion_Checker, so that a call can change Status and emit `puzzle:completed`.
6. WHILE the Instance Status is `completed`, THE Action_Dispatcher SHALL reject all Actions (see Requirement 5, criterion 2).
7. THE Completion_Checker SHALL emit `puzzle:completed` at most once per Instance between resets.
8. WHEN an accepted Action completes a Nonogram puzzle driven through the Runtime, THE Completion_Checker SHALL pass `definition.config.solution` to the Nonogram_Module, set the Instance Status to `completed`, and emit `puzzle:completed` without throwing.

### Requirement 9: State Isolation

**User Story:** As a developer, I want state to be isolated from callers, so that external mutation cannot corrupt a puzzle.

#### Acceptance Criteria

1. WHEN the State_Manager stores a state, THE State_Manager SHALL store a `structuredClone` of the value.
2. WHEN the State_Manager returns a state, THE State_Manager SHALL return a `structuredClone` of the stored value.
3. WHEN a caller mutates the object returned by `Handle.getState()`, THE Runtime SHALL leave the stored state unchanged.
4. IF `State_Manager.get` is called for an unknown instance id, THEN THE State_Manager SHALL throw `State for puzzle instance "<id>" was not found.`
5. IF `State_Manager.update` is called for an unknown instance id, THEN THE State_Manager SHALL throw `Cannot update state: instance "<id>" does not exist.`
6. IF a state contains a value that `structuredClone` cannot copy, THEN THE State_Manager SHALL propagate the `structuredClone` error.
7. IF `Instance_Manager.get` is called for an unknown instance id, THEN THE Instance_Manager SHALL throw `Puzzle instance "<id>" was not found.`

### Requirement 10: Session Serialization and Restore

**User Story:** As a developer, I want to save and restore puzzle sessions, so that players can resume play.

#### Acceptance Criteria

1. WHEN `Handle.serialize()` is called, THE Session_Serializer SHALL return a JSON string of a Session with `formatVersion` equal to `1`, the stored Definition, the Instance record, the Module `version` as `moduleVersion`, and the state produced by `Module.serialize`.
2. WHEN `Runtime.restore(serialized)` is called with a valid Session string whose Module is registered, THE Runtime SHALL recreate the Instance with its original id, Status, and timestamps, using the state produced by `Module.deserialize`, and SHALL return a Handle.
3. IF the Session `formatVersion` is not `1`, THEN THE Session_Serializer SHALL throw `Unsupported session format.`
4. IF the Session's `instance.moduleId` is not registered, THEN THE Session_Serializer SHALL throw the Module_Registry "is not registered" error.
5. IF the registered Module `version` differs from `moduleVersion`, THEN THE Session_Serializer SHALL throw `Module version mismatch. Cannot safely restore session.`
6. IF the Session `definition.type` differs from the Module `id`, THEN THE Session_Serializer SHALL throw `Saved definition does not match module`.
7. IF an Instance with the Session's instance id already exists, THEN THE Instance_Manager SHALL throw `Instance already exists.`
8. IF the serialized text is not valid JSON, THEN THE Session_Serializer SHALL propagate the `JSON.parse` error.
9. WHEN a session is serialized, restored in a Runtime with the same Modules, and serialized again, THE Session_Serializer SHALL produce a Session with the same Definition, Instance, `moduleVersion`, and state (round-trip property).

### Requirement 11: Reset and Destroy

**User Story:** As a developer, I want to reset or dispose a puzzle, so that I can replay or free resources.

#### Acceptance Criteria

1. WHEN `Handle.reset()` is called, THE Instance_Manager SHALL replace the state with `Module.initialize(definition.config)`, set Status to `ready`, and update `updatedAt`.
2. WHEN `Handle.reset()` completes, THE Handle SHALL emit an event of type `puzzle:reset` with an empty payload.
3. WHEN `Handle.reset()` is called on a `completed` Instance, THE Runtime SHALL allow further dispatch of Actions afterward.
4. WHEN `Handle.destroy()` is called, THE Handle SHALL remove all per-instance listeners for the Instance, and THE Instance_Manager SHALL remove the Instance, its Module binding, its Definition, and its state.
5. WHEN `Handle.destroy()` is called, THE Runtime SHALL NOT remove global listeners registered through `Runtime.subscribe`.
6. IF any Handle operation other than `subscribe` is called after `destroy`, THEN THE Runtime SHALL throw the "not found" error of the Instance_Manager or State_Manager.

### Requirement 12: Sliding Puzzle Module

**User Story:** As a developer, I want a ready-made sliding puzzle, so that I can build a puzzle through a declarative definition.

#### Acceptance Criteria

1. THE Sliding_Puzzle_Module SHALL have id `sliding-puzzle` and version `1.0.0`.
2. WHEN `initialize` is called with `size` as an integer of at least 2, THE Sliding_Puzzle_Module SHALL create a state `{ size, tiles, emptyIndex, moves: 0 }`.
3. WHERE `initialTiles` is omitted, THE Sliding_Puzzle_Module SHALL generate tiles `1` to `size*size-1` in order followed by `0` for the empty space.
4. IF `size` is not an integer or is less than 2, THEN THE Sliding_Puzzle_Module SHALL throw `Board size must be integers of at least 2.`
5. IF `initialTiles` does not have exactly `size*size` entries, THEN THE Sliding_Puzzle_Module SHALL throw `Tile count must match grid dimensions.`
6. IF `initialTiles` is not a permutation of the integers `0` to `size*size-1`, THEN THE Sliding_Puzzle_Module SHALL throw `Tiles must contain each value from 0 to toal - 1 exactly once.`.
7. IF `initialTiles` is not solvable, THEN THE Sliding_Puzzle_Module SHALL throw `This tile arrangement is not solvable.`
8. THE `isSolvable` function SHALL return `true` for an odd `size` when the inversion count of the numbered tiles is even, and for an even `size` when the sum of the inversion count and the empty tile's row counted from the bottom (1-based) is odd.
9. WHEN a `MOVE_TILE` action has a `tileIndex` that is an integer in `[0, size*size)` at Manhattan distance 1 from the empty space, THE Sliding_Puzzle_Module SHALL accept it, swap that tile with the empty space, set `emptyIndex` to `tileIndex`, and increment `moves` by 1.
10. IF the action `type` is not `MOVE_TILE`, THEN THE Sliding_Puzzle_Module SHALL reject with `Unsupported action: <type>`.
11. IF `tileIndex` is not an integer in range, THEN THE Sliding_Puzzle_Module SHALL reject with `Invalid title index.`.
12. IF the tile at `tileIndex` is not adjacent to the empty space, THEN THE Sliding_Puzzle_Module SHALL reject with `Tile is not adjacent to the empty space.`
13. WHEN `isComplete` is called, THE Sliding_Puzzle_Module SHALL return `true` if and only if tile `i` holds `i+1` for every position except the last, and the last holds `0`.
14. THE Sliding_Puzzle_Module SHALL serialize its state with `JSON.stringify` and deserialize with `JSON.parse`.

### Requirement 13: Nonogram Module

**User Story:** As a developer, I want a nonogram puzzle with configurable strictness, so that I can offer different play modes.

#### Acceptance Criteria

1. THE Nonogram_Module SHALL have id `nonogram` and version `1.0.0`.
2. IF `rows` or `columns` is not an integer of at least 1, THEN THE Nonogram_Module SHALL throw `Grid dimensions must be positive integers.` from `initialize`.
3. IF `rowClues.length` differs from `rows` or `columnClues.length` differs from `columns`, THEN THE Nonogram_Module SHALL throw `Clue counts must match grid dimensions.`
4. IF `solution.length` differs from `rows*columns`, THEN THE Nonogram_Module SHALL throw `Solution size must match grid dimensions.`
5. IF any `solution` entry is not a boolean, THEN THE Nonogram_Module SHALL throw `Solution must contain boolean values.`
6. IF the clues derived from `solution` differ from the supplied `rowClues` or `columnClues`, THEN THE Nonogram_Module SHALL throw `Clues do not match the supplied solution.`
7. IF any clue value is not a positive integer, THEN THE Nonogram_Module SHALL throw `Clues must contain positive integers.`
8. WHEN `initialize` succeeds, THE Nonogram_Module SHALL return a state with `rows`, `columns`, `cells` of length `rows*columns` all `unknown`, `mistakes` of `0`, and `mode` equal to `config.mode` or `assisted` when omitted.
9. THE Nonogram_Module SHALL support the modes `strict`, `assisted`, and `learning`.
10. IF the action `type` is not `SET_CELL`, THEN THE Nonogram_Module SHALL reject with `Unsupported action: <type>`.
11. IF the payload `index` is not an integer in `[0, cells.length)`, THEN THE Nonogram_Module SHALL reject with `Invalid cell index.`
12. IF the cell at `index` already holds the payload `value`, THEN THE Nonogram_Module SHALL reject with `Cell already has this value.`
13. WHEN the payload `value` agrees with the solution (`filled` for a true cell, `empty` for a false cell), THE Nonogram_Module SHALL accept the action, set the cell, leave `mistakes` unchanged, and return empty feedback.
14. WHILE the state mode is `strict`, WHEN the payload `value` disagrees with the solution, THE Nonogram_Module SHALL reject with `Incorrect cell selection.` and an error feedback with code `INCORRECT_CELL`, leaving state unchanged.
15. WHILE the state mode is `assisted`, WHEN the payload `value` disagrees with the solution, THE Nonogram_Module SHALL accept the action, set the cell, increment `mistakes` by 1, and return a `warning` feedback with code `INCORRECT_CELL`.
16. WHILE the state mode is `learning`, WHEN the payload `value` disagrees with the solution, THE Nonogram_Module SHALL accept the action, set the cell, increment `mistakes` by 1, and return an `info` feedback with code `INCORRECT_CELL` and a message that points to the clues.
17. WHEN `isComplete(state, config)` is called, THE Nonogram_Module SHALL return `true` if and only if no cell is `unknown` and every cell agrees with `config.solution`.
18. THE Nonogram_Module SHALL serialize its state with `JSON.stringify` and deserialize with `JSON.parse`.
19. THE `getLineClues` function SHALL return the lengths of consecutive `filled` runs in order, and `generateSolutionClues` SHALL return row and column clues derived from a boolean solution.
20. WHEN the Nonogram_Module is driven through the Runtime, THE Runtime SHALL supply `definition.config` to `isComplete`, so that completion detection works as in criterion 17.

### Requirement 14: Custom Module Extension Path

**User Story:** As a developer, I want to add my own puzzle type without changing the core, so that I can build new games.

#### Acceptance Criteria

1. THE `@puzzlekit/core` package SHALL export the `PuzzleModule` type so that an external object can satisfy the Module contract.
2. WHEN an external Module is registered, THE Runtime SHALL treat it identically to the Sliding_Puzzle_Module and the Nonogram_Module.
3. THE Lights_Out_Module SHALL implement `TOGGLE_LIGHT`, toggling the target light and its orthogonal neighbors that lie within the board, and incrementing `moves` by 1.
4. IF the Lights_Out_Module receives an unsupported action type or an out-of-range `index`, THEN THE Lights_Out_Module SHALL reject with `Unsupported action: <type>` or `Invalid light index.` respectively.
5. WHEN `isComplete` is called, THE Lights_Out_Module SHALL return `true` if and only if every light is off.
6. THE repository SHALL provide a reference example of a custom Module.

### Requirement 15: Primitives

**User Story:** As a module author, I want shared grid, spatial, word, and common types, so that modules can reuse vocabulary.

#### Acceptance Criteria

1. THE `@puzzlekit/core` package SHALL export the Primitives for `common`, `grid`, `words`, and `spatial` from its root entry point.

### Requirement 16: React Adapter

**User Story:** As a React developer, I want hooks bound to a puzzle handle, so that components re-render when state changes.

#### Acceptance Criteria

1. THE React_Adapter SHALL export `PuzzleProvider`, `usePuzzle`, and `usePuzzleState` from its entry point.
2. WHEN `PuzzleProvider` receives a `handle` prop, THE React_Adapter SHALL make that Handle available to descendant components through React context.
3. WHEN `usePuzzle` is called within a `PuzzleProvider`, THE React_Adapter SHALL return the provided Handle.
4. IF `usePuzzle` is called outside a `PuzzleProvider`, THEN THE React_Adapter SHALL throw `usePuzzle must be used within a PuzzleProvider.`
5. WHEN `usePuzzleState` is first rendered, THE React_Adapter SHALL return the Handle's current state.
6. WHEN the Handle emits any event, THE `usePuzzleState` hook SHALL replace its value with a fresh `getState()` result and cause a re-render.
7. WHEN the consuming component unmounts or the Handle changes, THE `usePuzzleState` hook SHALL unsubscribe from the Handle.
8. THE React_Adapter SHALL declare `@puzzlekit/core` `^0.1.0` and `react` `^18.0.0 || ^19.0.0` as peer dependencies.

### Requirement 17: Build and Test Tooling

**User Story:** As a contributor, I want consistent build, type-check, and test commands, so that I can verify the repository.

#### Acceptance Criteria

1. THE Workspace SHALL define the scripts `build`, `test`, `test:watch`, and `typecheck`.
2. WHEN `npm run build` is run, THE Workspace SHALL build `@puzzlekit/core` and then `@puzzlekit/react` with `tsup`, producing ESM, CJS, and type declarations in each package's `dist` directory.
3. WHEN `npm test` is run, THE Workspace SHALL run `vitest run` in the `jsdom` environment over the test suites of the packages.
4. WHEN `npm run typecheck` is run, THE Workspace SHALL run `tsc --noEmit` against `@puzzlekit/core` and `@puzzlekit/react`.
5. THE root `tsconfig.json` SHALL enable `strict` mode, target `ES2022`, module `ESNext`, and module resolution `Bundler`.
6. THE repository SHALL include test suites for core constraints, custom-constraint integration, JSON loading, runtime integration, the sliding-puzzle and nonogram modules, the React hooks, and the Lights_Out_Module.
7. THE `@puzzlekit/core` package SHALL publish `dist` only, with `main` set to the CJS bundle, `module` to the ESM bundle, and `types` to the declaration file.

### Requirement 18: Demonstration Applications

**User Story:** As an evaluator, I want working demos, so that I can see the engine and modules in use.

#### Acceptance Criteria

1. THE repository SHALL provide a demo app, built with Vite and React, that plays the sliding puzzle and nonogram from definitions.
2. THE repository SHALL provide a demo app, built with Vite and React, that registers the custom Lights_Out_Module.
3. THE demo apps SHALL each define `dev` and `build` scripts using `vite` and depend on `@puzzlekit/core` and `@puzzlekit/react`.
