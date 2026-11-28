# Getting Started

This guide explains how to set up PuzzleKit locally, build its packages, and explore the example puzzle application.

## Prerequisites

You need:

- Node.js
- npm
- Basic knowledge of TypeScript

## 1. Clone the Repository

Clone the PuzzleKit repository and navigate into the project directory:

```bash
git clone https://github.com/ifaycodes/puzzlekit
cd puzzlekit
```

## 2. Install Dependencies

PuzzleKit uses npm workspaces to manage its packages and demo application.

Install the dependencies from the project root:

```bash
npm install
```

This installs the dependencies required by the core engine, React adapter, and demo application.

## 3. Build the Packages

Build the core engine and React adapter:

```bash
npm run build
```

This generates the distributable files in each package's `dist` directory.

The core package provides the puzzle runtime, module contracts, definitions, and primitives.

The React package provides the React bindings used to connect puzzle instances to user interfaces.

## 4. Run the Demo Application

PuzzleKit includes a demo application containing three playable puzzles:

- Sliding Puzzle
- Nonogram
- Lights Out

Navigate to the demo directory. Pick path of choice:

```bash
cd my_apps/json-definition-demo/
or
cd my_apps/custom-module-registration/lights-out/
```

Start the development server:

```bash
npm run dev
```

Open the local URL displayed in your terminal to explore the application.

## 5. Explore the Puzzle Modules

Each puzzle demonstrates a different way of extending PuzzleKit.

| Module | What to explore |
|---|---|
| Sliding Puzzle and Nonogram | Using an existing module with a puzzle definition |
| Lights Out | Defining custom module and independent game mechanics and state transitions |

The modules are located in:

```text
packages/modules/
├── nonogram/
└── sliding-puzzle/
```


## 6. Create Your Own Puzzle Module

PuzzleKit allows developers to implement new puzzle types without modifying the core engine.

A custom module defines:

- How the puzzle is initialized.
- How player actions are processed.
- How completion is determined.
- How its state is serialized and restored.

Start with the [Creating a Puzzle Module](./creating-a-puzzle-module.md) guide for a step-by-step example.

## 7. Run Tests and Type Checks

From the repository root, run the test suite:

```bash
npm test
```

Run TypeScript checks:

```bash
npm run typecheck
```

Build the packages:

```bash
npm run build
```

## Package Availability

PuzzleKit is currently under development and has not yet been published to npm.
