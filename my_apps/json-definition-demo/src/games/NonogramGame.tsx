import React, { useState } from "react";
import { PuzzleDefinition, PuzzleRuntime } from "@puzzlekit/core";
import {PuzzleProvider, usePuzzle, usePuzzleState} from "@puzzlekit/react";
import { nonogramModule,} from "../../../../packages/modules/nonogram/src";
import type {NonogramState, NonogramConfig} from "../../../../packages/modules/nonogram/src";

const puzzleConfig: NonogramConfig = {
  rows: 5,
  columns: 5,
  rowClues: [[1, 1], [5], [5], [3], [1]],
  columnClues: [[2], [4], [4], [4], [2]],
  solution: [
    false, true,  false, true,  false,
    true,  true,  true,  true,  true,
    true,  true,  true,  true,  true,
    false, true,  true,  true,  false,
    false, false, true,  false, false,
  ],
  mode: "assisted",
};

const definition = {
  id: "demo-nonogram",
  type: "nonogram",
  version: "1.0.0",
  config: puzzleConfig,
  constraints: [{
    id: "max-mistakes",
    config: { max: 3 }
  }]
};

const  maxMistakes = definition.constraints[0].config.max;

function createNonogramPuzzle() {
  const runtime = new PuzzleRuntime();

  runtime.registerModule(nonogramModule);
  runtime.registerConstraint({
    id: "max-mistakes",
    description: "Caps number of mistake",
    target: "state",
    validate(state: unknown, config?: unknown) {
      const max = (config as { max?: number })?.max ?? 3;
      const mistakes = (state as { mistakes: number }).mistakes;
      return { valid: mistakes <= max, message: `No more than ${max} mistakes allowed. Start over.` };
    },
  });

  return runtime.create<NonogramState>({definition});
}

function NonogramBoard() {
  const puzzle = usePuzzle<NonogramState>();
  const state = usePuzzleState<NonogramState>();

  const [selectedTool, setSelectedTool] = useState<"filled" | "empty">("filled");
  
  const completed = puzzle.isComplete();

  const limitReached = state.mistakes >= maxMistakes;
  const locked = completed || limitReached;


  function selectCell(index: number) {
    puzzle.dispatch({
      type: "SET_CELL",
      payload: {index, value: selectedTool},
    });
  }

  return (
    <div className="nonogram-container">
      <div className="nonogram-info">
        <div>
          <span>Mistakes</span>
          <strong>{state.mistakes}</strong>
        </div>

        <div>
          <span>Max mistakes</span>
          <strong>{maxMistakes}</strong>
        </div>

        <div>
          <span>Status</span>
          <strong>{completed ? "Completed" : "Playing"}</strong>
        </div>
      </div>

      <div className="nonogram-tools">
        <button
          className={selectedTool === "filled" ? "active" : ""}
          onClick={() => setSelectedTool("filled")}
          disabled={locked}
        >
          Fill cell
        </button>

        <button
          className={selectedTool === "empty" ? "active" : ""}
          onClick={() => setSelectedTool("empty")}
          disabled={locked}
        >
          Mark empty
        </button>
      </div>

      <div
        className="nonogram-board"
        style={{
          gridTemplateColumns: `64px repeat(${state.columns}, 54px)`,
          gridTemplateRows: `64px repeat(${state.rows}, 54px)`,
        }}
      >
        <div className="nonogram-corner" />

        {puzzleConfig.columnClues.map((clues, index) => (
          <div className="column-clue" key={`column-${index}`}>
            {clues.map((clue, clueIndex) => (
              <span key={clueIndex}>{clue}</span>
            ))}
          </div>
        ))}

        {puzzleConfig.rowClues.map((clues, rowIndex) => (
          <div className="nonogram-row" key={`row-${rowIndex}`}>
            <div className="row-clue">
              {clues.map((clue, clueIndex) => (
                <span key={clueIndex}>{clue}</span>
              ))}
            </div>

            {state.cells
              .slice(
                rowIndex * state.columns,
                (rowIndex + 1) * state.columns
              )
              .map((cell, columnIndex) => {
                const index =
                  rowIndex * state.columns + columnIndex;

                return (
                  <button
                    key={index}
                    className={`nonogram-cell ${cell}`}
                    onClick={() => selectCell(index)}
                    disabled={completed}
                    aria-label={`Row ${rowIndex + 1}, column ${
                      columnIndex + 1
                    }, ${cell}`}
                  >
                    {cell === "filled" ? "" : cell === "empty" ? "×" : ""}
                  </button>
                );
              })}
          </div>
        ))}
      </div>

      {limitReached && !completed && (<p className="error-message">
        No more than {maxMistakes} mistakes allowed. Start over.
      </p>)}

      {completed && (
        <p className="completion-message">
          Puzzle completed! You revealed the hidden pattern.
        </p>
      )}

      <button
        className="reset-button"
        onClick={() => puzzle.reset()}
      >
        Reset puzzle
      </button>
    </div>
  );
}

export default function NonogramGame() {
  const [puzzle] = useState(createNonogramPuzzle);

  return (
    <PuzzleProvider handle={puzzle}>
      <NonogramBoard />
    </PuzzleProvider>
  );
}
