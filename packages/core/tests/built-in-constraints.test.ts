
import { describe, it, expect } from "vitest";
import { builtInConstraints } from "../src/definitions/built-in-constraints";

const getConstraint = (id: string) => {
  const constraint = builtInConstraints.find((item) => item.id === id);

  if (!constraint) {
    throw new Error(`Missing built-in constraint: ${id}`);
  }

  return constraint;
};

describe("Built-in Constraints", () => {
  describe("unique-values", () => {
    const constraint = getConstraint("unique-values");

    it("accepts unique values", () => {
      expect(
        constraint.validate(
          { tiles: [1, 2, 3] },
          { path: "tiles" }
        ).valid
      ).toBe(true);
    });

    it("rejects duplicate values", () => {
      expect(
        constraint.validate(
          { tiles: [1, 2, 2] },
          { path: "tiles" }
        ).valid
      ).toBe(false);
    });

    it("rejects non-array input", () => {
      expect(
        constraint.validate(
          { tiles: "invalid" },
          { path: "tiles" }
        ).valid
      ).toBe(false);
    });
  });

  describe("required-fields", () => {
    const constraint = getConstraint("required-fields");

    it("accepts objects containing all required fields", () => {
      expect(
        constraint.validate(
          { size: 3, moves: 0 },
          { fields: ["size", "moves"] }
        ).valid
      ).toBe(true);
    });

    it("rejects objects with missing fields", () => {
      expect(
        constraint.validate(
          { size: 3 },
          { fields: ["size", "moves"] }
        ).valid
      ).toBe(false);
    });

    it("rejects invalid configuration", () => {
      expect(
        constraint.validate({ size: 3 }, { fields: "size" }).valid
      ).toBe(false);
    });
  });

  describe("valid-range", () => {
    const constraint = getConstraint("valid-range");

    it("accepts values within range", () => {
      expect(
        constraint.validate(5, { min: 0, max: 10 }).valid
      ).toBe(true);
    });

    it("rejects values outside range", () => {
      expect(
        constraint.validate(15, { min: 0, max: 10 }).valid
      ).toBe(false);
    });

    it("rejects invalid ranges", () => {
      expect(
        constraint.validate(5, { min: 10, max: 0 }).valid
      ).toBe(false);
    });
  });
});
