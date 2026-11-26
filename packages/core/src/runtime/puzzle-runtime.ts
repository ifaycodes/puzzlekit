import type { PuzzleDefinition } from "../types";

import { ModuleRegistry } from "./module-registry";
import { InstanceManager } from "./instance-manager";
import { StateManager } from "./state-manager";
import { EventManager } from "./event-manager";
import { ActionDispatcher } from "./action-dispatcher";
import { CompletionChecker } from "./completion-checker";
import { SessionSerializer } from "./session-serializer";
import { PuzzleHandle } from "./puzzle-handle";
import { validatePuzzleDefinition, ConstraintRegistry, ConstraintEngine } from "../definitions";
import { builtInConstraints } from "../definitions/built-in-constraints";

export class PuzzleRuntime {
  private moduleRegistry = new ModuleRegistry();
  private stateManager = new StateManager();
  private instanceManager = new InstanceManager(this.moduleRegistry, this.stateManager);
  private eventManager = new EventManager();
  readonly constraintRegistry = createDefaultConstraintRegistry();
  private constraintEngine = new ConstraintEngine(this.constraintRegistry);

  private completionChecker = new CompletionChecker(
    this.instanceManager,
    this.stateManager,
    this.eventManager
  );

  private actionDispatcher = new ActionDispatcher(
    this.instanceManager,
    this.stateManager,
    this.eventManager,
    this.completionChecker,
    this.constraintEngine
  );

  private sessionSerializer = new SessionSerializer(
    this.instanceManager,
    this.stateManager,
    this.moduleRegistry
  );

  registerModule(module: Parameters<ModuleRegistry["register"]>[0]): void {
    this.moduleRegistry.register(module);
  }

  create<TState = unknown>(options: { definition: PuzzleDefinition }): PuzzleHandle<TState> {
    const instance = this.instanceManager.create(options.definition);
    if (!instance) {
      this.eventManager.emit({
        type: "action:rejected",
        instanceId: '',
        timestamp: Date.now(),
        payload: { action: 'puzzle initiation', reason: 'failed' },
      });
    }

    this.eventManager.emit({
      type: "puzzle:initialized",
      instanceId: instance.id,
      timestamp: Date.now(),
      payload: { action: 'puzzle initiation', reason: 'successful' },
    });
    return this.createHandle(instance.id);

  }

  restore<TState>(serializedData: string): PuzzleHandle<TState> {
    const instanceId = this.sessionSerializer.restore(serializedData);

    return this.createHandle(instanceId);
  }

  subscribe(listener: Parameters<EventManager["subscribe"]>[0]): () => void {
    return this.eventManager.subscribe(listener);
  }

  registerConstraint(constraint: Parameters<ConstraintRegistry["register"]>[0]): void {
    this.constraintRegistry.register(constraint);
  }

  private createHandle<TState>(instanceId: string): PuzzleHandle<TState> {
    return new PuzzleHandle<TState>(
      instanceId,
      this.instanceManager,
      this.stateManager,
      this.actionDispatcher,
      this.eventManager,
      this.completionChecker,
      this.sessionSerializer
    );
  }

  createFromJSON<TState = unknown>(json: string): PuzzleHandle<TState> {
    let parsed: unknown;
    try {
      parsed = JSON.parse(json);
    } catch {
      throw new Error("Invalid JSON: could not parse puzzle definition");
    }

    const definition = validatePuzzleDefinition(parsed);
    for (const reference of definition.constraints ?? []) {
      this.constraintRegistry.get(reference.id);
    }

    return this.create<TState>({ definition });
  }

}

function createDefaultConstraintRegistry(): ConstraintRegistry {
  const registry = new ConstraintRegistry();

  for (const constraint of builtInConstraints) {
    registry.register(constraint);
  }

  return registry;
}