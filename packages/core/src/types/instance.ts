export type PuzzleStatus =
  | "ready"
  | "active"
  | "completed"
  | "destroyed";

export interface PuzzleInstance {
  id: string;
  definitionId: string;
  moduleId: string;
  status: PuzzleStatus;
  createdAt: number;
  updatedAt: number;
}