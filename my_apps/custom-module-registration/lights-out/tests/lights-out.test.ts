
import { describe, it, expect } from "vitest";
import { lightsOutModule } from "../src/lights-out.module";

describe("Lights Out Module", () => {
  it("initializes a board", () => {
    const state = lightsOutModule.initialize({ size: 3 });

    expect(state.lights).toHaveLength(9);
    expect(state.moves).toBe(0);
  });

  it("toggles a cell and its neighbors", () => {
    const state = lightsOutModule.initialize({
      size: 3,
      initialLights: Array(9).fill(false),
    });

    const result = lightsOutModule.processAction(state, {
      type: "TOGGLE_LIGHT",
      payload: { index: 4 },
    });

    expect(result.accepted).toBe(true);

    if (result.accepted) {
      expect(result.state.lights).toEqual([
        false, true, false,
        true, true, true,
        false, true, false,
      ]);
      expect(result.state.moves).toBe(1);
    }
  });

  it("toggles only available neighbors at a corner", () => {
    const state = lightsOutModule.initialize({ size: 3 });

    const result = lightsOutModule.processAction(state, {
      type: "TOGGLE_LIGHT",
      payload: { index: 0 },
    });

    expect(result.accepted).toBe(true);

    if (result.accepted) {
      expect(result.state.lights).toEqual([
        true, true, false,
        true, false, false,
        false, false, false,
      ]);
    }
  });

  it("rejects invalid indices", () => {
    const state = lightsOutModule.initialize({ size: 3 });

    const result = lightsOutModule.processAction(state, {
      type: "TOGGLE_LIGHT",
      payload: { index: 9 },
    });

    expect(result.accepted).toBe(false);
  });

  it("detects completion when all lights are off", () => {
    const state = lightsOutModule.initialize({ size: 3 });

    expect(lightsOutModule.isComplete(state)).toBe(true);
  });

  it("does not mutate the original state", () => {
    const state = lightsOutModule.initialize({ size: 3 });
    const originalLights = [...state.lights];

    lightsOutModule.processAction(state, {
      type: "TOGGLE_LIGHT",
      payload: { index: 4 },
    });

    expect(state.lights).toEqual(originalLights);
  });
});
