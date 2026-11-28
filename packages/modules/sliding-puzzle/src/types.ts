export interface SlidingPuzzleConfig {
    size: number;
    initialTiles?: number[];
}

export interface SlidingPuzzleState {
    size: number,
    tiles: number[];
    emptyIndex: number;
    moves: number;
}

export interface MoveTilePayload {
    tileIndex: number;
}