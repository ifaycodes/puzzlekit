import { useContext, useEffect, useState } from "react";
import type { PuzzleHandle } from "@puzzlekit/core";
import { PuzzleContext } from "./context";

export function usePuzzle<TState = unknown>(): PuzzleHandle<TState> {
  const handle = useContext(PuzzleContext);

  if (!handle) {
    throw new Error(
      "usePuzzle must be used within a PuzzleProvider."
    );
  }

  return handle as PuzzleHandle<TState>;
}

export function usePuzzleState<TState = unknown>(): TState {
  const puzzle = usePuzzle<TState>();

  const [state, setState] = useState<TState>(
    () => puzzle.getState()
  );

  useEffect(() => {
    setState(puzzle.getState());

    const unsubscribe = puzzle.subscribe(() => {
      setState(puzzle.getState());
    });

    return unsubscribe;
  }, [puzzle]);

  return state;
}