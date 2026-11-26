import type {
  PuzzleAction,
  ActionResult,
  PuzzleEvent,
} from "../types";

import { InstanceManager } from "./instance-manager";
import { StateManager } from "./state-manager";
import { EventManager } from "./event-manager";
import { CompletionChecker } from "./completion-checker";
import { ConstraintEngine } from "../definitions";

export class ActionDispatcher {
  constructor(
    private readonly instanceManager: InstanceManager,
    private readonly stateManager: StateManager,
    private readonly eventManager: EventManager,
    private readonly completionChecker: CompletionChecker,
    private readonly constraintEngine: ConstraintEngine,
  ) {}

  dispatch(
    instanceId: string,
    action: PuzzleAction
  ): ActionResult<unknown> {
    const instance = this.instanceManager.get(instanceId);

    if (instance.status === "completed") {
      return this.reject(
        instanceId,
        "This puzzle has already been completed."
      );
    }

    const module = this.instanceManager.getModule(instanceId);
    const currentState = this.stateManager.get(instanceId);

    const definition = this.instanceManager.getDefinition(instanceId);
    const constraintReference = definition.constraints ?? [];

    const actionResult = this.constraintEngine.validateForTarget(
      "action", { state: currentState, action }, constraintReference
    );

    if (!this.constraintEngine.isValid(actionResult)) {
      const reason = actionResult.filter((result) => !result.valid)
        .map((result) => result.message ?? "Action constraint failed.")
        .join(" ");

      return this.reject(instanceId, reason);
    }

    const result = module.processAction(currentState, action, definition.config);

    if (!result.accepted) {
      this.emitModuleEvents(instanceId, result);
      
      this.eventManager.emit({
        type: "action:rejected",
        instanceId,
        timestamp: Date.now(),
        payload: { action, reason: result.reason },
      });

      return result;
    }

    // state change
    const stateResult = this.constraintEngine.validateForTarget(
      "state", result.state, constraintReference
    );

    if (!this.constraintEngine.isValid(stateResult)) {
      const reason = stateResult.filter((validation) => !validation.valid)
        .map((validation) => validation.message ?? "State constraint failed.")
        .join(" ");

      return this.reject(instanceId, reason);
    }

    // Update the puzzle state.
    this.stateManager.update(instanceId, result.state);

    // Mark the puzzle as active.
    this.instanceManager.update(instanceId, {
      status: "active",
      updatedAt: Date.now(),
    });
    
    this.emitModuleEvents(instanceId, result);

    this.eventManager.emit({
      type: "action:accepted",
      instanceId,
      timestamp: Date.now(),
      payload: { action },
    });

    this.eventManager.emit({
      type: "state:updated",
      instanceId,
      timestamp: Date.now(),
      payload: { state: result.state },
    });

    this.completionChecker.check(instanceId);
    
    return result;
  }

  private reject(
    instanceId: string,
    reason: string
  ): ActionResult<unknown> {
    const result: ActionResult<unknown> = {
      accepted: false,
      reason,
    };

    this.eventManager.emit({
      type: "action:rejected",
      instanceId,
      timestamp: Date.now(),
      payload: { reason },
    });

    return result;
  }

  private emitModuleEvents(
    instanceId: string,
    result: ActionResult<unknown>
  ): void {
    result.events?.forEach((event) => {
      const puzzleEvent: PuzzleEvent = {
        type: event.type,
        instanceId,
        timestamp: Date.now(),
        payload: event.payload,
      };

      this.eventManager.emit(puzzleEvent);
    });
  }
}
