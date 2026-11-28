import React from "react";
import { PuzzleRuntime } from "@puzzlekit/core";
import {
  PuzzleProvider,
  usePuzzle,
  usePuzzleState,
} from "@puzzlekit/react";
import { lightsOutModule } from "../module/lights-out.module";
import type { LightsOutConfig, LightsOutState } from "../module/types";

const puzzleConfig: LightsOutConfig = {
  size: 5,
  initialLights: [
    true, true, false, true, false,
    false, true, true, false, true,
    true, false, true, true, false,
    false, true, false, true, true,
    true, false, true, false, true,
  ],
};

function createLightsOutPuzzle() {
  const runtime = new PuzzleRuntime();

  runtime.registerModule(lightsOutModule);

  return runtime.create<LightsOutState>({
    definition: {
      id: "demo-lights-out",
      type: "lights-out",
      version: "1.0.0",
      config: puzzleConfig,
    },
  });
}

function LightsOutBoard() {
  const puzzle = usePuzzle<LightsOutState>();
  const state = usePuzzleState<LightsOutState>();

  const handleToggle = (index: number) => {
    puzzle.dispatch({
      type: "TOGGLE_LIGHT",
      payload: { index },
    });
  };

  return (
    <div className="lights-out-game">
      <div className="game-heading">
        <div>
          <p className="eyebrow">CUSTOM MODULE</p>
          <h1>Lights Out</h1>
          <p>Turn off every light. Toggling a cell also changes its neighbours.</p>
        </div>
      </div>

      <div className="game-stats">
        <div>
          <span>Moves</span>
          <strong>{state.moves}</strong>
        </div>
        <div>
          <span>Status</span>
          <strong>{puzzle.isComplete() ? "Completed" : "In progress"}</strong>
        </div>
      </div>

      <div
        className="lights-board"
        style={{
          gridTemplateColumns: `repeat(${state.size}, 1fr)`,
        }}
      >
        {state.lights.map((isOn, index) => (
          <button
            key={index}
            className={`light-cell ${isOn ? "light-on" : "light-off"}`}
            onClick={() => handleToggle(index)}
            aria-label={`Toggle light ${index + 1}, currently ${isOn ? "on" : "off"}`}
          />
        ))}
      </div>

      {puzzle.isComplete() && (
        <p className="completion-message">
          All lights are off. Puzzle completed!
        </p>
      )}

      <button className="reset-button" onClick={() => puzzle.reset()}>
        Reset puzzle
      </button>
    </div>
  );
}

export default function LightsOutGame() {
  const puzzle = createLightsOutPuzzle();

  return (
    <PuzzleProvider handle={puzzle}>
      <LightsOutBoard />
    </PuzzleProvider>
  );
}