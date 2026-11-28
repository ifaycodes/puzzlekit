# Constraints

Constraints provide reusable validation logic that can be applied to puzzle definitions, actions, and state.

They allow developers to enforce common requirements without embedding every validation rule inside individual puzzle modules.

PuzzleKit supports built-in constraints and custom constraints.

## 1. How Constraints Work

A constraint defines a validation rule and the target it applies to.

When an action is processed or there's a state change, the constraint engine evaluates the applicable constraints.

A constraint can:

- Accept the supplied data.
- Reject the supplied data with a reason.

Constraints complement module-specific validation. They do not replace the rules that define how a puzzle works.

## 2. Constraint References

Puzzle definitions reference constraints by ID.

A reference can also include configuration specific to that constraint.

```ts
interface ConstraintReference {
  id: string;
  config?: unknown;
}
```

For example:

```ts
const definition = {
  id: "my-puzzle",
  type: "sliding-puzzle",
  version: "1.0.0",
  config: {
    size: 3,
  },
  constraints: [
    {
      id: "required-fields",
      config: {
        fields: ["size"],
      },
    },
  ],
};
```

The constraint must be registered before the definition is created.

## 3. Built-in Constraints

PuzzleKit includes reusable constraints for common validation requirements. These built-in constraints target state only.

### Unique Values

The `unique-values` constraint checks that values in a collection are unique.

This is useful when duplicate values are not permitted.

### Required Fields

The `required-fields` constraint checks that specified fields are present in an object.

For example, a puzzle configuration may require a `size` field.

### Valid Range

The `valid-range` constraint checks whether a numeric value falls within a configured range.

These constraints provide common validation building blocks that can be reused across puzzle definitions.

## 4. Registering Constraints

Constraints are registered with the runtime.

```ts
const runtime = new PuzzleRuntime();

runtime.registerConstraint(myConstraint);
```

Once registered, a constraint can be referenced by its ID in puzzle definitions.

Constraint IDs must be unique within the registry.

## 5. Creating Custom Constraints

Developers can implement their own constraints when the built-in options do not cover their requirements.

A custom constraint defines:

- An ID.
- The target it applies to.
- A validation function.

For example, a constraint could validate that a puzzle configuration uses an allowed board size.

The exact implementation should follow the `Constraint` interface exported by `@puzzlekit/core`.

After implementing the constraint, register it with the runtime:

```ts
runtime.registerConstraint(boardSizeConstraint);
```

It can then be referenced in a puzzle definition like any built-in constraint.

## 6. Constraint Targets

Constraints are associated with specific validation targets.

The constraint engine checks the target before running a constraint, ensuring that a constraint is only evaluated against the kind of data it was designed to validate.

This allows developers to create constraints for different parts of the puzzle lifecycle without applying every rule indiscriminately.

## 7. Constraints and Puzzle Modules

Constraints and puzzle modules have different responsibilities.

| Constraints | Puzzle Modules |
|---|---|
| Enforce reusable validation requirements | Define puzzle mechanics |
| Can be shared across puzzle types | Implement specific puzzle types |
| Validate applicable data | Process player actions |
| Are registered independently | Are registered as modules |

For example, a uniqueness constraint could be reused by several puzzle types, while the rules governing how a player moves a tile remain part of the Sliding Puzzle module.

## 8. When to Use Constraints

Use constraints when:

- A validation rule can be reused across puzzle types.
- A definition needs additional structural or configuration validation.
- Developers need to extend validation without modifying the core engine.

Use module-specific validation when a rule is fundamental to how a particular puzzle works.
