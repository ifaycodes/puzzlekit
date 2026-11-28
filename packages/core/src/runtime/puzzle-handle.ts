import type {PuzzleAction, PuzzleEvent, ActionResult} from "../types";

import { InstanceManager } from "./instance-manager";
import { StateManager } from "./state-manager";
import { ActionDispatcher } from "./action-dispatcher";
import { EventManager } from "./event-manager";
import { CompletionChecker } from "./completion-checker";
import { SessionSerializer } from "./session-serializer";

export class PuzzleHandle<TState = unknown> {
  constructor(
    private readonly instanceId: string,
    private readonly instanceManager: InstanceManager,
    private readonly stateManager: StateManager,
    private readonly actionDispatcher: ActionDispatcher,
    private readonly eventManager: EventManager,
    private readonly completionChecker: CompletionChecker,
    private readonly sessionSerializer: SessionSerializer
  ) {}

  getState(): TState {
    return this.stateManager.get(this.instanceId) as TState;
  }

  dispatch(action: PuzzleAction): ActionResult<unknown> {
    return this.actionDispatcher.dispatch(
      this.instanceId,
      action
    );
  }

  subscribe(
    listener: (event: PuzzleEvent) => void
  ): () => void {
    return this.eventManager.subscribe(
      listener,
      this.instanceId
    );
  }

  isComplete(): boolean {
    return this.completionChecker.check(this.instanceId);
  }

  reset(): void {
    this.instanceManager.reset(this.instanceId);

    this.eventManager.emit({
        type: 'puzzle:reset',
        instanceId: this.instanceId,
        timestamp: Date.now(),
        payload: {},
    });
  }

  serialize(): string {
    return this.sessionSerializer.serialize(this.instanceId);
  }

  destroy(): void {
    this.eventManager.clear(this.instanceId);
    this.instanceManager.destroy(this.instanceId);
  }
}
