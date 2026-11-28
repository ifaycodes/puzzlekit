
import { describe, it, expect } from "vitest";
import { PuzzleRuntime } from "../src/runtime/puzzle-runtime";
import type { PuzzleModule } from "../src/types";

interface CounterState {
  value: number;
}

interface CounterConfig {
  startingValue: number;
}

interface CounterAction {
  amount: number;
}

const counterModule: PuzzleModule<
  CounterConfig,
  CounterState,
  CounterAction
> = {
  id: "counter",
  version: "1.0.0",

  initialize(config) {
    return {
      value: config.startingValue,
    };
  },

  processAction(state, action) {
    const newState = {
      value: state.value + action.payload.amount,
    };

    return {
      accepted: true,
      state: newState,
    };
  },

  isComplete(state) {
    return state.value >= 10;
  },

  serialize(state) {
    return JSON.stringify(state);
  },

  deserialize(data) {
    return JSON.parse(data) as CounterState;
  },
};

describe("PuzzleKit Runtime Integration", () => {
  it("should support the complete puzzle lifecycle", () => {
    const runtime = new PuzzleRuntime();

    // 1. Register a module
    runtime.registerModule(counterModule);

    // 2. Create a puzzle
    const puzzle = runtime.create<CounterState>({
      definition: {
        id: "counter-game",
        type: "counter",
        version: "1.0.0",
        config: {
          startingValue: 0,
        },
      },
    });

    expect(puzzle.getState().value).toBe(0);

    // 3. Subscribe to events
    const receivedEvents: string[] = [];

    puzzle.subscribe((event) => {
      receivedEvents.push(event.type);
    });

    // 4. Dispatch actions
    puzzle.dispatch({
      type: "INCREMENT",
      payload: { amount: 4 },
    });

    expect(puzzle.getState().value).toBe(4);

    puzzle.dispatch({
      type: "INCREMENT",
      payload: { amount: 6 },
    });

    expect(puzzle.getState().value).toBe(10);

    // 5. Check completion
    expect(puzzle.isComplete()).toBe(true);

    expect(receivedEvents).toContain("action:accepted");
    expect(receivedEvents).toContain("state:updated");
    expect(receivedEvents).toContain("puzzle:completed");

    // 6. Serialize the session
    const savedSession = puzzle.serialize();

    expect(typeof savedSession).toBe("string");

    // 7. Restore in another runtime
    const restoredRuntime = new PuzzleRuntime();

    restoredRuntime.registerModule(counterModule);

    const restoredPuzzle = restoredRuntime.restore<CounterState>(savedSession);

    expect(restoredPuzzle.getState().value).toBe(10);
    expect(restoredPuzzle.isComplete()).toBe(true);

    // 8. Reset
    restoredPuzzle.reset();

    expect(restoredPuzzle.getState().value).toBe(0);
    expect(restoredPuzzle.isComplete()).toBe(false);

    // 9. Destroy
    restoredPuzzle.destroy();

    expect(() => restoredPuzzle.getState()).toThrow();
  });
});
