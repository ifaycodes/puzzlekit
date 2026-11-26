import type {
  PuzzleDefinition,
  PuzzleInstance,
} from "../types";

export interface SerializedPuzzleSession {
  formatVersion: 1;
  definition: PuzzleDefinition;
  instance: PuzzleInstance;
  moduleVersion: string;
  state: string;
}