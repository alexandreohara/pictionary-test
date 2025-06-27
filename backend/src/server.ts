import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import { GameController } from "./controllers/GameController";
import {
  ServerToClientEvents,
  ClientToServerEvents,
  InterServerEvents,
  SocketData,
} from "./types";

const app = express();
const server = createServer(app);
const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

const gameController = new GameController();

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "OK", ...gameController.getRoomStats() });
});

// Words endpoint (optional)
app.get("/words", (req, res) => {
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
  res.json({ words });
});

// Socket.IO event handlers
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Join a room
  socket.on("join_room", ({ roomCode, username }) => {
    const result = gameController.joinRoom(roomCode, username, socket.id);

    if (result.success && result.room && result.user) {
      socket.join(roomCode);
      socket.data.userId = result.user.id;
      socket.data.username = username;
      socket.data.roomCode = roomCode;

      // Notify the user that joined
      socket.emit("room_joined", {
        users: result.room.users,
        roomCode: result.room.roomCode,
      });

      // Notify other users in the room
      socket.to(roomCode).emit("user_joined", result.user);

      console.log(`${username} joined room ${roomCode}`);
    } else {
      socket.emit("error", result.error || "Error joining room");
    }
  });

  // Start game
  socket.on("start_game", ({ roomCode }) => {
    const result = gameController.startGame(socket.id);

    if (result.success && result.room) {
      const drawer = result.room.users.find((u) => u.isDrawer);

      // Notify all users that the game has started
      io.to(roomCode).emit("game_started", {
        drawer: drawer?.username || "Unknown",
        round: result.room.round,
        totalRounds: result.room.totalRounds,
        timeLeft: result.room.roundDuration,
      });

      // Update all users with current game state
      io.to(roomCode).emit("users_updated", result.room.users);

      // Send word to the drawer
      if (drawer) {
        io.to(drawer.socketId).emit("start_drawing", {
          word: result.room.currentWord,
          drawer: drawer.username,
          timeLeft: result.room.roundDuration,
        });
      }

      // Start timer for everyone
      const startTimer = () => {
        const timeLeft = result.room!.getRemainingTime();
        io.to(roomCode).emit("timer_update", timeLeft);

        if (timeLeft > 0) {
          setTimeout(startTimer, 1000);
        } else {
          // Time up
          io.to(roomCode).emit("round_over", {
            correctWord: result.room!.currentWord,
            scores: result.room!.getScores(),
          });
        }
      };
      startTimer();

      console.log(`Game started in room ${roomCode}`);
    } else {
      socket.emit("error", result.error || "Error starting game");
    }
  });

  // Drawing data
  socket.on("drawing_data", ({ roomCode, points }) => {
    const room = gameController.getRoom(roomCode);
    if (room) {
      const user = room.getUserBySocketId(socket.id);
      if (user && user.isDrawer) {
        room.addDrawingData(points);
        socket.to(roomCode).emit("drawing_data", points);
      }
    }
  });

  // Clear canvas
  socket.on("clear_canvas", ({ roomCode }) => {
    const room = gameController.getRoom(roomCode);
    if (room) {
      const user = room.getUserBySocketId(socket.id);
      if (user && user.isDrawer) {
        room.clearDrawing();
        io.to(roomCode).emit("clear_canvas");
      }
    }
  });

  // Guess
  socket.on("guess_word", ({ roomCode, guess, username }) => {
    const result = gameController.handleGuess(socket.id, guess);

    if (result.success && result.room) {
      // Feedback to everyone
      io.to(roomCode).emit("guess_feedback", {
        correct: result.correct || false,
        guess,
        username,
      });

      if (result.correct) {
        // Round ended - someone got it right
        io.to(roomCode).emit("round_over", {
          correctWord: result.room.currentWord,
          winner: username,
          scores: result.room.getScores(),
        });
      }
    } else {
      socket.emit("error", result.error || "Error processing guess");
    }
  });

  // Next round
  socket.on("next_round", ({ roomCode }) => {
    const result = gameController.nextRound(socket.id);

    if (result.success && result.room) {
      if (result.gameOver) {
        const winner = result.room.getWinner();
        io.to(roomCode).emit("game_over", {
          finalScores: result.room.getScores(),
          winner: winner?.username || "Tie",
        });
      } else {
        // New round - update all users with new drawer status
        io.to(roomCode).emit("users_updated", result.room.users);

        const drawer = result.room.users.find((u) => u.isDrawer);
        if (drawer) {
          io.to(drawer.socketId).emit("start_drawing", {
            word: result.room.currentWord,
            drawer: drawer.username,
            timeLeft: result.room.roundDuration,
          });

          // Also notify all players about the new round
          io.to(roomCode).emit("game_started", {
            drawer: drawer.username,
            round: result.room.round,
            totalRounds: result.room.totalRounds,
            timeLeft: result.room.roundDuration,
          });
        }

        // Restart timer
        const startTimer = () => {
          const timeLeft = result.room!.getRemainingTime();
          io.to(roomCode).emit("timer_update", timeLeft);

          if (timeLeft > 0) {
            setTimeout(startTimer, 1000);
          } else {
            io.to(roomCode).emit("round_over", {
              correctWord: result.room!.currentWord,
              scores: result.room!.getScores(),
            });
          }
        };
        startTimer();
      }
    } else {
      socket.emit("error", result.error || "Error starting next round");
    }
  });

  // Disconnect
  socket.on("disconnect", () => {
    const result = gameController.leaveRoom(socket.id);

    if (result.room && result.user) {
      socket.to(socket.data.roomCode || "").emit("user_left", result.user.id);
      console.log(`${result.user.username} left the room`);
    }

    console.log(`User disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
