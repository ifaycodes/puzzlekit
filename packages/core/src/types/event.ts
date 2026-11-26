export type StandardEventType =
  | "puzzle:initialized"
  | "action:accepted"
  | "action:rejected"
  | "state:updated"
  | "puzzle:completed"
  | "puzzle:reset";

export interface PuzzleEvent<TPayload = unknown> {
  type: string;
  instanceId: string;
  timestamp: number;
  payload: TPayload;
}