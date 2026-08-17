import {
  Landmark as LandmarkIcon,
  Minus,
  Plus,
  RotateCcw,
  ThumbsUp,
} from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import type { FoodPlace } from "../data/restaurants";
import {
  singaporeLandmarks,
  type SingaporeLandmark,
} from "../data/singaporeLandmarks";
import {
  SENTOSA_PATH,
  SINGAPORE_EXPRESSWAY_PATH,
  SINGAPORE_MAIN_ISLAND_PATH,
  SINGAPORE_MAJOR_ROAD_PATH,
  SINGAPORE_WATER_PATH,
} from "../data/singaporeMap";

const VIEW_WIDTH = 100;
const VIEW_HEIGHT = 61;
const MIN_SCALE = 1;
const MAX_SCALE = 8;
const DEFAULT_VIEW = { scale: MIN_SCALE, x: 0, y: 0 };

const SINGAPORE_BOUNDS = {
  north: 1.48,
  south: 1.2,
  east: 104.05,
  west: 103.59,
};

type MapView = typeof DEFAULT_VIEW;

function coordinatesFor(location: {
  latitude: number;
  longitude: number;
}) {
  return {
    x:
      ((location.longitude - SINGAPORE_BOUNDS.west) /
        (SINGAPORE_BOUNDS.east - SINGAPORE_BOUNDS.west)) *
      VIEW_WIDTH,
    y:
      ((SINGAPORE_BOUNDS.north - location.latitude) /
        (SINGAPORE_BOUNDS.north - SINGAPORE_BOUNDS.south)) *
      VIEW_HEIGHT,
  };
}

function clampView(view: MapView): MapView {
  const scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, view.scale));

  return {
    scale,
    x: Math.min(0, Math.max(VIEW_WIDTH - VIEW_WIDTH * scale, view.x)),
    y: Math.min(0, Math.max(VIEW_HEIGHT - VIEW_HEIGHT * scale, view.y)),
  };
}

function zoomAround(
  view: MapView,
  requestedScale: number,
  focus = { x: VIEW_WIDTH / 2, y: VIEW_HEIGHT / 2 },
) {
  const scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, requestedScale));
  const mapX = (focus.x - view.x) / view.scale;
  const mapY = (focus.y - view.y) / view.scale;

  return clampView({
    scale,
    x: focus.x - mapX * scale,
    y: focus.y - mapY * scale,
  });
}

type SingaporeFoodMapProps = {
  places: FoodPlace[];
  selectedPlace: FoodPlace | null;
  onSelect: (place: FoodPlace) => void;
  onDeselect: () => void;
};

