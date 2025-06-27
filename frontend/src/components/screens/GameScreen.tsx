import React from "react";
import { useGame } from "../../contexts/GameContext";
import Canvas from "../Canvas";
import GuessArea from "../GuessArea";

const GameScreen: React.FC = () => {
  const { currentUser, currentWord, timeLeft, users } = useGame();

  const isDrawer = currentUser?.isDrawer || false;
  const drawer = users.find((u) => u.isDrawer);

  console.log("GameScreen state:", {
    currentUser,
    isDrawer,
    drawer,
    currentWord,
    users,
  });

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="card mb-4">
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
          <div className="text-center sm:text-left">
            <h2 className="text-xl font-bold text-gray-800">
              {isDrawer
                ? `Your word: ${currentWord || "Loading..."}`
                : `${drawer?.username || "Someone"} is drawing...`}
            </h2>
            <p className="text-gray-600">
              {isDrawer ? "Draw for others to guess!" : "Type your guess below"}
            </p>
          </div>

          <div className="text-center">
            <div
              className={`text-3xl font-bold ${
                timeLeft <= 10 ? "text-red-500" : "text-gray-800"
              }`}
            >
              ⏰ {formatTime(timeLeft)}
            </div>
            <p className="text-sm text-gray-500">Time remaining</p>
          </div>
        </div>
      </div>

      {/* Game Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Canvas */}
        <div className="lg:col-span-3">
          <Canvas />
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Players */}
          <div className="card">
            <h3 className="font-bold text-gray-800 mb-3">Players</h3>
            <div className="space-y-2">
              {users.map((user) => (
                <div
                  key={user.id}
                  className={`flex items-center justify-between p-2 rounded ${
                    user.isDrawer ? "bg-yellow-100" : "bg-gray-50"
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">
                      {user.isDrawer ? "🎨" : "🤔"}
                    </span>
                    <span className="font-medium text-sm">{user.username}</span>
                    {user.id === currentUser?.id && (
                      <span className="text-xs bg-primary-500 text-white px-1 py-0.5 rounded">
                        You
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-bold text-gray-600">
                    {user.score}pts
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Guess Area */}
          {!isDrawer && <GuessArea />}

          {/* Drawing Tools */}
          {isDrawer && (
            <div className="card">
              <h3 className="font-bold text-gray-800 mb-3">Tools</h3>
              <div className="text-sm text-gray-600">
                <p>• Use mouse or touch to draw</p>
                <p>• Tap the Clear Button to erase all</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameScreen;
