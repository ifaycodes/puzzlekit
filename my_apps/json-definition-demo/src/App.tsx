
import React, { useState } from "react";
import SlidingPuzzleGame from "./games/SlidingPuzzleGame";
import NonogramGame from "./games/NonogramGame";

type GameId = "sliding-puzzle" | "nonogram";

interface Game {
  id: GameId;
  name: string;
  description: string;
  category: string;
}

const games: Game[] = [
  {
    id: "sliding-puzzle",
    name: "Sliding Puzzle",
    description: "Arrange the numbered tiles in their correct order.",
    category: "Declarative Module",
  },
  {
    id: "nonogram",
    name: "Nonogram",
    description: "Use numerical clues to reveal a hidden picture.",
    category: "Declarative Module",
  },
];

function App() {
  const [selectedGame, setSelectedGame] = useState<GameId | null>(null);

  return (
    <main className="app">
      <header className="header">
        <div className="brand">PuzzleKit</div>
        <span className="header-label">ENGINE DEMO</span>
      </header>

      {selectedGame === null ? (
        <section className="home">
          <div className="intro">
            <p className="eyebrow">BUILT WITH PUZZLEKIT</p>
            <h1>One engine. Different puzzles.</h1>
            <p>
              Explore different puzzle mechanics powered by the same
              extensible game engine.
            </p>
          </div>

          <div className="game-grid">
            {games.map((game) => (
              <article className="game-card" key={game.id}>
                <div className="game-card-content">
                  <span className="category">{game.category}</span>
                  <h2>{game.name}</h2>
                  <p>{game.description}</p>
                </div>

                <button
                  className="play-button"
                  onClick={() => setSelectedGame(game.id)}
                >
                  Play puzzle →
                </button>
              </article>
            ))}
          </div>
        </section>
      ) : (
        <section className="game-view">
          <button
            className="back-button"
            onClick={() => setSelectedGame(null)}
          >
            ← All puzzles
          </button>

          {selectedGame === "sliding-puzzle" && <SlidingPuzzleGame />}
          {selectedGame === "nonogram" && <NonogramGame />}
        </section>
      )}
    </main>
  );
}

export default App;
