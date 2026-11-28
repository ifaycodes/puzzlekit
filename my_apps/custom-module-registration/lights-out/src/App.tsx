import React, { useState } from "react";
import LightsOutGame from "./games/LightsOutGame";

type GameId = "lights-out";

interface Game {
  id: GameId;
  name: string;
  description: string;
  category: string;
}

const games: Game[] = [
  {
    id: "lights-out",
    name: "Lights Out",
    description: "Turn off every light by toggling cells.",
    category: "Custom Module",
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
          {selectedGame === "lights-out" && <LightsOutGame />}
        </section>
      )}
    </main>
  );
}

export default App;
