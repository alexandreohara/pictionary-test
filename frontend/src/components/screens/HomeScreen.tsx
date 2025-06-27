import React, { useState } from "react";
import { useGame } from "../../contexts/GameContext";

const HomeScreen: React.FC = () => {
  const { socket, setUsername, username } = useGame();
  const [roomCode, setRoomCode] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleJoinRoom = () => {
    if (!username.trim()) {
      alert("Please enter your name");
      return;
    }

    if (!roomCode.trim()) {
      alert("Please enter the room code");
      return;
    }

    const trimmedUsername = username.trim();
    setUsername(trimmedUsername);
    socket?.emit("join_room", {
      roomCode: roomCode.toUpperCase(),
      username: trimmedUsername,
    });
  };

  const handleCreateRoom = () => {
    if (!username.trim()) {
      alert("Please enter your name");
      return;
    }

    setIsCreating(true);
    const trimmedUsername = username.trim();
    setUsername(trimmedUsername);

    // Generate a random room code
    const newRoomCode = Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase();
    socket?.emit("join_room", {
      roomCode: newRoomCode,
      username: trimmedUsername,
    });
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="card max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🎨 Pictionary
          </h1>
          <p className="text-gray-600">Play draw and guess in real time!</p>
        </div>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Your Name
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input-field"
              placeholder="Enter your name"
              maxLength={20}
            />
          </div>

          <div>
            <label
              htmlFor="roomCode"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Room Code
            </label>
            <input
              id="roomCode"
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              className="input-field"
              placeholder="Enter code (e.g. ABC123)"
              maxLength={6}
            />
          </div>

          <div className="space-y-3">
            <button
              onClick={handleJoinRoom}
              disabled={!username.trim() || !roomCode.trim()}
              className="btn-primary w-full"
            >
              Join Room
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or</span>
              </div>
            </div>

            <button
              onClick={handleCreateRoom}
              disabled={!username.trim() || isCreating}
              className="btn-secondary w-full"
            >
              {isCreating ? "Creating..." : "Create New Room"}
            </button>
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>🎯 2-4 players • ⏱️ 60s per round • 🏆 5 rounds</p>
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;
