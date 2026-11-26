import type { Grid } from "./grid";
import type { GridCell } from "./cell";
import type { GridCoordinate } from "./coordinates";

export function getCell<TValue>(
  grid: Grid<TValue>,
  coordinate: GridCoordinate
): GridCell<TValue> | undefined {
  return grid.cells.find(
    (cell) =>
      cell.coordinate.row === coordinate.row &&
      cell.coordinate.column === coordinate.column
  );
}

export function isValidCoordinate(
  dimensions: { rows: number; columns: number },
  coordinate: GridCoordinate
): boolean {
  return (
    coordinate.row >= 0 &&
    coordinate.row < dimensions.rows &&
    coordinate.column >= 0 &&
    coordinate.column < dimensions.columns
  );
}

export function getAdjacentCoordinates(
  dimensions: { rows: number; columns: number },
  coordinate: GridCoordinate
): GridCoordinate[] {
  const candidates: GridCoordinate[] = [
    { row: coordinate.row - 1, column: coordinate.column },
    { row: coordinate.row + 1, column: coordinate.column },
    { row: coordinate.row, column: coordinate.column - 1 },
    { row: coordinate.row, column: coordinate.column + 1 },
  ];

  return candidates.filter((candidate) =>
    isValidCoordinate(dimensions, candidate)
  );
}