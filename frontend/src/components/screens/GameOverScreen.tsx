import React from "react";
import { useGame } from "../../contexts/GameContext";
import { GameState } from "../../types";

const GameOverScreen: React.FC = () => {
  const { scores, users, setGameState } = useGame();

  // Sort users by score
  const sortedUsers = [...users].sort(
    (a, b) => (scores[b.id] || 0) - (scores[a.id] || 0)
  );
  const winner = sortedUsers[0];

  const handlePlayAgain = () => {
    setGameState(GameState.HOME);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card text-center">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            🎉 Game Over!
          </h1>
          {winner && (
            <div className="bg-yellow-100 border-2 border-yellow-300 rounded-lg p-6 mb-6">
              <div className="text-6xl mb-2">🏆</div>
              <h2 className="text-2xl font-bold text-yellow-800 mb-2">
                Congratulations, {winner.username}!
              </h2>
              <p className="text-yellow-700">
                You won with {scores[winner.id] || 0} points!
              </p>
            </div>
          )}
        </div>

        {/* Final Score */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-6">Final Score</h2>
          <div className="space-y-4">
            {sortedUsers.map((user, index) => (
              <div
                key={user.id}
                className={`flex items-center justify-between p-4 rounded-lg border-2 ${
                  index === 0
                    ? "bg-yellow-100 border-yellow-300"
                    : index === 1
                    ? "bg-gray-100 border-gray-300"
                    : index === 2
                    ? "bg-orange-100 border-orange-300"
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className="text-3xl font-bold text-gray-600">
                    #{index + 1}
                  </div>
                  <div className="text-3xl">
                    {index === 0
                      ? "🥇"
                      : index === 1
                      ? "🥈"
                      : index === 2
                      ? "🥉"
                      : "🎯"}
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-lg">{user.username}</div>
                    <div className="text-sm text-gray-600">
                      {index === 0
                        ? "Champion!"
                        : index === 1
                        ? "Runner-up"
                        : index === 2
                        ? "Third place"
                        : "Good game!"}
                    </div>
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-700">
                  {scores[user.id] || 0} pts
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Game Statistics */}
        <div className="mb-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">Game Statistics</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Total players:</span>
              <span className="font-medium ml-2">{users.length}</span>
            </div>
            <div>
              <span className="text-gray-600">Rounds played:</span>
              <span className="font-medium ml-2">5</span>
            </div>
            <div>
              <span className="text-gray-600">Highest score:</span>
              <span className="font-medium ml-2">
                {Math.max(...Object.values(scores))} pts
              </span>
            </div>
            <div>
              <span className="text-gray-600">Total points:</span>
              <span className="font-medium ml-2">
                {Object.values(scores).reduce((a, b) => a + b, 0)} pts
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <button
            onClick={handlePlayAgain}
            className="btn-primary text-lg px-8 py-3"
          >
            🎮 Play Again
          </button>

          <div className="text-sm text-gray-500">
            <p>Thanks for playing! 🎨</p>
            <p>Share with your friends for more fun!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameOverScreen;
