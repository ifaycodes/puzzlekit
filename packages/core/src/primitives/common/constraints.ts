export type ConstraintTarget =
  | "state"
  | "action"
  | "element";

export interface Constraint<TContext = unknown> {
  id: string;
  description?: string;
  target: ConstraintTarget;
  validate(context: TContext, config?: unknown): ConstraintResult;

  validate(context: TContext): ConstraintResult;
}

export interface ConstraintResult {
  valid: boolean;
  message?: string;
  code?: string;
}