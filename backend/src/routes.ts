import { Router } from "express";
import { GameController } from "./controllers/GameController";

export const createRoutes = (gameController: GameController) => {
  const router = Router();

  // Health check endpoint
  router.get("/health", (req, res) => {
    res.json({ status: "OK", ...gameController.getRoomStats() });
  });

  // Words endpoint (optional)
  router.get("/words", (req, res) => {
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

  return router;
};
