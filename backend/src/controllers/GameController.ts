import { GameRoom } from "../models/GameRoom";
import { User } from "../types";

export class GameController {
  private rooms: Map<string, GameRoom> = new Map();
  private userRoomMap: Map<string, string> = new Map(); // socketId -> roomCode

  generateRoomCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  createRoom(): GameRoom {
    let roomCode: string;
    do {
      roomCode = this.generateRoomCode();
    } while (this.rooms.has(roomCode));

    const room = new GameRoom(roomCode);
    this.rooms.set(roomCode, room);
    return room;
  }

  getRoom(roomCode: string): GameRoom | undefined {
    return this.rooms.get(roomCode);
  }

  joinRoom(
    roomCode: string,
    username: string,
    socketId: string
  ): { success: boolean; room?: GameRoom; user?: User; error?: string } {
    let room = this.getRoom(roomCode);

    if (!room) {
      // Create room if it doesn't exist
      room = new GameRoom(roomCode);
      this.rooms.set(roomCode, room);
    }

    // Check if username is already in use
    if (room.users.some((u) => u.username === username)) {
      return {
        success: false,
        error: "Username is already in use in this room",
      };
    }

    // Check if room is full (maximum 4 players)
    if (room.users.length >= 4) {
      return { success: false, error: "Room is full" };
    }

    const user = room.addUser(username, socketId);
    this.userRoomMap.set(socketId, roomCode);

    return { success: true, room, user };
  }

  leaveRoom(socketId: string): { room?: GameRoom; user?: User } {
    const roomCode = this.userRoomMap.get(socketId);
    if (!roomCode) return {};

    const room = this.getRoom(roomCode);
    if (!room) return {};

    const user = room.getUserBySocketId(socketId);
    if (user) {
      room.removeUser(user.id);
      this.userRoomMap.delete(socketId);

      // Remove room if empty
      if (room.users.length === 0) {
        this.rooms.delete(roomCode);
      }

      return { room, user };
    }

    return {};
  }

  getUserRoom(socketId: string): GameRoom | undefined {
    const roomCode = this.userRoomMap.get(socketId);
    return roomCode ? this.getRoom(roomCode) : undefined;
  }

  startGame(socketId: string): {
    success: boolean;
    room?: GameRoom;
    error?: string;
  } {
    const room = this.getUserRoom(socketId);
    if (!room) {
      return { success: false, error: "Room not found" };
    }

    if (!room.canStartGame()) {
      return {
        success: false,
        error: "Cannot start game. At least 2 players required.",
      };
    }

    room.startGame();
    return { success: true, room };
  }

  handleGuess(
    socketId: string,
    guess: string
  ): {
    success: boolean;
    correct?: boolean;
    room?: GameRoom;
    user?: User;
    error?: string;
  } {
    const room = this.getUserRoom(socketId);
    if (!room) {
      return { success: false, error: "Room not found" };
    }

    const user = room.getUserBySocketId(socketId);
    if (!user) {
      return { success: false, error: "User not found" };
    }

    if (user.isDrawer) {
      return { success: false, error: "The drawer cannot guess" };
    }

    const correct = room.checkGuess(guess);
    if (correct) {
      // Scoring based on remaining time
      const timeLeft = room.getRemainingTime();
      const basePoints = 100;
      const timeBonus = Math.floor(timeLeft * 2); // 2 points per remaining second
      const totalPoints = basePoints + timeBonus;

      room.addScore(user.id, totalPoints);

      // Points for the drawer too
      const drawer = room.users.find((u) => u.isDrawer);
      if (drawer) {
        room.addScore(drawer.id, 50);
      }
    }

    return { success: true, correct, room, user };
  }

  nextRound(socketId: string): {
    success: boolean;
    room?: GameRoom;
    gameOver?: boolean;
    error?: string;
  } {
    const room = this.getUserRoom(socketId);
    if (!room) {
      return { success: false, error: "Room not found" };
    }

    const hasNextRound = room.nextRound();
    const gameOver = room.isGameOver();

    return { success: true, room, gameOver };
  }

  getRoomStats(): { totalRooms: number; totalUsers: number } {
    const totalRooms = this.rooms.size;
    const totalUsers = Array.from(this.rooms.values()).reduce(
      (sum, room) => sum + room.users.length,
      0
    );

    return { totalRooms, totalUsers };
  }
}
