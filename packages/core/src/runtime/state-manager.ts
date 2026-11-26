
import type { PuzzleState } from "../types";

export class StateManager {
  private states = new Map<string, PuzzleState>();

  set(instanceId: string, state: PuzzleState): void {
    this.states.set(instanceId, structuredClone(state));
  }

  get(instanceId: string): PuzzleState {
    const state = this.states.get(instanceId);

    if (state === undefined) {
      throw new Error(
        `State for puzzle instance "${instanceId}" was not found.`
      );
    }

    return structuredClone(state);
  }

  has(instanceId: string): boolean {
    return this.states.has(instanceId);
  }

  remove(instanceId: string): void {
    this.states.delete(instanceId);
  }

  update(instanceId: string, state: PuzzleState): void {
    if (!this.states.has(instanceId)) {
      throw new Error(
        `Cannot update state: instance "${instanceId}" does not exist.`
      );
    }

    this.set(instanceId, state);
  }
}
