import { movieEmbeddings } from "../Data/embeddings.js";
import { cosineSimilarity } from "../utils/cosineSimilarity.js";
import { createEmbedding } from "../utils/embedding.js";

export async function searchMovies(req, res) {
  const query = req.query.q;

  if (!query) {
    return res.json([]);
  }

  const queryEmbedding = await createEmbedding(query);

  const results = [];

  for (const movie of movieEmbeddings) {
    const similarity = cosineSimilarity(queryEmbedding, movie.embedding);

    results.push({
      movie: movie,
      similarity: similarity,
    });
  }

  results.sort((a, b) => {
    return b.similarity - a.similarity;
  });

  const topMovies = results.slice(0, 10);

  return res.json(topMovies);
}

export function recommendMovies(req, res) {
  const movieId = Number(req.body.movieId);

  const clickedMovie = movieEmbeddings.find((movie) => movie.id === movieId);

  if (!clickedMovie) {
    return res.status(404).json({
      message: "Movie not found",
    });
  }

  const results = [];

  for (const movie of movieEmbeddings) {
    if (movie.id === clickedMovie.id) {
      continue;
    }

    const similarity = cosineSimilarity(
      clickedMovie.embedding,
      movie.embedding,
    );

    results.push({
      movie: movie,
      similarity: similarity,
    });
  }

  results.sort((a, b) => {
    return b.similarity - a.similarity;
  });

  const topMovies = results.slice(0, 5);

  return res.json(topMovies);
}
