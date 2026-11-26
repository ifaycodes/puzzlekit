export interface PuzzleAction<TPayload = unknown> {
  type: string;
  payload: TPayload;
}

export type FeedbackType =
  | "success"
  | "error"
  | "warning"
  | "info";

export interface ActionFeedback {
  type: FeedbackType;
  code: string;
  message: string;
  metadata?: Record<string, unknown>;
}

export interface ModuleEvent<TPayload = unknown> {
  type: string;
  payload: TPayload;
}

export type ActionResult<TState> =
  | {
      accepted: true;
      state: TState;
      feedback?: ActionFeedback[];
      events?: ModuleEvent[];
    }
  | {
      accepted: false;
      reason: string;
      feedback?: ActionFeedback[];
      events?: ModuleEvent[];
    };