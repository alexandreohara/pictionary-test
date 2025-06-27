import React from "react";
import { useGame } from "../contexts/GameContext";
import { GameState } from "../types";
import HomeScreen from "./screens/HomeScreen";
import WaitingRoom from "./screens/WaitingRoom";
import GameScreen from "./screens/GameScreen";
import RoundOverScreen from "./screens/RoundOverScreen";
import GameOverScreen from "./screens/GameOverScreen";

const Game: React.FC = () => {
  const { gameState } = useGame();

  const renderScreen = () => {
    switch (gameState) {
      case GameState.HOME:
        return <HomeScreen />;
      case GameState.WAITING:
        return <WaitingRoom />;
      case GameState.PLAYING:
        return <GameScreen />;
      case GameState.ROUND_OVER:
        return <RoundOverScreen />;
      case GameState.GAME_OVER:
        return <GameOverScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return <div className="container mx-auto px-4 py-8">{renderScreen()}</div>;
};

export default Game;
