import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { GameController } from "./controllers/GameController";
import {
  ServerToClientEvents,
  ClientToServerEvents,
  InterServerEvents,
  SocketData,
} from "./types";
import { setupMiddleware } from "./middleware";
import { createRoutes } from "./routes";
import { setupSocketHandlers } from "./socket-handlers";

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

setupMiddleware(app);

app.use(createRoutes(gameController));

setupSocketHandlers(io, gameController);

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
