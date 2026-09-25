import cors from "cors";
import "dotenv/config";
import express from "express";

import {
    recommendMovies,
    searchMovies,
} from "./controllers/movie.controller.js";

import { initializeMovies } from "./initializeMovies.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/movie/search", searchMovies);

app.post("/api/movie/recommend", recommendMovies);

async function startServer() {
  try {
    await initializeMovies();

    app.listen(8080, () => {
      console.log("Server running on port 8080");
    });
  } catch (error) {
    console.error("Failed to start server:", error);
  }
}

startServer();
