import { describe, it, expect } from "vitest";
import { slidingPuzzleModule } from "../src/sliding-puzzle.module";

describe("Sliding Puzzle Module", () => {
  const config = {
    size: 3,
    initialTiles: [1, 2, 3, 4, 5, 6, 7, 0, 8],
  };

  it("initializes a puzzle correctly", () => {
    const state = slidingPuzzleModule.initialize(config);

    expect(state.tiles).toEqual(config.initialTiles);
    expect(state.emptyIndex).toBe(7);
    expect(state.moves).toBe(0);
  });

  it("accepts a legal move", () => {
    const state = slidingPuzzleModule.initialize(config);

    const result = slidingPuzzleModule.processAction(state, {
      type: "MOVE_TILE",
      payload: { tileIndex: 8 },
    });

    expect(result.accepted).toBe(true);

    if (result.accepted) {
      expect(result.state.tiles).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 0]);
      expect(result.state.moves).toBe(1);
    }
  });

  it("rejects a non-adjacent move", () => {
    const state = slidingPuzzleModule.initialize(config);

    const result = slidingPuzzleModule.processAction(state, {
      type: "MOVE_TILE",
      payload: { tileIndex: 0 },
    });

    expect(result.accepted).toBe(false);
  });

  it("does not mutate the original state", () => {
    const state = slidingPuzzleModule.initialize(config);
    const originalTiles = [...state.tiles];

    slidingPuzzleModule.processAction(state, {
      type: "MOVE_TILE",
      payload: { tileIndex: 8 },
    });

    expect(state.tiles).toEqual(originalTiles);
  });

  it("detects puzzle completion", () => {
    const state = slidingPuzzleModule.initialize(config);

    const result = slidingPuzzleModule.processAction(state, {
      type: "MOVE_TILE",
      payload: { tileIndex: 8 },
    });

    expect(
      result.accepted && slidingPuzzleModule.isComplete(result.state)
    ).toBe(true);
  });
});
