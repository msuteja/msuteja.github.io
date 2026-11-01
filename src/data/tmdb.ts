const tmdbApiKey = import.meta.env.VITE_TMDB_API_KEY?.trim();
const tmdbApiBase = "https://api.themoviedb.org/3";
const tmdbImageBase = "https://image.tmdb.org/t/p";

export type MovieSearchResult = {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  release_date: string;
};

type MovieCredits = {
  crew: Array<{
    id: number;
    job: string;
    name: string;
  }>;
};

export type MovieDetails = MovieSearchResult & {
  genres: Array<{
    id: number;
    name: string;
  }>;
  runtime: number | null;
  credits: MovieCredits;
};

type MovieSearchResponse = {
  results: MovieSearchResult[];
};

export const isTmdbConfigured = Boolean(tmdbApiKey);

async function tmdbRequest<T>(
  path: string,
  parameters: Record<string, string>,
  signal?: AbortSignal,
) {
  if (!tmdbApiKey) {
    throw new Error("TMDB is not configured.");
  }

  const url = new URL(`${tmdbApiBase}${path}`);
  url.searchParams.set("api_key", tmdbApiKey);
  url.searchParams.set("language", "en-US");

  Object.entries(parameters).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    signal,
  });

  if (!response.ok) {
    throw new Error(`TMDB request failed with status ${response.status}.`);
  }

  return response.json() as Promise<T>;
}

export async function searchMovies(query: string, signal?: AbortSignal) {
  const response = await tmdbRequest<MovieSearchResponse>(
    "/search/movie",
    {
      query,
      include_adult: "false",
      region: "SG",
      page: "1",
    },
    signal,
  );

  return response.results.slice(0, 8);
}

export function getMovieDetails(movieId: number, signal?: AbortSignal) {
  return tmdbRequest<MovieDetails>(
    `/movie/${movieId}`,
    { append_to_response: "credits" },
    signal,
  );
}

export function posterUrl(path: string | null, size: "w92" | "w342" = "w342") {
  return path ? `${tmdbImageBase}/${size}${path}` : null;
}

export function movieDirectors(movie: MovieDetails) {
  return movie.credits.crew
    .filter((person) => person.job === "Director")
    .map((person) => person.name)
    .filter((name, index, names) => names.indexOf(name) === index);
}

