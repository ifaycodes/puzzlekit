import type {
  Constraint,
  ConstraintResult,
} from "../primitives/common/constraints";

type ConstraintConfig = {
  path?: string;
  fields?: string[];
  min?: number;
  max?: number;
};

function getValueAtPath(
  context: unknown,
  path?: string
): unknown {
  if (!path) return context;

  return path.split(".").reduce<unknown>((value, key) => {
    if (
      typeof value !== "object" ||
      value === null ||
      !(key in value)
    ) {
      return undefined;
    }

    return (value as Record<string, unknown>)[key];
  }, context);
}

function getConfig(config: unknown): ConstraintConfig {
  if (
    typeof config !== "object" ||
    config === null ||
    Array.isArray(config)
  ) {
    return {};
  }

  return config as ConstraintConfig;
}

function failure(message: string): ConstraintResult {
  return { valid: false, message };
}

export const builtInConstraints: Constraint[] = [
  {
    id: "unique-values",
    description: "Ensures all values in an array are unique.",
    target: "state",

    validate(context: unknown, rawConfig?: unknown) {
      const config = getConfig(rawConfig);
      const value = getValueAtPath(context, config.path);

      if (!Array.isArray(value)) {
        return failure("Expected an array for unique-values.");
      }

      return {
        valid: new Set(value).size === value.length,
        message: "Values must be unique.",
      };
    },
  },

  {
    id: "required-fields",
    description: "Ensures an object contains required fields.",
    target: "state",

    validate(context: unknown, rawConfig?: unknown) {
      const config = getConfig(rawConfig);
      const value = getValueAtPath(context, config.path);

      if (
        typeof value !== "object" ||
        value === null ||
        Array.isArray(value)
      ) {
        return failure("Expected an object for required-fields.");
      }

      if (
        !Array.isArray(config.fields) ||
        !config.fields.every((field) => typeof field === "string")
      ) {
        return failure("required-fields needs a fields array.");
      }

      const missing = config.fields.filter(
        (field) =>
          !Object.prototype.hasOwnProperty.call(value, field)
      );

      return {
        valid: missing.length === 0,
        message:
          missing.length > 0
            ? `Missing required fields: ${missing.join(", ")}.`
            : undefined,
      };
    },
  },

  {
    id: "valid-range",
    description: "Ensures a numeric value falls within a range.",
    target: "state",

    validate(context: unknown, rawConfig?: unknown) {
      const config = getConfig(rawConfig);
      const value = getValueAtPath(context, config.path);

      if (typeof value !== "number" || !Number.isFinite(value)) {
        return failure("Expected a finite number for valid-range.");
      }

      if (
        (config.min !== undefined &&
          typeof config.min !== "number") ||
        (config.max !== undefined &&
          typeof config.max !== "number")
      ) {
        return failure("Range boundaries must be numbers.");
      }

      if (
        config.min !== undefined &&
        config.max !== undefined &&
        config.min > config.max
      ) {
        return failure("Minimum cannot exceed maximum.");
      }

      const valid =
        (config.min === undefined || value >= config.min) &&
        (config.max === undefined || value <= config.max);

      return {
        valid,
        message: `Value must be between ${config.min ?? "-∞"} and ${config.max ?? "∞"}.`,
      };
    },
  },
];
