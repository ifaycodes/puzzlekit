import type {
  ConstraintResult,
  ConstraintTarget,
} from "../primitives/common/constraints";
import type { ConstraintReference } from "../types";
import { ConstraintRegistry } from "./constraint-registry";

export class ConstraintEngine {
  constructor(
    private readonly registry: ConstraintRegistry
  ) {}

  validate(
    target: ConstraintTarget,
    context: unknown,
    references: ConstraintReference[]
  ): ConstraintResult[] {
    const results: ConstraintResult[] = [];

    for (const reference of references) {
      const constraint = this.registry.get(reference.id);

      if (constraint.target !== target) {
        throw new Error(
          `Constraint "${reference.id}" targets "${constraint.target}", not "${target}".`
        );
      }

      results.push(constraint.validate(context, reference.config));
    }

    return results;
  }

  validateForTarget(
    target: ConstraintTarget,
    context: unknown,
    references: ConstraintReference[]
    ): ConstraintResult[] {
    const results: ConstraintResult[] = [];

    for (const reference of references) {
        const constraint = this.registry.get(reference.id);

        if (constraint.target !== target) {
        continue;
        }

        results.push(constraint.validate(context, reference.config));
    }

    return results;
    }

  isValid(results: ConstraintResult[]): boolean {
    return results.every((result) => result.valid);
  }
}
