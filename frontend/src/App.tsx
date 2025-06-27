import { GameProvider } from "./contexts/GameContext";
import Game from "./components/Game";

function App() {
  return (
    <GameProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Game />
      </div>
    </GameProvider>
  );
}

export default App;
