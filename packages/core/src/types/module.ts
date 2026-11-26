import type { PuzzleState } from "./state";
import type { PuzzleAction, ActionResult } from "./action";

export interface PuzzleModule<
  TConfig = unknown,
  TState = PuzzleState,
  TActionPayload = unknown
> {
  id: string;
  version: string;

  initialize(config: TConfig): TState;

  processAction(
    state: TState,
    action: PuzzleAction<TActionPayload>,
    config: TConfig
  ): ActionResult<TState>;

  isComplete(state: TState, config: TConfig): boolean;

  serialize(state: TState): string;

  deserialize(data: string): TState;
}