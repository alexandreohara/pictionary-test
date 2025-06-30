import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from "react";
import { GameContextType, User, GuessEvent } from "../types";
import { SocketService, SocketCallbacks } from "../services/socket-service";
import {
  gameStateReducer,
  initialGameState,
} from "../reducers/game-state-reducer";

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
  const [state, dispatch] = useReducer(gameStateReducer, initialGameState);
  const socketService = new SocketService();

  useEffect(() => {
    socketService.connect(
      import.meta.env.VITE_BACKEND_URL || "http://localhost:3001"
    );

    // Setup socket event callbacks
    const callbacks: SocketCallbacks = {
      onRoomJoined: ({ users, roomCode }) => {
        console.log("room_joined event:", {
          users,
          roomCode,
          currentUsername: state.username,
        });
        dispatch({ type: "ROOM_JOINED", payload: { users, roomCode } });
      },

      onUserJoined: (user: User) => {
        dispatch({ type: "ADD_USER", payload: user });
      },

      onUserLeft: (userId: string) => {
        dispatch({ type: "REMOVE_USER", payload: userId });
      },

      onGameStarted: ({ drawer, timeLeft }) => {
        dispatch({ type: "GAME_STARTED", payload: { timeLeft } });
        console.log(`Game started! ${drawer} is drawing.`);
      },

      onStartDrawing: ({ word, drawer, timeLeft }) => {
        dispatch({ type: "START_DRAWING", payload: { word, timeLeft } });
        console.log(`Drawing started! Word: ${word}, Drawer: ${drawer}`);
      },

      onDrawingData: (_points) => {},

      onClearCanvas: () => {
        console.log("Canvas cleared by drawer");
      },

      onGuessFeedback: ({ guess, username }) => {
        const newGuess: GuessEvent = {
          username,
          guess,
          timestamp: Date.now(),
        };
        dispatch({ type: "ADD_GUESS", payload: newGuess });
      },

      onRoundOver: ({ correctWord, scores }) => {
        dispatch({ type: "ROUND_OVER", payload: { correctWord, scores } });
      },

      onGameOver: ({ finalScores }) => {
        dispatch({ type: "GAME_OVER", payload: { finalScores } });
      },

      onTimerUpdate: (time: number) => {
        dispatch({ type: "SET_TIME_LEFT", payload: time });
      },

      onUsersUpdated: (updatedUsers: User[]) => {
        dispatch({ type: "SET_USERS", payload: updatedUsers });
        console.log("Users updated:", updatedUsers);
      },

      onError: (message: string) => {
        alert(`Error: ${message}`);
      },
    };

    socketService.setupEventListeners(callbacks);

    return () => {
      socketService.disconnect();
    };
  }, []);

  // Update current user when users or username changes
  useEffect(() => {
    console.log("useEffect currentUser update:", {
      username: state.username,
      usersCount: state.users.length,
      usersList: state.users,
    });
    if (state.username && state.users.length > 0) {
      const user = state.users.find((u: User) => u.username === state.username);
      console.log("Found user:", user);
      if (user) {
        dispatch({ type: "SET_CURRENT_USER", payload: user });
        console.log("Set currentUser:", user);
      }
    }
  }, [state.users, state.username]);

  const value: GameContextType = {
    socket: socketService.getSocket(),
    gameState: state.gameState,
    setGameState: (gameState) =>
      dispatch({ type: "SET_GAME_STATE", payload: gameState }),
    roomCode: state.roomCode,
    setRoomCode: (roomCode) =>
      dispatch({ type: "SET_ROOM_CODE", payload: roomCode }),
    username: state.username,
    setUsername: (username) =>
      dispatch({ type: "SET_USERNAME", payload: username }),
    users: state.users,
    setUsers: (users) => dispatch({ type: "SET_USERS", payload: users }),
    currentUser: state.currentUser,
    setCurrentUser: (user) =>
      dispatch({ type: "SET_CURRENT_USER", payload: user }),
    currentWord: state.currentWord,
    setCurrentWord: (word) =>
      dispatch({ type: "SET_CURRENT_WORD", payload: word }),
    timeLeft: state.timeLeft,
    setTimeLeft: (time) => dispatch({ type: "SET_TIME_LEFT", payload: time }),
    guesses: state.guesses,
    setGuesses: (guesses) =>
      dispatch({ type: "SET_GUESSES", payload: guesses }),
    scores: state.scores,
    setScores: (scores) => dispatch({ type: "SET_SCORES", payload: scores }),
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};
