import { ThumbsUp } from "lucide-react";
import { useState } from "react";
import { SingaporeFoodMap } from "../components/SingaporeFoodMap";
import {
  foodPlaces,
  type FoodPlace,
  type FoodPlaceType,
} from "../data/restaurants";
import { usePageMeta } from "../hooks/usePageMeta";

type FoodFilter = "all" | FoodPlaceType | "recommended";

const filters: { label: string; value: FoodFilter }[] = [
  { label: "all", value: "all" },
  { label: "hawkers", value: "hawker" },
  { label: "restaurants", value: "restaurant" },
  { label: "recommended", value: "recommended" },
];

function matchesFilter(place: FoodPlace, filter: FoodFilter) {
  if (filter === "all") return true;
  if (filter === "recommended") return place.recommended;
  return place.type === filter;
}

function Price({ level }: { level: FoodPlace["priceLevel"] }) {
  return (
    <span className="food-price" aria-label={`Price level ${level} out of 4`}>
      {"$".repeat(level)}
    </span>
  );
}

export function FoodPage() {
  const [filter, setFilter] = useState<FoodFilter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  usePageMeta(
    "Food",
    "A personal map of hawkers and restaurants I visited across Singapore.",
  );

  const visiblePlaces = foodPlaces.filter((place) =>
    matchesFilter(place, filter),
  );
  const selectedPlace =
    visiblePlaces.find((place) => place.id === selectedId) ?? null;
  const recommendationCount = foodPlaces.filter(
    (place) => place.recommended,
  ).length;

  const selectPlace = (place: FoodPlace) => setSelectedId(place.id);

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
          places={visiblePlaces}
          selectedPlace={selectedPlace}
          onSelect={selectPlace}
          onDeselect={() => setSelectedId(null)}
        />
      </section>

      <section className="food-log" aria-labelledby="food-log-title">
        <div className="food-log-header">
          <h2 id="food-log-title">places</h2>
          <div className="food-filters" aria-label="Filter food places">
            {filters.map((item) => (
              <button
                className={filter === item.value ? "active" : undefined}
                key={item.value}
                type="button"
                aria-pressed={filter === item.value}
                onClick={() => {
                  setFilter(item.value);
                  setSelectedId(null);
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {visiblePlaces.length === 0 ? (
          <p className="food-empty">
            {foodPlaces.length === 0
              ? "Places will appear here as I add them."
              : "No places match this filter yet."}
          </p>
        ) : (
          <ul className="food-place-list">
            {visiblePlaces.map((place) => (
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
        )}
      </section>
    </main>
  );
}