export function SingaporeFoodMap({
  places,
  selectedPlace,
  onSelect,
  onDeselect,
}: SingaporeFoodMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const dragRef = useRef<{
    pointerId: number;
    startClientX: number;
    startClientY: number;
    startView: MapView;
    moved: boolean;
  } | null>(null);
  const suppressClickRef = useRef(false);
  const [view, setView] = useState<MapView>(DEFAULT_VIEW);
  const [isPanning, setIsPanning] = useState(false);
  const [selectedLandmark, setSelectedLandmark] =
    useState<SingaporeLandmark | null>(null);

  useEffect(() => {
    if (selectedPlace) setSelectedLandmark(null);
  }, [selectedPlace?.id]);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const zoomWithWheel = (event: globalThis.WheelEvent) => {
      event.preventDefault();
      const rectangle = svg.getBoundingClientRect();
      const focus = {
        x: ((event.clientX - rectangle.left) / rectangle.width) * VIEW_WIDTH,
        y: ((event.clientY - rectangle.top) / rectangle.height) * VIEW_HEIGHT,
      };
      const factor = Math.exp(-event.deltaY * 0.0015);

      setView((current) => zoomAround(current, current.scale * factor, focus));
    };

    svg.addEventListener("wheel", zoomWithWheel, { passive: false });
    return () => svg.removeEventListener("wheel", zoomWithWheel);
  }, []);

  useEffect(() => {
    const deselectWithEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setSelectedLandmark(null);
      onDeselect();
    };

    window.addEventListener("keydown", deselectWithEscape);
    return () => window.removeEventListener("keydown", deselectWithEscape);
  }, [onDeselect]);

  const zoomBy = (factor: number) => {
    setView((current) => zoomAround(current, current.scale * factor));
  };

  const startPanning = (event: PointerEvent<SVGSVGElement>) => {
    if (event.button !== 0) return;

    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startView: view,
      moved: false,
    };
    setIsPanning(true);
  };

  const pan = (event: PointerEvent<SVGSVGElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId || !svgRef.current) return;

    const rectangle = svgRef.current.getBoundingClientRect();
    const clientDeltaX = event.clientX - drag.startClientX;
    const clientDeltaY = event.clientY - drag.startClientY;
    const deltaX = (clientDeltaX / rectangle.width) * VIEW_WIDTH;
    const deltaY = (clientDeltaY / rectangle.height) * VIEW_HEIGHT;

    if (Math.abs(clientDeltaX) + Math.abs(clientDeltaY) > 4) {
      drag.moved = true;
    }

    setView(
      clampView({
        ...drag.startView,
        x: drag.startView.x + deltaX,
        y: drag.startView.y + deltaY,
      }),
    );
  };

  const stopPanning = (event: PointerEvent<SVGSVGElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    suppressClickRef.current = drag.moved;
    window.setTimeout(() => {
      suppressClickRef.current = false;
    }, 0);
    dragRef.current = null;
    setIsPanning(false);
  };

  const zoomWithDoubleClick = (event: PointerEvent<SVGSVGElement>) => {
    if (!svgRef.current || suppressClickRef.current) return;

    event.preventDefault();
    const rectangle = svgRef.current.getBoundingClientRect();
    const focus = {
      x: ((event.clientX - rectangle.left) / rectangle.width) * VIEW_WIDTH,
      y: ((event.clientY - rectangle.top) / rectangle.height) * VIEW_HEIGHT,
    };

    setView((current) => zoomAround(current, current.scale * 1.6, focus));
  };

  const useKeyboard = (event: KeyboardEvent<SVGSVGElement>) => {
    const panDistance = 5;
    let handled = true;

    if (event.key === "ArrowLeft") {
      setView((current) => clampView({ ...current, x: current.x + panDistance }));
    } else if (event.key === "ArrowRight") {
      setView((current) => clampView({ ...current, x: current.x - panDistance }));
    } else if (event.key === "ArrowUp") {
      setView((current) => clampView({ ...current, y: current.y + panDistance }));
    } else if (event.key === "ArrowDown") {
      setView((current) => clampView({ ...current, y: current.y - panDistance }));
    } else if (event.key === "+" || event.key === "=") {
      zoomBy(1.4);
    } else if (event.key === "-") {
      zoomBy(1 / 1.4);
    } else if (event.key === "Home" || event.key === "0") {
      setView(DEFAULT_VIEW);
    } else if (event.key === "Escape") {
      setSelectedLandmark(null);
      onDeselect();
    } else {
      handled = false;
    }

    if (handled) event.preventDefault();
  };

  const selectLandmark = (landmark: SingaporeLandmark) => {
    if (suppressClickRef.current) return;
    onDeselect();
    setSelectedLandmark(landmark);
  };

  const selectRestaurant = (place: FoodPlace) => {
    if (suppressClickRef.current) return;
    setSelectedLandmark(null);
    onSelect(place);
  };

  const deselectMapItem = () => {
    if (suppressClickRef.current) return;
    setSelectedLandmark(null);
    onDeselect();
  };

  const activateWithKeyboard = (
    event: KeyboardEvent<SVGGElement>,
    action: () => void,
  ) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      action();
    }
  };

  const inverseScale = 1 / view.scale;

  return (
    <div className={`singapore-map${isPanning ? " panning" : ""}`}>
      <svg
        ref={svgRef}
        aria-label="Interactive map of Singapore's water bodies, landmarks, and visited food places"
        role="application"
        tabIndex={0}
        viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
        onClick={deselectMapItem}
        onDoubleClick={zoomWithDoubleClick}
        onKeyDown={useKeyboard}
        onPointerCancel={stopPanning}
        onPointerDown={startPanning}
        onPointerMove={pan}
        onPointerUp={stopPanning}
      >
        <title>
          Drag to pan, scroll or use the controls to zoom, and select a point
          for details.
        </title>

        <g transform={`translate(${view.x} ${view.y}) scale(${view.scale})`}>
          <path className="map-island" d={SINGAPORE_MAIN_ISLAND_PATH} />
          <path className="map-island map-sentosa" d={SENTOSA_PATH} />
          <path
            className="map-water"
            d={SINGAPORE_WATER_PATH}
            vectorEffect="non-scaling-stroke"
          />
          <path
            className="map-major-road"
            d={SINGAPORE_MAJOR_ROAD_PATH}
            vectorEffect="non-scaling-stroke"
          />
          <path
            className="map-expressway"
            d={SINGAPORE_EXPRESSWAY_PATH}
            vectorEffect="non-scaling-stroke"
          />
          <path
            className="map-coastline"
            d={SINGAPORE_MAIN_ISLAND_PATH}
            vectorEffect="non-scaling-stroke"
          />
          <path
            className="map-coastline"
            d={SENTOSA_PATH}
            vectorEffect="non-scaling-stroke"
          />

          {singaporeLandmarks.map((landmark) => {
            const point = coordinatesFor(landmark);
            const isSelected = selectedLandmark?.id === landmark.id;

            return (
              <g
                className={`map-landmark${isSelected ? " selected" : ""}`}
                key={landmark.id}
                role="button"
                tabIndex={0}
                aria-label={`${landmark.name}, landmark`}
                transform={`translate(${point.x} ${point.y}) scale(${inverseScale})`}
                onClick={(event) => {
                  event.stopPropagation();
                  selectLandmark(landmark);
                }}
                onKeyDown={(event) =>
                  activateWithKeyboard(event, () => selectLandmark(landmark))
                }
                onPointerDown={(event) => event.stopPropagation()}
              >
                <circle className="map-marker-hit-area" r="1.15" />
                <path className="map-landmark-symbol" d="M0 -0.55L0.55 0L0 0.55L-0.55 0Z" />
                <text className="map-landmark-label" x="0.9" y="0.24">
                  {landmark.name}
                </text>
              </g>
            );
          })}

          {places.map((place) => {
            const point = coordinatesFor(place);
            const isSelected = selectedPlace?.id === place.id;

            return (
              <g
                className={`food-map-marker-svg${
                  place.recommended ? " recommended" : ""
                }${isSelected ? " selected" : ""}`}
                key={place.id}
                role="button"
                tabIndex={0}
                aria-label={`${place.name}${
                  place.recommended ? ", recommended" : ""
                }`}
                aria-pressed={isSelected}
                transform={`translate(${point.x} ${point.y}) scale(${inverseScale})`}
                onClick={(event) => {
                  event.stopPropagation();
                  selectRestaurant(place);
                }}
                onKeyDown={(event) =>
                  activateWithKeyboard(event, () => selectRestaurant(place))
                }
                onPointerDown={(event) => event.stopPropagation()}
              >
                <circle className="map-marker-hit-area" r="1.15" />
                <circle className="food-map-marker-dot" r="0.48" />
                <text className="food-map-marker-label" x="0.9" y="0.24">
                  {place.name}
                </text>
              </g>
            );
          })}
        </g>
      </svg>

      <div className="food-map-legend" aria-label="Map legend">
        <span>
          <i className="water" aria-hidden="true" /> water
        </span>
        <span>
          <i className="road" aria-hidden="true" /> major road
        </span>
        <span>
          <i className="landmark" aria-hidden="true" /> landmark
        </span>
        <span>
          <i className="visited" aria-hidden="true" /> visited
        </span>
        <span>
          <i className="liked" aria-hidden="true" /> recommended
        </span>
      </div>

      <div className="food-map-controls" aria-label="Map controls">
        <button
          type="button"
          aria-label="Zoom in"
          disabled={view.scale >= MAX_SCALE}
          onClick={() => zoomBy(1.5)}
        >
          <Plus aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label="Zoom out"
          disabled={view.scale <= MIN_SCALE}
          onClick={() => zoomBy(1 / 1.5)}
        >
          <Minus aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label="Reset map view"
          disabled={view.scale === MIN_SCALE && view.x === 0 && view.y === 0}
          onClick={() => setView(DEFAULT_VIEW)}
        >
          <RotateCcw aria-hidden="true" />
        </button>
      </div>

      <div className="food-map-attribution">
        <a
          href="https://data.gov.sg/datasets/d_29f066d67df3eae91df8a42f443863c8/view"
          target="_blank"
          rel="noreferrer"
        >
          map data: SLA
        </a>
        <span aria-hidden="true"> · </span>
        <a
          href="https://www.openstreetmap.org/copyright"
          target="_blank"
          rel="noreferrer"
        >
          roads &amp; landmarks: © OpenStreetMap
        </a>
      </div>

      {(selectedLandmark || selectedPlace) && (
        <aside className="food-map-selection" aria-live="polite">
          {selectedLandmark ? (
            <>
              <div>
                <strong>{selectedLandmark.name}</strong>
                <small>
                  {selectedLandmark.category} · landmark
                </small>
                <p>{selectedLandmark.description}</p>
              </div>
              <LandmarkIcon aria-hidden="true" strokeWidth={1.7} />
            </>
          ) : selectedPlace ? (
            <>
              <div>
                <strong>{selectedPlace.name}</strong>
                <small>
                  {selectedPlace.area} · {selectedPlace.type}
                </small>
              </div>
              {selectedPlace.recommended && (
                <ThumbsUp aria-label="Recommended" strokeWidth={1.7} />
              )}
            </>
          ) : null}
        </aside>
      )}
    </div>
  );
}
