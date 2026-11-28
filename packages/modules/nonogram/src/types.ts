export type CellValue = "filled" | "empty" | "unknown";
export type NonogramMode = "strict" | "assisted" | "learning";

export interface NonogramConfig {
  rows: number;
  columns: number;
  rowClues: number[][];
  columnClues: number[][];
  solution: boolean[];
  mode?: NonogramMode;
}

export interface NonogramState {
  rows: number;
  columns: number;
  cells: CellValue[];
  mistakes: number;
  mode: NonogramMode;
}

export interface SetCellPayload {
  index: number;
  value: Exclude<CellValue, "unknown">;
}
