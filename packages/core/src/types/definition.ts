export interface PuzzleDefinition<TConfig = unknown> {
  id: string;
  type: string;
  version: string;
  config: TConfig;
  constraints?: ConstraintReference[];
}

export interface ConstraintReference {
  id: string;
  config?: unknown;
}