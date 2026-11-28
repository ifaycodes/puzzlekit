import { PuzzleRuntime } from "@puzzlekit/core";
import type { PuzzleModule, PuzzleAction } from "@puzzlekit/core";

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

const numberGuessingModule: PuzzleModule<
  NumberGuessingConfig,
  NumberGuessingState,
  GuessPayload
> = {
  id: "number-guessing",
  version: "1.0.0",

  initialize(config: NumberGuessingConfig) {
    if (!Number.isInteger(config.target) || config.target < 1 || config.target > 100) {
      throw new Error("Target must be an integer between 1 and 100.");
    }

    if (!Number.isInteger(config.maxAttempts) || config.maxAttempts < 1) {
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
        reason: "Unknown action.",
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

    const attempts = state.attempts + 1;
    const solved = value === config.target;

    return {
      accepted: true,
      state: {
        ...state,
        attempts,
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

const runtime = new PuzzleRuntime();
runtime.registerModule(numberGuessingModule);

const puzzle = runtime.create<NumberGuessingState>({
    definition: {
        id: 'guessing-game',
        type: 'number-guessing',
        version: "1.0.0",
        config: {
            target: 42,
            maxAttempts: 5,
        },
    },
});

puzzle.dispatch({
    type: "GUESS",
    payload: { value: 30},
});

puzzle.dispatch({
    type: "GUESS",
    payload: { value: 42},
});

console.log(puzzle.getState());
console.log("Completed: ", puzzle.isComplete());
