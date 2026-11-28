
import { describe, it, expect } from "vitest";
import { PuzzleRuntime } from "../src/runtime/puzzle-runtime";
import type { PuzzleModule, PuzzleAction } from "../src/types";
import type { Constraint } from "../src/primitives/common/constraints";

interface CounterConfig {
  initialValue: number;
}

interface CounterState {
  value: number;
}

interface IncrementPayload {
  amount: number;
}

// A custom constraint registered by the developer.
const maxIncrementConstraint: Constraint = {
  id: "max-increment",
  target: "action",

  validate(context: unknown, config?: unknown) {
    const actionContext = context as {
      action: PuzzleAction<IncrementPayload>;
    };

    const settings = config as { maxAmount: number };

    const amount = actionContext.action.payload.amount;

    return {
      valid: amount <= settings.maxAmount,
      message: "Increment exceeds the allowed amount.",
      code: "MAX_INCREMENT_EXCEEDED",
    };
  },
};

// A simple custom puzzle module.
const counterModule: PuzzleModule<
  CounterConfig,
  CounterState,
  IncrementPayload
> = {
  id: "counter",
  version: "1.0.0",

  initialize(config) {
    return {
      value: config.initialValue,
    };
  },

  processAction(state, action) {
    if (action.type !== "INCREMENT") {
      return {
        accepted: false,
        reason: "Unknown action.",
      };
    }

    return {
      accepted: true,
      state: {
        value: state.value + action.payload.amount,
      },
    };
  },

  isComplete() {
    return false;
  },

  serialize(state) {
    return JSON.stringify(state);
  },

  deserialize(data) {
    return JSON.parse(data) as CounterState;
  },
};

describe("Custom constraint integration", () => {
  it("registers and enforces a custom constraint through the runtime", () => {
    const runtime = new PuzzleRuntime();

    runtime.registerModule(counterModule);
    runtime.registerConstraint(maxIncrementConstraint);

    const puzzle = runtime.create<CounterState>({
      definition: {
        id: "test-counter",
        type: "counter",
        version: "1.0.0",
        config: {
          initialValue: 0,
        },
        constraints: [
          {
            id: "max-increment",
            config: {
              maxAmount: 1,
            },
          },
        ],
      },
    });

    // An increment of 1 should be accepted.
    const accepted = puzzle.dispatch({
      type: "INCREMENT",
      payload: { amount: 1 },
    });

    expect(accepted.accepted).toBe(true);
    expect(puzzle.getState().value).toBe(1);

    // An increment of 2 should be rejected.
    const rejected = puzzle.dispatch({
      type: "INCREMENT",
      payload: { amount: 2 },
    });

    expect(rejected.accepted).toBe(false);

    // Rejected actions must not modify the state.
    expect(puzzle.getState().value).toBe(1);
  });
});
