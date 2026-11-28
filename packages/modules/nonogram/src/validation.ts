import type { CellValue } from "./types";

export function getLineClues(line: CellValue[]): number[] {
  const clues: number[] = [];
  let count = 0;

  for (const cell of line) {
    if (cell === "filled") {
      count++;
    } else if (count > 0) {
      clues.push(count);
      count = 0;
    }
  }

  if (count > 0) {
    clues.push(count);
  }

  return clues;
}

export function matchesClues(
  line: CellValue[],
  expected: number[]
): boolean {
  const actual = getLineClues(line);

  return (
    actual.length === expected.length &&
    actual.every((value, index) => value === expected[index])
  );
}

export function generateSolutionClues(solution: boolean[], rows: number, columns: number ) : { rowClues: number[][]; columnClues: number[][];} {
    const rowClues: number[][] = [];
    const columnClues: number[][] = [];

    for (let row = 0; row < rows; row++) {
        const line = solution.slice(
            row * columns, (row + 1) * columns
        );

        rowClues.push( getLineClues( line.map((cell) => cell ? "filled" : "empty")));
    }

    for (let column = 0; column < columns; column++) {
        const line: boolean[] = [];

        for (let row = 0; row < rows; row++) {
            line.push(solution[row * columns + column]);
        }

        columnClues.push( getLineClues( line.map((cell) => cell ? "filled" : "empty")));
    } 

    return { rowClues, columnClues };
}