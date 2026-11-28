import React, { useState } from "react";
import { PuzzleRuntime } from "@puzzlekit/core";
import { PuzzleProvider, usePuzzle, usePuzzleState } from "@puzzlekit/react";
import { slidingPuzzleModule } from "../../../../packages/modules/sliding-puzzle/src"
import type { SlidingPuzzleState } from "../../../../packages/modules/sliding-puzzle/src";


function createSlidingPuzzle() {
  const runtime = new PuzzleRuntime();

  runtime.registerModule(slidingPuzzleModule);

  return runtime.create<SlidingPuzzleState>({
    definition: {
      id: "demo-sliding-puzzle",
      type: "sliding-puzzle",
      version: "1.0.0",
      config: {
        size: 3,
        initialTiles: [1, 2, 3, 5, 7, 6, 4, 8, 0],
      },
    },
  });
}

function SlidingPuzzleBoard() {
  const puzzle = usePuzzle<SlidingPuzzleState>();
  const state = usePuzzleState<SlidingPuzzleState>();

  return (
    <div className="puzzle-container">
      <div className="puzzle-info">
        <div>
          <span>Moves</span>
          <strong>{state.moves}</strong>
        </div>

        <div>
          <span>Status</span>
          <strong>{puzzle.isComplete() ? "Completed" : "Playing"}</strong>
        </div>
      </div>

      <div
        className="sliding-board"
        style={{ gridTemplateColumns: `repeat(${state.size}, 1fr)` }}
      >
        {state.tiles.map((tile, index) =>
          tile === 0 ? (
            <div className="tile empty" key={index} />
          ) : (
            <button
              className="tile"
              key={index}
              disabled={puzzle.isComplete()}
              onClick={() =>
                puzzle.dispatch({
                  type: "MOVE_TILE",
                  payload: { tileIndex: index },
                })
              }
            >
              {tile}
            </button>
          )
        )}
      </div>

      {puzzle.isComplete() && (
        <p className="completion-message">
          Puzzle completed!
        </p>
      )}

      <button className="reset-button" onClick={() => puzzle.reset()}>
        Reset puzzle
      </button>
    </div>
  );
}

export default function SlidingPuzzleGame() {
  const [puzzle] = useState(createSlidingPuzzle);

  return (
    <PuzzleProvider handle={puzzle}>
      <SlidingPuzzleBoard />
    </PuzzleProvider>
  );
}
