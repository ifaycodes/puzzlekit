
import type { Constraint } from "../primitives/common/constraints";

export class ConstraintRegistry {
  private constraints = new Map<string, Constraint>();

  register(constraint: Constraint): void {
    if (this.constraints.has(constraint.id)) {
      throw new Error(
        `Constraint "${constraint.id}" is already registered.`
      );
    }

    this.constraints.set(constraint.id, constraint);
  }

  get(id: string): Constraint {
    const constraint = this.constraints.get(id);

    if (!constraint) {
      throw new Error(`Constraint "${id}" is not registered.`);
    }

    return constraint;
  }

  has(id: string): boolean {
    return this.constraints.has(id);
  }

  unregister(id: string): void {
    this.constraints.delete(id);
  }
}
