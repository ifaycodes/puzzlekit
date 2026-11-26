
import type { PuzzleDefinition } from "../types";

import { InstanceManager } from "./instance-manager";
import { StateManager } from "./state-manager";
import { ModuleRegistry } from "./module-registry";

import type { SerializedPuzzleSession } from "./session-serializer-types";

export class SessionSerializer {
  constructor(
    private readonly instanceManager: InstanceManager,
    private readonly stateManager: StateManager,
    private readonly moduleRegistry: ModuleRegistry
  ) {}

  serialize(instanceId: string): string {
    const instance = this.instanceManager.get(instanceId);
    const module = this.instanceManager.getModule(instanceId);
    const definition = this.instanceManager.getDefinition(instanceId);
    const state = this.stateManager.get(instanceId);

    const session: SerializedPuzzleSession = {
      formatVersion: 1,
      definition,
      instance,
      moduleVersion: module.version,
      state: module.serialize(state),
    };

    return JSON.stringify(session);
  }

  restore(serializedData: string): string {
    const session = JSON.parse(
      serializedData
    ) as SerializedPuzzleSession;

    if (session.formatVersion !== 1) {
      throw new Error("Unsupported session format.");
    }

    const module = this.moduleRegistry.get(
      session.instance.moduleId
    );

    if (module.version !== session.moduleVersion) {
      throw new Error(
        "Module version mismatch. Cannot safely restore session."
      );
    }

    if (session.definition.type !== module.id) {
        throw new Error("Saved definition does not match module");
    }

    const state = module.deserialize(session.state);

    this.instanceManager.restore(
      session.instance,
      session.definition,
      module,
      state
    );

    return session.instance.id;
  }
}
