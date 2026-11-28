import React, { createContext, type ReactNode } from "react";
import type { PuzzleHandle } from "@puzzlekit/core";

interface PuzzleProviderProps {
  handle: PuzzleHandle<unknown>;
  children: ReactNode;
}

export const PuzzleContext =
  createContext<PuzzleHandle<unknown> | null>(null);

export function PuzzleProvider({
  handle,
  children,
}: PuzzleProviderProps) {
  return (
    <PuzzleContext.Provider value={handle}>
      {children}
    </PuzzleContext.Provider>
  );
}