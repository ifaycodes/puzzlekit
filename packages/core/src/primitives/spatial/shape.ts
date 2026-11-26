import type { Position } from "./position";

export interface Shape {
  id: string;
  cells: Position[];
}

export interface Placement {
  shapeId: string;
  position: Position;
  rotation?: number;
}