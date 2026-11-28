import type { PuzzleModule } from "@puzzlekit/core";
import type {
  NonogramConfig,
  NonogramState,
  SetCellPayload,
} from "./types";
import { matchesClues, generateSolutionClues } from "./validation";

export const nonogramModule: PuzzleModule<
  NonogramConfig,
  NonogramState,
  SetCellPayload
> = {
  id: "nonogram",
  version: "1.0.0",

  initialize(config) {
    const { rows, columns, rowClues, columnClues, solution } = config;

    if (
      !Number.isInteger(rows) ||
      !Number.isInteger(columns) ||
      rows < 1 ||
      columns < 1
    ) {
      throw new Error("Grid dimensions must be positive integers.");
    }

    if (
      rowClues.length !== rows ||
      columnClues.length !== columns
    ) {
      throw new Error("Clue counts must match grid dimensions.");
    }

    if (solution.length !== rows * columns) {
      throw new Error("Solution size must match grid dimensions.");
    }

    if (!solution.every((cell) => typeof cell === "boolean")) {
      throw new Error("Solution must contain boolean values.");
    }

    const generateClues = generateSolutionClues(solution, rows, columns);

    const cluesMatch = (
      expected: number[][],
      actual: number[][]
    ) => expected.length === actual.length &&
        expected.every((line, index) => line.length === actual[index].length &&
          line.every((value, i) => value === actual[index][i])
    );

    if (!cluesMatch(generateClues.rowClues, rowClues) ||
      !cluesMatch(generateClues.columnClues, columnClues)
    ) {
      throw new Error("Clues do not match the supplied solution.");
    }

    for (const clue of [...rowClues, ...columnClues]) {
      if (
        clue.some((value) => !Number.isInteger(value) || value <= 0)
      ) {
        throw new Error("Clues must contain positive integers.");
      }
    }

    return {
      rows,
      columns,
      cells: Array(rows * columns).fill("unknown"),
      mistakes: 0,
      mode: config.mode ?? "assisted",
    };
  },

  processAction(state, action, config) {
    if (action.type !== "SET_CELL") {
      return {
        accepted: false,
        reason: `Unsupported action: ${action.type}`,
      };
    }

    const { index, value } = action.payload;

    if (
      !Number.isInteger(index) ||
      index < 0 ||
      index >= state.cells.length
    ) {
      return {
        accepted: false,
        reason: "Invalid cell index.",
      };
    }

    if (state.cells[index] === value) {
      return {
        accepted: false,
        reason: "Cell already has this value.",
      };
    }

    const correct = (value === "filled") === config.solution[index];
    const mode = state.mode;

    if (!correct && mode === "strict") {
      return {
        accepted: false,
        reason: "Incorrect cell selection.",
        feedback: [{
          type: "error",
          code: "INCORRECT_CELL",
          message: "That cell does not match the solution."
        }],
      };
    }

    const nextState: NonogramState = {
      ...state,
      cells: state.cells.map((cell, i) => i === index ? value : cell),
      mistakes: correct ? state.mistakes : state.mistakes + 1
    };

    return {
      accepted: true,
      state: nextState,
      feedback: !correct ? 
        [{
          type: mode === "learning" ? "info" : "warning",
          code: "INCORRECT_CELL",
          message: mode === "learning" ? "This selection is incorrect. Check the row and column clues." 
            : "This selection does not match the solution.",
        }] : [],
    };
  },

  isComplete(state, config) {
    return state.cells.every((cell, index) => {
      if (cell === "unknown") return false;

      return (cell === "filled") === config.solution[index];
    });
  },

  serialize(state) {
    return JSON.stringify(state);
  },

  deserialize(data) {
    return JSON.parse(data) as NonogramState;
  },
};
