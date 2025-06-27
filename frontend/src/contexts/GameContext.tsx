import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { io, Socket } from "socket.io-client";
import { GameContextType, GameState, User, GuessEvent } from "../types";

const GameContext = createContext<GameContextType | undefined>(undefined);

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
};

interface GameProviderProps {
  children: ReactNode;
}

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [gameState, setGameState] = useState<GameState>(GameState.HOME);
  const [roomCode, setRoomCode] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentWord, setCurrentWord] = useState<string>("");
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [guesses, setGuesses] = useState<GuessEvent[]>([]);
  const [scores, setScores] = useState<{ [userId: string]: number }>({});

  useEffect(() => {
    const socketInstance = io(
      import.meta.env.VITE_BACKEND_URL || "http://localhost:3001"
    );
    setSocket(socketInstance);

    // Event listeners
    socketInstance.on("room_joined", ({ users, roomCode }) => {
      console.log("room_joined event:", {
        users,
        roomCode,
        currentUsername: username,
      });
      setUsers(users);
      setRoomCode(roomCode);
      setGameState(GameState.WAITING);
    });

    socketInstance.on("user_joined", (user: User) => {
      setUsers((prev) => [...prev, user]);
    });

    socketInstance.on("user_left", (userId: string) => {
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    });

    socketInstance.on("game_started", ({ drawer, timeLeft }) => {
      setTimeLeft(timeLeft);
      setGameState(GameState.PLAYING);
      setGuesses([]);
      console.log(`Game started! ${drawer} is drawing.`);
    });

    socketInstance.on("start_drawing", ({ word, drawer, timeLeft }) => {
      setCurrentWord(word);
      setTimeLeft(timeLeft);
      setGameState(GameState.PLAYING);
      setGuesses([]);
      console.log(`Drawing started! Word: ${word}, Drawer: ${drawer}`);
    });

    socketInstance.on("drawing_data", (_points) => {});

    socketInstance.on("clear_canvas", () => {
      // Canvas clearing is handled by the Canvas component directly
      console.log("Canvas cleared by drawer");
    });

    socketInstance.on("guess_feedback", ({ correct, guess, username }) => {
      const newGuess: GuessEvent = {
        username,
        guess,
        timestamp: Date.now(),
      };
      setGuesses((prev) => [...prev, newGuess]);
    });

    socketInstance.on("round_over", ({ correctWord, scores }) => {
      setCurrentWord(correctWord);
      setScores(scores);
      setGameState(GameState.ROUND_OVER);
    });

    socketInstance.on("game_over", ({ finalScores }) => {
      setScores(finalScores);
      setGameState(GameState.GAME_OVER);
    });

    socketInstance.on("timer_update", (time: number) => {
      setTimeLeft(time);
    });

    socketInstance.on("error", (message: string) => {
      alert(`Error: ${message}`);
    });

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  // Update current user when users or username changes
  useEffect(() => {
    console.log("useEffect currentUser update:", {
      username,
      usersCount: users.length,
      usersList: users,
    });
    if (username && users.length > 0) {
      const user = users.find((u: User) => u.username === username);
      console.log("Found user:", user);
      if (user) {
        setCurrentUser(user);
        console.log("Set currentUser:", user);
      }
    }
  }, [users, username]);

  // Update users when game starts to reflect drawer status
  useEffect(() => {
    if (socket) {
      socket.on("users_updated", (updatedUsers: User[]) => {
        setUsers(updatedUsers);
        console.log("Users updated:", updatedUsers);
      });
    }
  }, [socket]);

  const value: GameContextType = {
    socket,
    gameState,
    setGameState,
    roomCode,
    setRoomCode,
    username,
    setUsername,
    users,
    setUsers,
    currentUser,
    setCurrentUser,
    currentWord,
    setCurrentWord,
    timeLeft,
    setTimeLeft,
    guesses,
    setGuesses,
    scores,
    setScores,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};
