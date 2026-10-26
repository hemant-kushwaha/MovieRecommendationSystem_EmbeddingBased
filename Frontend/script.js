const API_BASE_URL = "http://localhost:8080/api/movie";

const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");

const movieGrid = document.getElementById("movieGrid");
const recommendationGrid = document.getElementById("recommendationGrid");

const loading = document.getElementById("loading");
const recommendationLoading = document.getElementById("recommendationLoading");

const emptyState = document.getElementById("emptyState");

const resultsTitle = document.getElementById("resultsTitle");
const resultCount = document.getElementById("resultCount");

const recommendationSection = document.getElementById("recommendationSection");

const recommendationTitle = document.getElementById("recommendationTitle");

/* --------------------------------
   Search Movies
-------------------------------- */

async function searchMovies(query) {
  if (!query.trim()) {
    movieGrid.innerHTML = "";
    emptyState.classList.remove("hidden");
    resultCount.textContent = "";
    resultsTitle.textContent = "Search results";
    return;
  }

  loading.classList.remove("hidden");
  emptyState.classList.add("hidden");
  movieGrid.innerHTML = "";

  try {
    const response = await fetch(
      `${API_BASE_URL}/search?q=${encodeURIComponent(query)}`,
    );

    if (!response.ok) {
      throw new Error("Failed to search movies");
    }

    const movies = await response.json();

    renderMovies(movies);

    resultsTitle.textContent = `Results for "${query}"`;
    resultCount.textContent = `${movies.length} movies`;
  } catch (error) {
    console.error(error);

    movieGrid.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">!</div>
        <h3>Something went wrong</h3>
        <p>Could not connect to the movie server.</p>
      </div>
    `;
  } finally {
    loading.classList.add("hidden");
  }
}

/* --------------------------------
   Render Movies
-------------------------------- */

function renderMovies(movies) {
  movieGrid.innerHTML = "";

  if (!movies.length) {
    emptyState.classList.remove("hidden");
    return;
  }

  emptyState.classList.add("hidden");

  movies.forEach((item, index) => {
    movieGrid.appendChild(createMovieCard(item, index + 1));
  });
}

/* --------------------------------
   Create Movie Card
-------------------------------- */

function createMovieCard(item, index) {
  const card = document.createElement("article");

  card.className = "movie-card";

  const similarity = Math.round(item.similarity * 100);

  card.innerHTML = `
    <div class="movie-number">
      #${String(index).padStart(2, "0")}
    </div>

    <h3>${escapeHTML(item.name)}</h3>

    <p class="movie-description">
      ${escapeHTML(item.description)}
    </p>

    <div class="similarity">

      <div class="similarity-top">
        <span class="similarity-label">
          Match
        </span>

        <span class="similarity-value">
          ${similarity}%
        </span>
      </div>

      <div class="similarity-bar">
        <div
          class="similarity-fill"
          style="width: ${Math.min(similarity, 100)}%"
        ></div>
      </div>

    </div>
  `;

  card.addEventListener("click", () => {
    getRecommendations(item);
  });

  return card;
}

/* --------------------------------
   Recommendations
-------------------------------- */

async function getRecommendations(movie) {
  recommendationSection.classList.remove("hidden");

  recommendationTitle.textContent = `Because you liked ${movie.name}`;

  recommendationLoading.classList.remove("hidden");

  recommendationGrid.innerHTML = "";

  try {
    const response = await fetch(`${API_BASE_URL}/recommend`, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        movieId: movie.id,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to get recommendations");
    }

    const recommendations = await response.json();

    recommendations.forEach((item, index) => {
      recommendationGrid.appendChild(createRecommendationCard(item, index + 1));
    });

    recommendationSection.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  } catch (error) {
    console.error(error);

    recommendationGrid.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">!</div>
        <h3>Couldn't load recommendations</h3>
        <p>Please check that your backend is running.</p>
      </div>
    `;
  } finally {
    recommendationLoading.classList.add("hidden");
  }
}

/* --------------------------------
   Recommendation Card
-------------------------------- */

function createRecommendationCard(item, index) {
  const card = document.createElement("article");

  card.className = "movie-card";

  const similarity = Math.round(item.similarity * 100);

  card.innerHTML = `
    <div class="movie-number">
      RECOMMENDATION ${String(index).padStart(2, "0")}
    </div>

    <h3>${escapeHTML(item.name)}</h3>

    <p class="movie-description">
      ${escapeHTML(item.description)}
    </p>

    <div class="similarity">

      <div class="similarity-top">
        <span class="similarity-label">
          Similarity
        </span>

        <span class="similarity-value">
          ${similarity}%
        </span>
      </div>

      <div class="similarity-bar">
        <div
          class="similarity-fill"
          style="width: ${Math.min(similarity, 100)}%"
        ></div>
      </div>

    </div>
  `;

  return card;
}

/* --------------------------------
   Search Button
-------------------------------- */

searchButton.addEventListener("click", () => {
  searchMovies(searchInput.value);
});

/* --------------------------------
   Enter Key
-------------------------------- */

searchInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    searchMovies(searchInput.value);
  }
});

/* --------------------------------
   Search Hints
-------------------------------- */

document.querySelectorAll(".hint").forEach((button) => {
  button.addEventListener("click", () => {
    searchInput.value = button.textContent;
    searchMovies(button.textContent);
  });
});

/* --------------------------------
   Escape HTML
   Prevents movie data from
   injecting HTML into the page.
-------------------------------- */

function escapeHTML(value) {
  const div = document.createElement("div");
  div.textContent = value ?? "";
  return div.innerHTML;
}
