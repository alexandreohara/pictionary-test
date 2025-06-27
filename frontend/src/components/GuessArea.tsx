import React, { useState } from "react";
import { useGame } from "../contexts/GameContext";

const GuessArea: React.FC = () => {
  const { socket, roomCode, username, guesses } = useGame();
  const [guess, setGuess] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guess.trim()) return;

    socket?.emit("guess_word", {
      roomCode,
      guess: guess.trim(),
      username,
    });

    setGuess("");
  };

  return (
    <div className="card">
      <h3 className="font-bold text-gray-800 mb-3">Guesses</h3>

      {/* Guess list */}
      <div className="bg-gray-50 rounded-lg p-3 mb-4 h-40 overflow-y-auto">
        {guesses.length === 0 ? (
          <p className="text-gray-500 text-sm text-center">No guesses yet...</p>
        ) : (
          <div className="space-y-2">
            {guesses.map((g, index) => (
              <div key={index} className="text-sm">
                <span className="font-medium text-primary-600">
                  {g.username}:
                </span>{" "}
                <span className="text-gray-700">{g.guess}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Guess input */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          placeholder="Type your guess..."
          className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
          maxLength={50}
        />
        <button
          type="submit"
          disabled={!guess.trim()}
          className="btn-primary px-3 py-2 text-sm whitespace-nowrap flex-shrink-0"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default GuessArea;
