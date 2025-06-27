import { GameRoom as IGameRoom, User, DrawingPoint } from "../types";
import { v4 as uuidv4 } from "uuid";

export class GameRoom implements IGameRoom {
  roomCode: string;
  users: User[] = [];
  currentWord: string = "";
  drawerId: string = "";
  round: number = 0;
  totalRounds: number = 5;
  gameStarted: boolean = false;
  roundStartTime?: number;
  roundDuration: number = 60; // 60 seconds per round
  private drawingData: DrawingPoint[] = [];
  private roundTimer?: NodeJS.Timeout;

  constructor(roomCode: string) {
    this.roomCode = roomCode;
  }

  addUser(username: string, socketId: string): User {
    const user: User = {
      id: uuidv4(),
      username,
      isDrawer: false,
      score: 0,
      socketId,
    };

    this.users.push(user);
    return user;
  }

  removeUser(userId: string): boolean {
    const userIndex = this.users.findIndex((u) => u.id === userId);
    if (userIndex !== -1) {
      this.users.splice(userIndex, 1);
      return true;
    }
    return false;
  }

  getUserBySocketId(socketId: string): User | undefined {
    return this.users.find((u) => u.socketId === socketId);
  }

  canStartGame(): boolean {
    return this.users.length >= 2 && !this.gameStarted;
  }

  startGame(): void {
    this.gameStarted = true;
    this.round = 1;
    this.assignDrawer();
    this.selectRandomWord();
    this.startRoundTimer();
  }

  private assignDrawer(): void {
    // Alternate who draws each round
    if (this.round === 1) {
      this.drawerId = this.users[0].id;
    } else {
      const currentDrawerIndex = this.users.findIndex(
        (u) => u.id === this.drawerId
      );
      const nextDrawerIndex = (currentDrawerIndex + 1) % this.users.length;
      this.drawerId = this.users[nextDrawerIndex].id;
    }

    // Update user status
    this.users.forEach((user) => {
      user.isDrawer = user.id === this.drawerId;
    });
  }

  private selectRandomWord(): void {
    const words = [
      "cat",
      "house",
      "car",
      "tree",
      "book",
      "phone",
      "computer",
      "bicycle",
      "dog",
      "flower",
      "sun",
      "moon",
      "star",
      "bird",
      "fish",
      "apple",
      "banana",
      "pizza",
      "hamburger",
      "icecream",
    ];
    this.currentWord = words[Math.floor(Math.random() * words.length)];
  }

  addDrawingData(points: DrawingPoint[]): void {
    this.drawingData.push(...points);
  }

  getDrawingData(): DrawingPoint[] {
    return [...this.drawingData];
  }

  clearDrawing(): void {
    this.drawingData = [];
  }

  checkGuess(guess: string): boolean {
    return guess.toLowerCase().trim() === this.currentWord.toLowerCase();
  }

  addScore(userId: string, points: number): void {
    const user = this.users.find((u) => u.id === userId);
    if (user) {
      user.score += points;
    }
  }

  nextRound(): boolean {
    if (this.round < this.totalRounds) {
      this.round++;
      this.assignDrawer();
      this.selectRandomWord();
      this.clearDrawing();
      this.startRoundTimer();
      return true;
    }
    return false;
  }

  private startRoundTimer(): void {
    this.roundStartTime = Date.now();
    if (this.roundTimer) {
      clearTimeout(this.roundTimer);
    }
  }

  getRemainingTime(): number {
    if (!this.roundStartTime) return this.roundDuration;
    const elapsed = Math.floor((Date.now() - this.roundStartTime) / 1000);
    return Math.max(0, this.roundDuration - elapsed);
  }

  isGameOver(): boolean {
    return this.round >= this.totalRounds;
  }

  getWinner(): User | null {
    if (this.users.length === 0) return null;
    return this.users.reduce((winner, user) =>
      user.score > winner.score ? user : winner
    );
  }

  getScores(): { [userId: string]: number } {
    const scores: { [userId: string]: number } = {};
    this.users.forEach((user) => {
      scores[user.id] = user.score;
    });
    return scores;
  }
}
