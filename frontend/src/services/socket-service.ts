import { io, Socket } from "socket.io-client";
import { User } from "../types";

export interface SocketCallbacks {
  onRoomJoined: (data: { users: User[]; roomCode: string }) => void;
  onUserJoined: (user: User) => void;
  onUserLeft: (userId: string) => void;
  onGameStarted: (data: { drawer: string; timeLeft: number }) => void;
  onStartDrawing: (data: {
    word: string;
    drawer: string;
    timeLeft: number;
  }) => void;
  onDrawingData: (points: any) => void;
  onClearCanvas: () => void;
  onGuessFeedback: (data: {
    correct: boolean;
    guess: string;
    username: string;
  }) => void;
  onRoundOver: (data: {
    correctWord: string;
    scores: { [userId: string]: number };
  }) => void;
  onGameOver: (data: { finalScores: { [userId: string]: number } }) => void;
  onTimerUpdate: (time: number) => void;
  onUsersUpdated: (users: User[]) => void;
  onError: (message: string) => void;
}

export class SocketService {
  private socket: Socket | null = null;

  connect(backendUrl?: string): Socket {
    const socketInstance = io(backendUrl || "http://localhost:3001");
    this.socket = socketInstance;
    return socketInstance;
  }

  setupEventListeners(callbacks: SocketCallbacks): void {
    if (!this.socket) return;

    this.socket.on("room_joined", callbacks.onRoomJoined);
    this.socket.on("user_joined", callbacks.onUserJoined);
    this.socket.on("user_left", callbacks.onUserLeft);
    this.socket.on("game_started", callbacks.onGameStarted);
    this.socket.on("start_drawing", callbacks.onStartDrawing);
    this.socket.on("drawing_data", callbacks.onDrawingData);
    this.socket.on("clear_canvas", callbacks.onClearCanvas);
    this.socket.on("guess_feedback", callbacks.onGuessFeedback);
    this.socket.on("round_over", callbacks.onRoundOver);
    this.socket.on("game_over", callbacks.onGameOver);
    this.socket.on("timer_update", callbacks.onTimerUpdate);
    this.socket.on("users_updated", callbacks.onUsersUpdated);
    this.socket.on("error", callbacks.onError);
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }
}
