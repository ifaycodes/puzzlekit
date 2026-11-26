import type { ConstraintReference, PuzzleDefinition } from "../types";

export function validatePuzzleDefinition(input: unknown): PuzzleDefinition {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    throw new Error("Puzzle definition must be an object.");
  }

  const definition = input as Record<string, unknown>;

  if (typeof definition.id !== "string" || !definition.id.trim()) {
    throw new Error("Puzzle definition must have a valid id.");
  }

  if (typeof definition.type !== "string" || !definition.type.trim()) {
    throw new Error("Puzzle definition must have a valid type.");
  }

  if (typeof definition.version !== "string" || !definition.version.trim()) {
    throw new Error("Puzzle definition must have a valid version.");
  }

  if (typeof definition.config !== "object" || definition.config === null 
    || Array.isArray(definition.config)) {
    throw new Error("Puzzle definition config must be an object.");
  }

  let constraints: ConstraintReference[] | undefined;

  if (definition.constraints !== undefined) {
    if (!Array.isArray(definition.constraints)) {
      throw new Error("Constraints must be an array.");
    }

    constraints = definition.constraints.map(
      (item: unknown): ConstraintReference => {
        if (
          typeof item !== "object" ||
          item === null ||
          Array.isArray(item)
        ) {
          throw new Error("Each constraint must be an object.");
        }

        const reference = item as Record<string, unknown>;

        if (
          typeof reference.id !== "string" ||
          !reference.id.trim()
        ) {
          throw new Error("Each constraint must have a valid id.");
        }

        return {
          id: reference.id,
          ...(reference.config !== undefined
            ? { config: reference.config }
            : {}),
        };
      }
    );
  }

  return {
    id: definition.id,
    type: definition.type,
    version: definition.version,
    config: definition.config,
    constraints,
  };
}