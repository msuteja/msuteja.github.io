import { ThumbsUp } from "lucide-react";
import { useMemo, useState } from "react";
import { SingaporeFoodMap } from "../components/SingaporeFoodMap";
import {
  foodPlaces,
  type FoodPlace,
  type FoodPlaceType,
} from "../data/restaurants";
import { usePageMeta } from "../hooks/usePageMeta";

type TypeFilter = "all" | FoodPlaceType;
type PriceFilter = "all" | "1" | "2" | "3" | "4";

const pageSize = 50;

function Price({ level }: { level: FoodPlace["priceLevel"] }) {
  return (
    <span className="food-price" aria-label={`Price level ${level} out of 4`}>
      {"$".repeat(level)}
    </span>
  );
}

export function FoodPage() {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [cuisineFilter, setCuisineFilter] = useState("all");
  const [priceFilter, setPriceFilter] = useState<PriceFilter>("all");
  const [recommendedOnly, setRecommendedOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  usePageMeta(
    "Food",
    "A personal map of hawkers and restaurants I visited across Singapore.",
  );

  const cuisines = useMemo(
    () =>
      [...new Set(foodPlaces.flatMap((place) => place.cuisines))].sort((a, b) =>
        a.localeCompare(b),
      ),
    [],
  );

  const filteredPlaces = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return foodPlaces.filter((place) => {
      const matchesQuery =
        !normalizedQuery ||
        [place.name, place.area, ...place.cuisines].some((value) =>
          value.toLowerCase().includes(normalizedQuery),
        );
      const matchesType =
        typeFilter === "all" || place.type === typeFilter;
      const matchesCuisine =
        cuisineFilter === "all" || place.cuisines.includes(cuisineFilter);
      const matchesPrice =
        priceFilter === "all" || place.priceLevel === Number(priceFilter);

      return (
        matchesQuery &&
        matchesType &&
        matchesCuisine &&
        matchesPrice &&
        (!recommendedOnly || place.recommended)
      );
    });
  }, [cuisineFilter, priceFilter, query, recommendedOnly, typeFilter]);

  const totalPages = Math.ceil(filteredPlaces.length / pageSize);
  const pageStart = (page - 1) * pageSize;
  const pagePlaces = filteredPlaces.slice(pageStart, pageStart + pageSize);
  const selectedPlace =
    filteredPlaces.find((place) => place.id === selectedId) ?? null;
  const recommendationCount = foodPlaces.filter(
    (place) => place.recommended,
  ).length;

  const resetResults = () => {
    setPage(1);
    setSelectedId(null);
  };

  const selectPlace = (place: FoodPlace) => {
    const placeIndex = filteredPlaces.findIndex(
      (candidate) => candidate.id === place.id,
    );
    if (placeIndex >= 0) setPage(Math.floor(placeIndex / pageSize) + 1);
    setSelectedId(place.id);
  };

  return (
    <main className="index-page food-page">
      <header className="index-header food-header">
        <div>
          <h1>food</h1>
          <p>A map of places I have eaten across Singapore.</p>
        </div>
        <div className="food-counts" aria-label="Food log summary">
          <span>{foodPlaces.length} visited</span>
          <span>{recommendationCount} recommended</span>
        </div>
      </header>

      <section className="food-map-section" aria-labelledby="food-map-title">
        <div className="food-section-heading">
          <h2 id="food-map-title">Singapore</h2>
          <span>select a point to see the place</span>
        </div>
        <SingaporeFoodMap
          places={filteredPlaces}
          selectedPlace={selectedPlace}
          onSelect={selectPlace}
          onDeselect={() => setSelectedId(null)}
        />
      </section>

      <section className="food-log" aria-labelledby="food-log-title">
        <div className="food-log-header">
          <h2 id="food-log-title">places</h2>
          <span className="food-results-count" aria-live="polite">
            {filteredPlaces.length} {filteredPlaces.length === 1 ? "place" : "places"}
          </span>
        </div>

        <div className="food-filter-bar" aria-label="Filter food places">
          <label className="food-search-field">
            <span>search</span>
            <input
              type="search"
              value={query}
              placeholder="name, area, or cuisine"
              onChange={(event) => {
                setQuery(event.target.value);
                resetResults();
              }}
            />
          </label>

          <label>
            <span>type</span>
            <select
              value={typeFilter}
              onChange={(event) => {
                setTypeFilter(event.target.value as TypeFilter);
                resetResults();
              }}
            >
              <option value="all">all types</option>
              <option value="hawker">hawkers</option>
              <option value="restaurant">restaurants</option>
            </select>
          </label>

          <label>
            <span>cuisine</span>
            <select
              value={cuisineFilter}
              onChange={(event) => {
                setCuisineFilter(event.target.value);
                resetResults();
              }}
            >
              <option value="all">all cuisines</option>
              {cuisines.map((cuisine) => (
                <option key={cuisine} value={cuisine}>
                  {cuisine}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>price</span>
            <select
              value={priceFilter}
              onChange={(event) => {
                setPriceFilter(event.target.value as PriceFilter);
                resetResults();
              }}
            >
              <option value="all">all prices</option>
              <option value="1">$</option>
              <option value="2">$$</option>
              <option value="3">$$$</option>
              <option value="4">$$$$</option>
            </select>
          </label>

          <label className="food-recommended-filter">
            <input
              type="checkbox"
              checked={recommendedOnly}
              onChange={(event) => {
                setRecommendedOnly(event.target.checked);
                resetResults();
              }}
            />
            <span>recommended only</span>
          </label>
        </div>

        {filteredPlaces.length === 0 ? (
          <p className="food-empty">
            {foodPlaces.length === 0
              ? "Places will appear here as I add them."
              : "No places match this filter yet."}
          </p>
        ) : (
          <>
            <p className="food-results-range">
              showing {pageStart + 1}–{Math.min(pageStart + pageSize, filteredPlaces.length)} of {filteredPlaces.length}
            </p>
            <ul className="food-place-list">
              {pagePlaces.map((place) => (
                <li
                  className={selectedId === place.id ? "selected" : undefined}
                  key={place.id}
                >
                  <button type="button" onClick={() => selectPlace(place)}>
                    <span className="food-place-heading">
                      <span>
                        <strong>{place.name}</strong>
                        <small>
                          {place.area} · {place.type}
                        </small>
                      </span>
                      <span className="food-place-signals">
                        <Price level={place.priceLevel} />
                        {place.recommended && (
                          <ThumbsUp
                            aria-label="Recommended"
                            strokeWidth={1.7}
                          />
                        )}
                      </span>
                    </span>

                    <span className="food-cuisines">
                      {place.cuisines.join(" · ")}
                    </span>

                    {place.summary && (
                      <span className="food-summary">{place.summary}</span>
                    )}

                    {(place.dishesToOrder?.length ||
                      place.dishesToAvoid?.length) && (
                      <span className="food-dishes">
                        {place.dishesToOrder?.length ? (
                          <span>
                            order: {place.dishesToOrder.join(", ")}
                          </span>
                        ) : null}
                        {place.dishesToAvoid?.length ? (
                          <span>
                            skip: {place.dishesToAvoid.join(", ")}
                          </span>
                        ) : null}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>

            {totalPages > 1 && (
              <nav className="food-pagination" aria-label="Food places pages">
                <button
                  type="button"
                  disabled={page === 1}
                  onClick={() => setPage((currentPage) => currentPage - 1)}
                >
                  previous
                </button>
                <span className="food-page-numbers">
                  {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                    (pageNumber) => (
                      <button
                        className={page === pageNumber ? "active" : undefined}
                        type="button"
                        key={pageNumber}
                        aria-current={page === pageNumber ? "page" : undefined}
                        aria-label={`Page ${pageNumber}`}
                        onClick={() => setPage(pageNumber)}
                      >
                        {pageNumber}
                      </button>
                    ),
                  )}
                </span>
                <button
                  type="button"
                  disabled={page === totalPages}
                  onClick={() => setPage((currentPage) => currentPage + 1)}
                >
                  next
                </button>
              </nav>
            )}
          </>
        )}
      </section>
    </main>
  );
}
