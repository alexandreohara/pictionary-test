import { GameState, User, GuessEvent } from "../types";

export interface GameStateData {
  gameState: GameState;
  roomCode: string;
  username: string;
  users: User[];
  currentUser: User | null;
  currentWord: string;
  timeLeft: number;
  guesses: GuessEvent[];
  scores: { [userId: string]: number };
}

export const initialGameState: GameStateData = {
  gameState: GameState.HOME,
  roomCode: "",
  username: "",
  users: [],
  currentUser: null,
  currentWord: "",
  timeLeft: 60,
  guesses: [],
  scores: {},
};

export type GameAction =
  | { type: "SET_GAME_STATE"; payload: GameState }
  | { type: "SET_ROOM_CODE"; payload: string }
  | { type: "SET_USERNAME"; payload: string }
  | { type: "SET_USERS"; payload: User[] }
  | { type: "ADD_USER"; payload: User }
  | { type: "REMOVE_USER"; payload: string }
  | { type: "SET_CURRENT_USER"; payload: User | null }
  | { type: "SET_CURRENT_WORD"; payload: string }
  | { type: "SET_TIME_LEFT"; payload: number }
  | { type: "SET_GUESSES"; payload: GuessEvent[] }
  | { type: "ADD_GUESS"; payload: GuessEvent }
  | { type: "SET_SCORES"; payload: { [userId: string]: number } }
  | { type: "ROOM_JOINED"; payload: { users: User[]; roomCode: string } }
  | { type: "GAME_STARTED"; payload: { timeLeft: number } }
  | { type: "START_DRAWING"; payload: { word: string; timeLeft: number } }
  | {
      type: "ROUND_OVER";
      payload: { correctWord: string; scores: { [userId: string]: number } };
    }
  | {
      type: "GAME_OVER";
      payload: { finalScores: { [userId: string]: number } };
    };

export const gameStateReducer = (
  state: GameStateData,
  action: GameAction
): GameStateData => {
  switch (action.type) {
    case "SET_GAME_STATE":
      return { ...state, gameState: action.payload };

    case "SET_ROOM_CODE":
      return { ...state, roomCode: action.payload };

    case "SET_USERNAME":
      return { ...state, username: action.payload };

    case "SET_USERS":
      return { ...state, users: action.payload };

    case "ADD_USER":
      return { ...state, users: [...state.users, action.payload] };

    case "REMOVE_USER":
      return {
        ...state,
        users: state.users.filter((u) => u.id !== action.payload),
      };

    case "SET_CURRENT_USER":
      return { ...state, currentUser: action.payload };

    case "SET_CURRENT_WORD":
      return { ...state, currentWord: action.payload };

    case "SET_TIME_LEFT":
      return { ...state, timeLeft: action.payload };

    case "SET_GUESSES":
      return { ...state, guesses: action.payload };

    case "ADD_GUESS":
      return { ...state, guesses: [...state.guesses, action.payload] };

    case "SET_SCORES":
      return { ...state, scores: action.payload };

    case "ROOM_JOINED":
      return {
        ...state,
        users: action.payload.users,
        roomCode: action.payload.roomCode,
        gameState: GameState.WAITING,
      };

    case "GAME_STARTED":
      return {
        ...state,
        timeLeft: action.payload.timeLeft,
        gameState: GameState.PLAYING,
        guesses: [],
      };

    case "START_DRAWING":
      return {
        ...state,
        currentWord: action.payload.word,
        timeLeft: action.payload.timeLeft,
        gameState: GameState.PLAYING,
        guesses: [],
      };

    case "ROUND_OVER":
      return {
        ...state,
        currentWord: action.payload.correctWord,
        scores: action.payload.scores,
        gameState: GameState.ROUND_OVER,
      };

    case "GAME_OVER":
      return {
        ...state,
        scores: action.payload.finalScores,
        gameState: GameState.GAME_OVER,
      };

    default:
      return state;
  }
};
