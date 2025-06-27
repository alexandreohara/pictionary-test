import React from "react";
import { useGame } from "../../contexts/GameContext";

const RoundOverScreen: React.FC = () => {
  const { socket, roomCode, currentWord, scores, users } = useGame();

  const handleNextRound = () => {
    socket?.emit("next_round", { roomCode });
  };

  // Sort users by score
  const sortedUsers = [...users].sort(
    (a, b) => (scores[b.id] || 0) - (scores[a.id] || 0)
  );

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card text-center">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            🎯 Round Over!
          </h1>
          <p className="text-xl text-gray-600">
            The word was:{" "}
            <span className="font-bold text-primary-600">{currentWord}</span>
          </p>
        </div>

        {/* Score */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Current Score</h2>
          <div className="space-y-3">
            {sortedUsers.map((user, index) => (
              <div
                key={user.id}
                className={`flex items-center justify-between p-4 rounded-lg ${
                  index === 0
                    ? "bg-yellow-100 border-2 border-yellow-300"
                    : "bg-gray-50"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">
                    {index === 0
                      ? "🥇"
                      : index === 1
                      ? "🥈"
                      : index === 2
                      ? "🥉"
                      : "🎯"}
                  </span>
                  <span className="font-medium text-lg">{user.username}</span>
                  {index === 0 && (
                    <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded">
                      Leader
                    </span>
                  )}
                </div>
                <span className="text-xl font-bold text-gray-700">
                  {scores[user.id] || 0} pts
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Action */}
        <div className="space-y-4">
          <button
            onClick={handleNextRound}
            className="btn-primary text-lg px-8 py-3"
          >
            Next Round →
          </button>

          <p className="text-sm text-gray-500">Waiting for all players...</p>
        </div>
      </div>
    </div>
  );
};

export default RoundOverScreen;
