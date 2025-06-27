export interface User {
  id: string;
  username: string;
  isDrawer: boolean;
  score: number;
  socketId: string;
}

export interface GameRoom {
  roomCode: string;
  users: User[];
  currentWord: string;
  drawerId: string;
  round: number;
  totalRounds: number;
  gameStarted: boolean;
  roundStartTime?: number;
  roundDuration: number; // em segundos
}

export interface DrawingPoint {
  x: number;
  y: number;
  type: "start" | "move" | "end";
  tool?: "pen" | "eraser";
  color?: string;
  size?: number;
}

export interface GuessEvent {
  username: string;
  guess: string;
  timestamp: number;
}

// Socket Events
export interface ServerToClientEvents {
  room_joined: (data: { users: User[]; roomCode: string }) => void;
  user_joined: (user: User) => void;
  user_left: (userId: string) => void;
  users_updated: (users: User[]) => void;
  game_started: (data: {
    drawer: string;
    round: number;
    totalRounds: number;
    timeLeft: number;
  }) => void;
  start_drawing: (data: {
    word: string;
    drawer: string;
    timeLeft: number;
  }) => void;
  drawing_data: (points: DrawingPoint[]) => void;
  clear_canvas: () => void;
  guess_feedback: (data: {
    correct: boolean;
    guess: string;
    username: string;
  }) => void;
  round_over: (data: {
    correctWord: string;
    winner?: string;
    scores: { [userId: string]: number };
  }) => void;
  game_over: (data: {
    finalScores: { [userId: string]: number };
    winner: string;
  }) => void;
  error: (message: string) => void;
  timer_update: (timeLeft: number) => void;
}

export interface ClientToServerEvents {
  join_room: (data: { roomCode: string; username: string }) => void;
  start_game: (data: { roomCode: string }) => void;
  drawing_data: (data: { roomCode: string; points: DrawingPoint[] }) => void;
  clear_canvas: (data: { roomCode: string }) => void;
  guess_word: (data: {
    roomCode: string;
    guess: string;
    username: string;
  }) => void;
  next_round: (data: { roomCode: string }) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  userId: string;
  username: string;
  roomCode?: string;
}
