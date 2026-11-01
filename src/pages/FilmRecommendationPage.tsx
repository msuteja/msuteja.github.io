import { Check, Film, Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { SisyphusFilmAnimation } from "../components/SisyphusFilmAnimation";
import {
  getMovieDetails,
  isTmdbConfigured,
  movieDirectors,
  posterUrl,
  searchMovies,
  type MovieDetails,
  type MovieSearchResult,
} from "../data/tmdb";
import { usePageMeta } from "../hooks/usePageMeta";

const recommendationEndpoint =
  "https://formsubmit.co/ajax/michaelsuteja05@gmail.com";

function releaseYear(releaseDate: string) {
  return releaseDate ? releaseDate.slice(0, 4) : "year unknown";
}

function Poster({
  path,
  title,
  size = "large",
}: {
  path: string | null;
  title: string;
  size?: "small" | "large";
}) {
  const source = posterUrl(path, size === "small" ? "w92" : "w342");

  return source ? (
    <img src={source} alt={`${title} poster`} loading="lazy" />
  ) : (
    <span className="film-poster-placeholder" aria-label={`No poster available for ${title}`}>
      <Film aria-hidden="true" strokeWidth={1.4} />
      <small>no poster</small>
    </span>
  );
}

export function FilmRecommendationPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MovieSearchResult[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<MovieDetails | null>(null);
  const [selectionLocked, setSelectionLocked] = useState(false);
  const [searching, setSearching] = useState(false);
  const [loadingMovie, setLoadingMovie] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  usePageMeta(
    "Recommend me a film",
    "Recommend a film for Michael Suteja's ever-growing watchlist.",
  );

  useEffect(() => {
    if (!isTmdbConfigured || selectionLocked || query.trim().length < 2) {
      setResults([]);
      setSearching(false);
      return;
    }

    const controller = new AbortController();
    setSearching(true);
    const timeout = window.setTimeout(async () => {
      setError(null);

      try {
        setResults(await searchMovies(query.trim(), controller.signal));
      } catch (requestError) {
        if (requestError instanceof DOMException && requestError.name === "AbortError") {
          return;
        }
        setError("The film search is having an intermission. Please try again.");
        setResults([]);
      } finally {
        if (!controller.signal.aborted) setSearching(false);
      }
    }, 350);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [query, selectionLocked]);

  useEffect(() => {
    if (!confirmationOpen) return;

    closeButtonRef.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setConfirmationOpen(false);
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [confirmationOpen]);

  const selectMovie = async (movie: MovieSearchResult) => {
    setSelectionLocked(true);
    setQuery(movie.title);
    setResults([]);
    setSelectedMovie(null);
    setLoadingMovie(true);
    setError(null);

    try {
      setSelectedMovie(await getMovieDetails(movie.id));
    } catch {
      setError("I could not retrieve that film's details. Please choose it again.");
      setSelectionLocked(false);
    } finally {
      setLoadingMovie(false);
    }
  };

  const recommendMovie = async () => {
    if (!selectedMovie) return;

    const directors = movieDirectors(selectedMovie);
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(recommendationEndpoint, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          _subject: `New film recommendation: ${selectedMovie.title}`,
          _template: "table",
          _captcha: "false",
          film: selectedMovie.title,
          year: releaseYear(selectedMovie.release_date),
          director: directors.join(", ") || "Unknown",
          genres: selectedMovie.genres.map((genre) => genre.name).join(", "),
          runtime: selectedMovie.runtime
            ? `${selectedMovie.runtime} minutes`
            : "Unknown",
          tmdb: `https://www.themoviedb.org/movie/${selectedMovie.id}`,
          page: window.location.href,
        }),
      });

      if (!response.ok) throw new Error("Recommendation submission failed.");
      setConfirmationOpen(true);
    } catch {
      setError("The recommendation did not make it up the hill. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const chooseAnother = () => {
    setQuery("");
    setSelectedMovie(null);
    setSelectionLocked(false);
    setError(null);
  };

  const directors = selectedMovie ? movieDirectors(selectedMovie) : [];
  const minutes = selectedMovie?.runtime
    ? `${selectedMovie.runtime} minutes`
    : "an indeterminate number of minutes";

  return (
    <main className="film-page">
      <header className="film-page-header">
        <div>
          <h1>recommend me a film</h1>
          <p>
            Contribute to my ever-growing film watchlist by recommending me a film
          </p>
        </div>
        <SisyphusFilmAnimation />
      </header>

      <section className="film-recommender" aria-labelledby="film-search-title">
        <h2 id="film-search-title">find a film</h2>

        <div className="film-search-shell">
          <Search aria-hidden="true" strokeWidth={1.5} />
          <input
            type="search"
            value={query}
            autoComplete="off"
            placeholder="Start typing a film title..."
            aria-label="Search for a film"
            aria-controls="film-search-results"
            aria-expanded={results.length > 0}
            role="combobox"
            disabled={!isTmdbConfigured}
            onChange={(event) => {
              setQuery(event.target.value);
              setResults([]);
              setSelectionLocked(false);
              setSelectedMovie(null);
              setError(null);
            }}
          />
          {searching && <span className="film-searching">searching…</span>}
          {query && !searching && (
            <button
              type="button"
              aria-label="Clear film search"
              onClick={chooseAnother}
            >
              <X aria-hidden="true" />
            </button>
          )}
        </div>

        {!isTmdbConfigured && (
          <p className="film-configuration-note" role="status">
            Film search is waiting for its TMDB API key.
          </p>
        )}

        {results.length > 0 && (
          <ul id="film-search-results" className="film-search-results">
            {results.map((movie) => (
              <li key={movie.id}>
                <button type="button" onClick={() => selectMovie(movie)}>
                  <span className="film-result-poster">
                    <Poster path={movie.poster_path} title={movie.title} size="small" />
                  </span>
                  <span>
                    <strong>{movie.title}</strong>
                    <small>
                      {releaseYear(movie.release_date)}
                      {movie.original_title !== movie.title
                        ? ` · ${movie.original_title}`
                        : ""}
                    </small>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}

        {!searching &&
          !selectionLocked &&
          query.trim().length >= 2 &&
          results.length === 0 &&
          !error &&
          isTmdbConfigured && (
            <p className="film-no-results">No films found. Sisyphus remains unmoved.</p>
          )}

        {loadingMovie && (
          <div className="film-card film-card-loading" aria-live="polite">
            retrieving film details…
          </div>
        )}

        {selectedMovie && (
          <article className="film-card">
            <div className="film-card-poster">
              <Poster path={selectedMovie.poster_path} title={selectedMovie.title} />
            </div>
            <div className="film-card-copy">
              <div className="film-card-heading">
                <div>
                  <span>your recommendation</span>
                  <h2>{selectedMovie.title}</h2>
                </div>
                <button type="button" onClick={chooseAnother}>
                  change film
                </button>
              </div>

              <dl className="film-facts">
                <div>
                  <dt>year</dt>
                  <dd>{releaseYear(selectedMovie.release_date)}</dd>
                </div>
                <div>
                  <dt>runtime</dt>
                  <dd>{selectedMovie.runtime ? `${selectedMovie.runtime} min` : "unknown"}</dd>
                </div>
                <div>
                  <dt>genre</dt>
                  <dd>
                    {selectedMovie.genres.map((genre) => genre.name).join(", ") || "unknown"}
                  </dd>
                </div>
                <div>
                  <dt>director</dt>
                  <dd>{directors.join(", ") || "unknown"}</dd>
                </div>
              </dl>

              {selectedMovie.overview && (
                <p className="film-overview">{selectedMovie.overview}</p>
              )}

              <button
                className="film-recommend-button"
                type="button"
                disabled={submitting}
                onClick={recommendMovie}
              >
                {submitting ? "sending recommendation…" : "recommend"}
              </button>
            </div>
          </article>
        )}

        {error && (
          <p className="film-error" role="alert">
            {error}
          </p>
        )}
      </section>

      <aside className="film-attribution" aria-label="Film data attribution">
        <img
          src="https://www.themoviedb.org/assets/v4/logos/v2/blue_square_2-d537fb228cf3ded904ef09b136fe3fec72548ebc1fea3fbbd1ad9e36364db38b.svg"
          alt="TMDB"
        />
        <p>
          Film data and posters from TMDB. This product uses the TMDB API but is
          not endorsed or certified by TMDB.
        </p>
      </aside>

      {confirmationOpen && selectedMovie && (
        <div
          className="film-confirmation-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setConfirmationOpen(false);
          }}
        >
          <div
            className="film-confirmation"
            role="dialog"
            aria-modal="true"
            aria-labelledby="film-confirmation-title"
          >
            <span className="film-confirmation-icon">
              <Check aria-hidden="true" />
            </span>
            <p id="film-confirmation-title">
              Congratulations! There might be some chance (maybe) that I will
              spend {minutes} on your recommendation!
            </p>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={() => setConfirmationOpen(false)}
            >
              back to the climb
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

