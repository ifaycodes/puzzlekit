import type { GridCell } from "./cell";
import type { GridDimensions, GridCoordinate } from "./coordinates";

export interface Grid<TValue = unknown> {
  dimensions: GridDimensions;
  cells: GridCell<TValue>[];
}