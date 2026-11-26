import { InstanceManager } from "./instance-manager";
import { StateManager } from "./state-manager";
import { EventManager } from "./event-manager";

export class CompletionChecker {
  constructor(
    private readonly instanceManager: InstanceManager,
    private readonly stateManager: StateManager,
    private readonly eventManager: EventManager
  ) {}

  check(instanceId: string): boolean {
    const instance = this.instanceManager.get(instanceId);

    // Avoid checking an already completed puzzle.
    if (instance.status === "completed") {
      return true;
    }

    const module = this.instanceManager.getModule(instanceId);
    const state = this.stateManager.get(instanceId);
    const definition = this.instanceManager.getDefinition(instanceId);

    const completed = module.isComplete(state, definition.config);

    if (completed) {
      this.instanceManager.update(instanceId, {
        status: "completed",
        updatedAt: Date.now(),
      });

      this.eventManager.emit({
        type: "puzzle:completed",
        instanceId,
        timestamp: Date.now(),
        payload: {},
      });
    }

    return completed;
  }
}
