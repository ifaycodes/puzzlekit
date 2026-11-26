import type { ElementId } from "../common";
import type { GridCoordinate } from "./coordinates";

export interface GridCell<TValue = unknown> {
  id: ElementId;
  coordinate: GridCoordinate;
  value: TValue | null;
}