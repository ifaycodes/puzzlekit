import type {
  PuzzleDefinition,
  PuzzleInstance,
  PuzzleModule,
  PuzzleState,
} from "../types";

import { ModuleRegistry } from "./module-registry";
import { StateManager } from "./state-manager";
import { validatePuzzleDefinition, ConstraintRegistry, ConstraintEngine } from "../definitions";

export class InstanceManager {
    private instances = new Map<string, PuzzleInstance>();
    private instanceModules = new Map<string, PuzzleModule>();
    private definitions = new Map<string, PuzzleDefinition>();
    readonly constraintRegistry = new  ConstraintRegistry();
    private constraintEngine = new ConstraintEngine(this.constraintRegistry);

    constructor(
        private readonly moduleRegistry: ModuleRegistry,
        private readonly stateManager: StateManager
    ) {}

    create(definition: PuzzleDefinition): PuzzleInstance {
        const module = this.moduleRegistry.get(definition.type);

        const id = crypto.randomUUID();
        const now = Date.now();

        const validDefinition = validatePuzzleDefinition(definition);
        for (const reference of validDefinition.constraints ?? []) {
            this.constraintRegistry.get(reference.id);
        }

        const state = module.initialize(validDefinition.config);

        const instance: PuzzleInstance = {
            id,
            definitionId: validDefinition.id,
            moduleId: module.id,
            status: "ready",
            createdAt: now,
            updatedAt: now,
        };

        this.instances.set(id, instance);
        this.instanceModules.set(id, module);
        this.definitions.set(id, definition);
        this.stateManager.set(id, state);

        return instance;
    }

    get(instanceId: string): PuzzleInstance {
        const instance = this.instances.get(instanceId);

        if (!instance) {
            throw new Error(
            `Puzzle instance "${instanceId}" was not found.`
            );
        }

        return instance;
    }

    update(
        instanceId: string,
        updates: Partial<Pick<PuzzleInstance, "status" | "updatedAt">>
        ): void {

        const instance = this.get(instanceId);

        this.instances.set(instanceId, {
            ...instance,
            ...updates,
        });
    }

    restore(
        instance: PuzzleInstance,
        definition: PuzzleDefinition,
        module: PuzzleModule,
        state: PuzzleState
        ): void {
        if (this.instances.has(instance.id)) {
            throw new Error("Instance already exists.");
        }

        if (module.id !== instance.moduleId) {
            throw new Error("Module does not match saved instance.");
        }

        this.instances.set(instance.id, instance);
        this.definitions.set(instance.id, definition);
        this.instanceModules.set(instance.id, module);
        this.stateManager.set(instance.id, state);
    }
    
    reset(instanceId: string): void {
        const definition = this.getDefinition(instanceId);
        const module = this.getModule(instanceId);
        
        const initialState = module.initialize(definition.config);
        this.stateManager.set(instanceId, initialState);
        
        this.update(instanceId, {
            status: 'ready', updatedAt: Date.now(),
        });
    }
    
    has(instanceId: string): boolean {
        return this.instances.has(instanceId);
    }
    
    getDefinition(instanceId: string): PuzzleDefinition {
        const definition = this.definitions.get(instanceId);

        if (!definition) {
            throw new Error(`Puzzle definition for "${instanceId}" not found.`);
        }

        return definition;
    }

    getModule(instanceId: string): PuzzleModule {
        const module = this.instanceModules.get(instanceId);

        if (!module) {
            throw new Error(
            `Module for instance "${instanceId}" was not found.`
            );
        }

        return module;
    }

    destroy(instanceId: string): void {
        this.instances.delete(instanceId);
        this.instanceModules.delete(instanceId);
        this.definitions.delete(instanceId);
        this.stateManager.remove(instanceId);
    }
}
