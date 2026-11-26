import type { PuzzleModule } from "../types";

export class ModuleRegistry {
  private modules = new Map<string, PuzzleModule>();

  register(module: PuzzleModule): void {
    if (this.modules.has(module.id)) {
      throw new Error(
        `Module "${module.id}" is already registered.`
      );
    }

    this.modules.set(module.id, module);
  }

  get(moduleId: string): PuzzleModule {
    const module = this.modules.get(moduleId);

    if (!module) {
      throw new Error(
        `Module "${moduleId}" is not registered.`
      );
    }

    return module;
  }

  has(moduleId: string): boolean {
    return this.modules.has(moduleId);
  }

  unregister(moduleId: string): boolean {
    return this.modules.delete(moduleId);
  }
}
