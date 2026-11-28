import { describe, it, expect } from "vitest";
import { isSolvable } from "../src/validation";

describe("Sliding Puzzle Solvability", () => {
  it("accepts a solved 3x3 board", () => {
    expect(isSolvable([1, 2, 3, 4, 5, 6, 7, 8, 0], 3)).toBe(true);
  });

  it("rejects an unsolvable 3x3 board", () => {
    expect(isSolvable([1, 2, 3, 4, 5, 6, 8, 7, 0], 3)).toBe(false);
  });

  it("accepts a solvable 4x4 board", () => {
    expect(
      isSolvable([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 0], 4)
    ).toBe(true);
  });

  it("rejects an unsolvable 4x4 board", () => {
    expect(
      isSolvable([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 13, 15, 0], 4)
    ).toBe(false);
  });
});
