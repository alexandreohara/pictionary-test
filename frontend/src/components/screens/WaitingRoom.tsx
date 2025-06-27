import React from "react";
import { useGame } from "../../contexts/GameContext";

const WaitingRoom: React.FC = () => {
  const { socket, roomCode, users, currentUser } = useGame();

  const handleStartGame = () => {
    socket?.emit("start_game", { roomCode });
  };

  const isHost = users.length > 0 && users[0].id === currentUser?.id;
  const canStart = users.length >= 2;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Waiting Room</h1>
        <p className="text-gray-600 mb-4">
          Room code:{" "}
          <span className="font-mono font-bold text-lg">{roomCode}</span>
        </p>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">
            Players ({users.length}/4)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {users.map((user, index) => (
              <div
                key={user.id}
                className={`p-3 rounded-lg border-2 ${
                  user.id === currentUser?.id
                    ? "border-primary-500 bg-primary-50"
                    : "border-gray-200 bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-2xl">{index === 0 ? "👑" : "👤"}</span>
                  <span className="font-medium">{user.username}</span>
                  {user.id === currentUser?.id && (
                    <span className="text-xs bg-primary-500 text-white px-2 py-1 rounded">
                      You
                    </span>
                  )}
                </div>
              </div>
            ))}

            {/* Empty slots */}
            {Array.from({ length: 4 - users.length }).map((_, index) => (
              <div
                key={`empty-${index}`}
                className="p-3 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50"
              >
                <div className="flex items-center justify-center space-x-2 text-gray-400">
                  <span className="text-2xl">👤</span>
                  <span>Waiting...</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {isHost && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm mb-2">
                🏅 You are the room host!
              </p>
              <button
                onClick={handleStartGame}
                disabled={!canStart}
                className="btn-primary"
              >
                {canStart
                  ? "Start Game"
                  : `Waiting for players (${users.length}/2)`}
              </button>
            </div>
          )}

          {!isHost && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 text-sm">
                Waiting for the host to start the game...
              </p>
            </div>
          )}

          <div className="text-sm text-gray-500">
            <p>💡 Share the room code with your friends!</p>
            <p>Minimum: 2 players • Maximum: 4 players</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaitingRoom;
