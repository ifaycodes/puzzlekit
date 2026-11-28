
import type { PuzzleModule } from "@puzzlekit/core";
import type {
  LightsOutConfig,
  LightsOutState,
  ToggleLightPayload,
} from "./types";

export const lightsOutModule: PuzzleModule<
  LightsOutConfig,
  LightsOutState,
  ToggleLightPayload
> = {
  id: "lights-out",
  version: "1.0.0",

  initialize(config) {
    const { size, initialLights } = config;

    if (!Number.isInteger(size) || size < 2) {
      throw new Error("Board size must be an integer of at least 2.");
    }

    const total = size * size;

    const lights =
      initialLights ?? Array(total).fill(false);

    if (
      lights.length !== total ||
      !lights.every((light) => typeof light === "boolean")
    ) {
      throw new Error("Initial lights must contain one boolean per cell.");
    }

    return {
      size,
      lights: [...lights],
      moves: 0,
    };
  },

  processAction(state, action) {
    if (action.type !== "TOGGLE_LIGHT") {
      return {
        accepted: false,
        reason: `Unsupported action: ${action.type}`,
      };
    }

    const { index } = action.payload;

    if (
      !Number.isInteger(index) ||
      index < 0 ||
      index >= state.lights.length
    ) {
      return {
        accepted: false,
        reason: "Invalid light index.",
      };
    }

    const row = Math.floor(index / state.size);
    const column = index % state.size;

    const affected = [
      index,
      ...(row > 0 ? [index - state.size] : []),
      ...(row < state.size - 1 ? [index + state.size] : []),
      ...(column > 0 ? [index - 1] : []),
      ...(column < state.size - 1 ? [index + 1] : []),
    ];

    const lights = [...state.lights];

    for (const affectedIndex of affected) {
      lights[affectedIndex] = !lights[affectedIndex];
    }

    return {
      accepted: true,
      state: {
        ...state,
        lights,
        moves: state.moves + 1,
      },
    };
  },

  isComplete(state) {
    return state.lights.every((light) => !light);
  },

  serialize(state) {
    return JSON.stringify(state);
  },

  deserialize(data) {
    return JSON.parse(data) as LightsOutState;
  },
};
