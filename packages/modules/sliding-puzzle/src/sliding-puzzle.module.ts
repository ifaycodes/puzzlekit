import type { PuzzleModule } from "@puzzlekit/core";
import type {
    SlidingPuzzleConfig, SlidingPuzzleState, MoveTilePayload
} from "./types";
import { isSolvable } from "./validation";

export const slidingPuzzleModule: PuzzleModule<
    SlidingPuzzleConfig, SlidingPuzzleState, MoveTilePayload
> = {
    id: "sliding-puzzle",
    version: "1.0.0",

    initialize(config) {
        const { size, initialTiles } = config;
        const total = size * size;

        if (
            !Number.isInteger(size) || size < 2
        ) {
            throw new Error("Board size must be integers of at least 2.");
        }

        const tiles = initialTiles ?? Array.from({ length: total }, (_, i) =>
            i === total - 1 ? 0 : i + 1 );

        if (tiles.length !== total) {
            throw new Error("Tile count must match grid dimensions.");
        }

        if (new Set(tiles).size !== total || !tiles.includes(0) ||
            tiles.some((tile) => !Number.isInteger(tile) || tile < 0 || tile >= total)) {
            throw new Error("Tiles must contain each value from 0 to toal - 1 exactly once.");
        }

        if (!isSolvable(tiles, size)) {
            throw new Error("This tile arrangement is not solvable.");
        }

        return {
            size: size,
            tiles: [...tiles],
            emptyIndex: tiles.indexOf(0),
            moves: 0,
        };
    },

    processAction(state, action) {
        if (action.type !== "MOVE_TILE") {
            return {
                accepted: false,
                reason: `Unsupported action: ${action.type}`,
            };
        }

        const { tileIndex } = action.payload;

        if ( !Number.isInteger(tileIndex) || tileIndex < 0 || tileIndex >= state.tiles.length ) {
            return { accepted: false, reason: "Invalid title index."};
        }

        const columns = state.size;

        const emptyRow = Math.floor(state.emptyIndex / columns);
        const emptyColumn = state.emptyIndex % columns;

        const tileRow = Math.floor(tileIndex / columns);
        const tileColumn = tileIndex % columns;

        const distance = Math.abs(emptyRow - tileRow) + Math.abs(emptyColumn - tileColumn);

        if (distance !== 1) {
            return {
                accepted: false, reason: "Tile is not adjacent to the empty space."
            };
        }

        const tiles = [...state.tiles];
        tiles[state.emptyIndex] = tiles[tileIndex];
        tiles[tileIndex] = 0;

        return {
            accepted: true,
            state: { ...state, tiles, emptyIndex: tileIndex, moves: state.moves + 1},
        };
    },

    isComplete(state) {
        return state.tiles.every((tile, index) => {
        if (index === state.tiles.length - 1) {
            return tile === 0;
        }

        return tile === index + 1;
        });
    },

    serialize(state) {
        return JSON.stringify(state);
    },

    deserialize(data) {
        return JSON.parse(data) as SlidingPuzzleState;
    }

}