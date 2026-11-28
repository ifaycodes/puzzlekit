
import { describe, it, expect } from "vitest";
import { nonogramModule } from "../src/nonogram.module";

const config = {
  rows: 2,
  columns: 2,
  rowClues: [[1], [1]],
  columnClues: [[1], [1]],
  solution: [true, false, false, true],
};

describe("Nonogram Module", () => {
  it("initializes correctly", () => {
    const state = nonogramModule.initialize(config);

    expect(state.cells).toHaveLength(4);
    expect(state.mistakes).toBe(0);
  });

  it("accepts correct selections", () => {
    const state = nonogramModule.initialize(config);

    const result = nonogramModule.processAction(state, {
      type: "SET_CELL",
      payload: { index: 0, value: "filled" },
    }, config);

    expect(result.accepted).toBe(true);
  });

  it("rejects incorrect selections in strict mode", () => {
    const state = nonogramModule.initialize({
      ...config,
      mode: "strict",
    });

    const strict = { ...config, mode: "strict" as const }

    const result = nonogramModule.processAction(state, {
      type: "SET_CELL",
      payload: { index: 0, value: "empty" },
    }, strict);

    expect(result.accepted).toBe(false);
  });

  it("accepts incorrect selections in assisted mode and tracks mistakes", () => {
    const state = nonogramModule.initialize(config);

    const result = nonogramModule.processAction(state, {
      type: "SET_CELL",
      payload: { index: 0, value: "empty" },
    }, config);

    expect(result.accepted).toBe(true);

    if (result.accepted) {
      expect(result.state.mistakes).toBe(1);
    }
  });

  it("does not mark an incorrectly solved board as complete", () => {
    const state = nonogramModule.initialize(config);

    const incorrectState = {
      ...state,
      cells: ["empty", "empty", "filled", "filled"],
    };

    expect(
      nonogramModule.isComplete(incorrectState as typeof state, config)
    ).toBe(false);
  });

  it("rejects clues that do not match the solution", () => {
    expect(() =>
      nonogramModule.initialize({
        ...config,
        rowClues: [[2], [1]],
      })
    ).toThrow("Clues do not match the supplied solution.");
  });
});
