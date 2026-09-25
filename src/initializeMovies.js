import { movieEmbeddings } from "./Data/embeddings.js";
import { movies } from "./Data/movies.js";
import { createEmbedding } from "./utils/embedding.js";

export async function initializeMovies() {
  console.log("Creating movie embeddings...");

  for (const movie of movies) {
    const embedding = await createEmbedding(movie.description);

    movieEmbeddings.push({
      ...movie,
      embedding,
    });
  }

  console.log(`Created embeddings for ${movieEmbeddings.length} movies`);
}
