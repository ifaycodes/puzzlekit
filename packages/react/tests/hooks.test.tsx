import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { PuzzleRuntime } from "@puzzlekit/core";
import type { PuzzleModule } from "@puzzlekit/core";
import {
  PuzzleProvider,
  usePuzzle,
  usePuzzleState,
} from "../src";

interface CounterConfig {}

interface CounterState {
  count: number;
}

interface CounterPayload {
  amount: number;
}

const counterModule: PuzzleModule<
  CounterConfig,
  CounterState,
  CounterPayload
> = {
  id: "counter",
  version: "1.0.0",

  initialize() {
    return { count: 0 };
  },

  processAction(state, action) {
    if (action.type !== "INCREMENT") {
      return { accepted: false, reason: "Unknown action." };
    }

    return {
      accepted: true,
      state: {
        count: state.count + action.payload.amount,
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

function createPuzzle() {
  const runtime = new PuzzleRuntime();

  runtime.registerModule(counterModule);

  return runtime.create<CounterState>({
    definition: {
      id: "counter-game",
      type: "counter",
      version: "1.0.0",
      config: {},
    },
  });
}

describe("React adapter", () => {
  it("provides the puzzle handle to child components", () => {
    const puzzle = createPuzzle();

    function TestComponent() {
      const handle = usePuzzle<CounterState>();

      return <p>{handle.getState().count}</p>;
    }

    render(
      <PuzzleProvider handle={puzzle}>
        <TestComponent />
      </PuzzleProvider>
    );

    expect(screen.getByText("0")).toBeTruthy();
  });

  it("exposes puzzle state through usePuzzleState", () => {
    const puzzle = createPuzzle();

    function TestComponent() {
      const state = usePuzzleState<CounterState>();

      return <p>{state.count}</p>;
    }

    render(
      <PuzzleProvider handle={puzzle}>
        <TestComponent />
      </PuzzleProvider>
    );

    expect(screen.getByText("0")).toBeTruthy();
  });

  it("updates React components after an action is dispatched", () => {
    const puzzle = createPuzzle();

    function TestComponent() {
      const state = usePuzzleState<CounterState>();
      const handle = usePuzzle<CounterState>();

      return (
        <>
          <p>{state.count}</p>
          <button
            onClick={() =>
              handle.dispatch({
                type: "INCREMENT",
                payload: { amount: 5 },
              })
            }
          >
            Increment
          </button>
        </>
      );
    }

    render(
      <PuzzleProvider handle={puzzle}>
        <TestComponent />
      </PuzzleProvider>
    );

    fireEvent.click(screen.getByText("Increment"));

    expect(screen.getByText("5")).toBeTruthy();
  });

  it("cleans up its subscription when the component unmounts", () => {
    const puzzle = createPuzzle();
    const cleanupSpy = vi.fn();

    const originalSubscribe = puzzle.subscribe.bind(puzzle);

    vi.spyOn(puzzle, "subscribe").mockImplementation((listener) => {
      const unsubscribe = originalSubscribe(listener);

      return () => {
        unsubscribe();
        cleanupSpy();
      };
    });

    function TestComponent() {
      usePuzzleState<CounterState>();
      return <p>Counter</p>;
    }

    const { unmount } = render(
      <PuzzleProvider handle={puzzle}>
        <TestComponent />
      </PuzzleProvider>
    );

    expect(puzzle.subscribe).toHaveBeenCalled();

    unmount();

    expect(cleanupSpy).toHaveBeenCalledOnce();
  });
});
