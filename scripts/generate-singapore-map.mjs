import fs from "node:fs";
import path from "node:path";

const [
  sourcePath,
  roadSourcePath,
  outputPath = "src/data/singaporeMap.ts",
] =
  process.argv.slice(2);

if (!sourcePath || !roadSourcePath) {
  console.error(
    "Usage: node scripts/generate-singapore-map.mjs <national-map.geojson> <major-roads-overpass.json> [output.ts]",
  );
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
const roadData = JSON.parse(fs.readFileSync(roadSourcePath, "utf8"));
const bounds = {
  north: 1.48,
  south: 1.2,
  east: 104.05,
  west: 103.59,
};

const coastlineTolerance = 0.00035;
const sentosaTolerance = 0.00018;
const waterTolerance = 0.000035;
const roadTolerance = 0.00004;

const expresswayNames = new Set([
  "Ayer Rajah Expressway",
  "Bukit Timah Expressway",
  "Central Expressway",
  "East Coast Parkway",
  "Kallang-Paya Lebar Expressway",
  "Kranji Expressway",
  "Marina Coastal Expressway",
  "Pan-Island Expressway",
  "Seletar Expressway",
  "Tampines Expressway",
]);

const majorRoadNames = new Set([
  "Airport Boulevard",
  "Alexandra Road",
  "Bukit Timah Road",
  "Changi Coast Road",
  "Clementi Road",
  "Commonwealth Avenue",
  "Dunearn Road",
  "Holland Road",
  "Jalan Bukit Merah",
  "Jurong Town Hall Road",
  "Lim Chu Kang Road",
  "Mandai Road",
  "Mountbatten Road",
  "New Upper Changi Road",
  "Nicoll Highway",
  "Orchard Road",
  "Pasir Panjang Road",
  "Paya Lebar Road",
  "Pioneer Road",
  "Sembawang Road",
  "Serangoon Road",
  "Tampines Road",
  "Tanah Merah Coast Road",
  "Thomson Road",
  "Upper Bukit Timah Road",
  "Upper Paya Lebar Road",
  "Upper Serangoon Road",
  "Upper Thomson Road",
  "West Coast Highway",
  "Woodlands Road",
  "Yio Chu Kang Road",
]);

function squaredDistance(a, b) {
  const x = a[0] - b[0];
  const y = a[1] - b[1];
  return x * x + y * y;
}

function squaredSegmentDistance(point, start, end) {
  let x = start[0];
  let y = start[1];
  let dx = end[0] - x;
  let dy = end[1] - y;

  if (dx !== 0 || dy !== 0) {
    const offset =
      ((point[0] - x) * dx + (point[1] - y) * dy) / (dx * dx + dy * dy);

    if (offset > 1) {
      x = end[0];
      y = end[1];
    } else if (offset > 0) {
      x += dx * offset;
      y += dy * offset;
    }
  }

  dx = point[0] - x;
  dy = point[1] - y;
  return dx * dx + dy * dy;
}

function simplifyRadialDistance(points, squaredTolerance) {
  let previous = points[0];
  const simplified = [previous];

  for (let index = 1; index < points.length; index += 1) {
    const point = points[index];
    if (squaredDistance(point, previous) > squaredTolerance) {
      simplified.push(point);
      previous = point;
    }
  }

  if (previous !== points.at(-1)) simplified.push(points.at(-1));
  return simplified;
}

function simplifyLine(points, squaredTolerance) {
  if (points.length <= 2) return points;

  const candidates = simplifyRadialDistance(points, squaredTolerance);
  const lastIndex = candidates.length - 1;
  const markers = new Uint8Array(candidates.length);
  const stack = [[0, lastIndex]];
  markers[0] = 1;
  markers[lastIndex] = 1;

  while (stack.length > 0) {
    const [first, last] = stack.pop();
    let maximum = squaredTolerance;
    let splitIndex = 0;

    for (let index = first + 1; index < last; index += 1) {
      const distance = squaredSegmentDistance(
        candidates[index],
        candidates[first],
        candidates[last],
      );

      if (distance > maximum) {
        splitIndex = index;
        maximum = distance;
      }
    }

    if (splitIndex !== 0) {
      markers[splitIndex] = 1;
      stack.push([first, splitIndex], [splitIndex, last]);
    }
  }

  return candidates.filter((_, index) => markers[index]);
}

function simplifyRing(rawRing, tolerance) {
  const ring = rawRing
    .slice(0, -1)
    .map(([longitude, latitude]) => [longitude, latitude]);

  if (ring.length <= 3) return ring;

  let oppositeIndex = 1;
  for (let index = 2; index < ring.length; index += 1) {
    if (
      squaredDistance(ring[0], ring[index]) >
      squaredDistance(ring[0], ring[oppositeIndex])
    ) {
      oppositeIndex = index;
    }
  }

  const squaredTolerance = tolerance * tolerance;
  const firstHalf = simplifyLine(
    ring.slice(0, oppositeIndex + 1),
    squaredTolerance,
  );
  const secondHalf = simplifyLine(
    [...ring.slice(oppositeIndex), ring[0]],
    squaredTolerance,
  );

  return [...firstHalf.slice(0, -1), ...secondHalf.slice(0, -1)];
}

function project([longitude, latitude]) {
  return [
    (((longitude - bounds.west) / (bounds.east - bounds.west)) * 100).toFixed(
      2,
    ),
    (((bounds.north - latitude) / (bounds.north - bounds.south)) * 61).toFixed(
      2,
    ),
  ];
}

function linearPath(points) {
  return `${points
    .map(
      (point, index) =>
        `${index === 0 ? "M" : "L"}${project(point).join(" ")}`,
    )
    .join(" ")}Z`;
}

function linearOpenPath(points) {
  return points
    .map(
      (point, index) =>
        `${index === 0 ? "M" : "L"}${project(point).join(" ")}`,
    )
    .join(" ");
}

function pointInRing([x, y], ring) {
  let inside = false;

  for (
    let index = 0, previous = ring.length - 1;
    index < ring.length;
    previous = index, index += 1
  ) {
    const [currentX, currentY] = ring[index];
    const [previousX, previousY] = ring[previous];
    const crosses =
      currentY > y !== previousY > y &&
      x <
        ((previousX - currentX) * (y - currentY)) /
          (previousY - currentY) +
          currentX;

    if (crosses) inside = !inside;
  }

  return inside;
}

function ringBounds(ring) {
  return ring.reduce(
    (result, [longitude, latitude]) => ({
      north: Math.max(result.north, latitude),
      south: Math.min(result.south, latitude),
      east: Math.max(result.east, longitude),
      west: Math.min(result.west, longitude),
    }),
    { north: -Infinity, south: Infinity, east: -Infinity, west: Infinity },
  );
}

function pointInBounds([longitude, latitude], area) {
  return (
    longitude >= area.west &&
    longitude <= area.east &&
    latitude >= area.south &&
    latitude <= area.north
  );
}

function polygonsFromGeometry(geometry) {
  if (geometry.type === "Polygon") return [geometry.coordinates];
  if (geometry.type === "MultiPolygon") return geometry.coordinates;
  return [];
}

function findFeature(folderPath, name) {
  const feature = data.features.find(
    (item) =>
      item.geometry &&
      item.properties.FOLDERPATH === folderPath &&
      item.properties.NAME === name,
  );

  if (!feature) throw new Error(`Could not find ${folderPath}/${name}`);
  return feature;
}

const mainIsland = findFeature(
  "Layers/Coastal_Outlines",
  "SINGAPORE - MAIN ISLAND",
);
const sentosa = findFeature("Layers/Coastal_Outlines", "SENTOSA");
const mainRing = mainIsland.geometry.coordinates[0];
const sentosaRing = sentosa.geometry.coordinates[0];
// Filtering against a lightly simplified boundary is dramatically faster and
// does not alter the detailed coastline that is ultimately exported.
const mainFilterRing = simplifyRing(mainRing, 0.001);
const sentosaFilterRing = simplifyRing(sentosaRing, 0.0005);
const mainFilterBounds = ringBounds(mainFilterRing);
const sentosaFilterBounds = ringBounds(sentosaFilterRing);
const coastalWaterNames = new Set(["MARINA BAY", "MARINA RESERVOIR"]);

function belongsToDisplayedIslands(feature) {
  if (coastalWaterNames.has(feature.properties.NAME)) return true;

  return polygonsFromGeometry(feature.geometry).some(([outerRing]) =>
    outerRing.some(pointOnDisplayedIslands),
  );
}

function pointOnDisplayedIslands(point) {
  return (
    (pointInBounds(point, mainFilterBounds) &&
      pointInRing(point, mainFilterRing)) ||
    (pointInBounds(point, sentosaFilterBounds) &&
      pointInRing(point, sentosaFilterRing))
  );
}

function featurePath(feature) {
  return polygonsFromGeometry(feature.geometry)
    .flatMap((polygon) => polygon)
    .map((ring) => simplifyRing(ring, waterTolerance))
    .filter((ring) => ring.length >= 3)
    .map(linearPath)
    .join(" ");
}

function roadPath(road) {
  const paths = [];
  let current = [];

  const finishCurrentPath = () => {
    if (current.length >= 2) {
      paths.push(
        linearOpenPath(simplifyLine(current, roadTolerance * roadTolerance)),
      );
    }
    current = [];
  };

  for (const location of road.geometry ?? []) {
    const point = [location.lon, location.lat];
    if (pointOnDisplayedIslands(point)) {
      current.push(point);
    } else {
      finishCurrentPath();
    }
  }
  finishCurrentPath();

  return paths.join(" ");
}

console.log(
  `Filtering hydrographic features (${mainFilterRing.length} main-island boundary points)...`,
);
const waterFeatures = data.features.filter(
  (feature) =>
    feature.geometry &&
    feature.properties.FOLDERPATH === "Layers/Hydrographic" &&
    belongsToDisplayedIslands(feature),
);
console.log(`Simplifying ${waterFeatures.length} hydrographic features...`);

const mainIslandPoints = simplifyRing(
  mainIsland.geometry.coordinates[0],
  coastlineTolerance,
);
const sentosaPoints = simplifyRing(
  sentosa.geometry.coordinates[0],
  sentosaTolerance,
);
const waterPaths = [];
for (const [index, feature] of waterFeatures.entries()) {
  waterPaths.push(featurePath(feature));
  if ((index + 1) % 100 === 0) {
    console.log(`  ${index + 1}/${waterFeatures.length}`);
  }
}
const waterPath = waterPaths.filter(Boolean).join(" ");
const expresswayPaths = roadData.elements
  .filter(
    (road) =>
      road.type === "way" && expresswayNames.has(road.tags?.name),
  )
  .map(roadPath)
  .filter(Boolean);
const majorRoadPaths = roadData.elements
  .filter(
    (road) => road.type === "way" && majorRoadNames.has(road.tags?.name),
  )
  .map(roadPath)
  .filter(Boolean);

const output = `// Generated by scripts/generate-singapore-map.mjs from the SLA National Map Polygon dataset.
// The paths use straight line segments so detail remains crisp at every zoom level.
export const SINGAPORE_MAIN_ISLAND_PATH =
  ${JSON.stringify(linearPath(mainIslandPoints))};

export const SENTOSA_PATH =
  ${JSON.stringify(linearPath(sentosaPoints))};

export const SINGAPORE_WATER_PATH =
  ${JSON.stringify(waterPath)};

export const SINGAPORE_EXPRESSWAY_PATH =
  ${JSON.stringify(expresswayPaths.join(" "))};

export const SINGAPORE_MAJOR_ROAD_PATH =
  ${JSON.stringify(majorRoadPaths.join(" "))};
`;

const resolvedOutputPath = path.resolve(outputPath);
fs.mkdirSync(path.dirname(resolvedOutputPath), { recursive: true });
fs.writeFileSync(resolvedOutputPath, output);

console.log(
  `Generated ${resolvedOutputPath}\n` +
    `Main island: ${mainIsland.geometry.coordinates[0].length} -> ${mainIslandPoints.length} points\n` +
    `Sentosa: ${sentosa.geometry.coordinates[0].length} -> ${sentosaPoints.length} points\n` +
    `Water: ${waterFeatures.length} features\n` +
    `Roads: ${expresswayPaths.length} expressway and ${majorRoadPaths.length} arterial segments`,
);
