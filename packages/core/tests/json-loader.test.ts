
import { describe, it, expect, beforeEach } from "vitest";
import { PuzzleRuntime } from "../src/runtime/puzzle-runtime";
import { slidingPuzzleModule } from "../../modules/sliding-puzzle/src";

describe("JSON Puzzle Loader", () => {
  let runtime: PuzzleRuntime;

  const validDefinition = JSON.stringify({
    id: "test-puzzle",
    type: "sliding-puzzle",
    version: "1.0.0",
    config: {
      size: 3,
      initialTiles: [1, 2, 3, 4, 5, 6, 7, 0, 8],
    },
  });

  beforeEach(() => {
    runtime = new PuzzleRuntime();
    runtime.registerModule(slidingPuzzleModule);
  });

  it("creates a puzzle from valid JSON", () => {
    const puzzle = runtime.createFromJSON(validDefinition);

    expect(puzzle.getState()).toMatchObject({
      size: 3,
      moves: 0,
      emptyIndex: 7,
    });
  });

  it("rejects malformed JSON", () => {
    expect(() => runtime.createFromJSON("{invalid json}"))
      .toThrow("Invalid JSON");
  });

  it("rejects definitions with missing fields", () => {
    const invalidDefinition = JSON.stringify({
      id: "test-puzzle",
      config: {},
    });

    expect(() => runtime.createFromJSON(invalidDefinition))
      .toThrow();
  });

  it("rejects definitions with unregistered module types", () => {
    const definition = JSON.stringify({
      id: "unknown-puzzle",
      type: "unknown-module",
      version: "1.0.0",
      config: {},
    });

    expect(() => runtime.createFromJSON(definition))
      .toThrow();
  });

  it("rejects invalid module configuration", () => {
    const definition = JSON.stringify({
      id: "invalid-puzzle",
      type: "sliding-puzzle",
      version: "1.0.0",
      config: {
        size: 3,
        initialTiles: [1, 2, 3],
      },
    });

    expect(() => runtime.createFromJSON(definition))
      .toThrow();
  });

  it("loads definitions with built-in constraints", () => {
    const definition = JSON.stringify({
        id: "constrained-puzzle",
        type: "sliding-puzzle",
        version: "1.0.0",
        config: {
        size: 3,
        initialTiles: [1, 2, 3, 4, 5, 6, 7, 0, 8],
        },
        constraints: [
        {
            id: "unique-values",
            config: {
            path: "tiles",
            },
        },
        ],
    });

    const puzzle = runtime.createFromJSON<{size: number}>(definition);
    expect(puzzle.getState().size).toBe(3);
    });

});
