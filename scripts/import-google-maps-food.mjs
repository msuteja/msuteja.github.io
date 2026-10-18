import fs from "node:fs";
import path from "node:path";

const argumentsList = process.argv.slice(2);
const mergeExisting = argumentsList.includes("--merge-existing");
const [inputPath, requestedOutputPath] = argumentsList.filter(
  (argument) => argument !== "--merge-existing",
);

if (!inputPath) {
  throw new Error(
    "Usage: node scripts/import-google-maps-food.mjs <Google Maps payload.txt> [output.ts] [--merge-existing]",
  );
}

const outputPath =
  requestedOutputPath ?? path.resolve("src/data/googleMapsFoodPlaces.ts");
const foodIcons = new Set(["restaurant", "cafe", "shoppingbag"]);
const structuralCategories = new Set([
  "bar",
  "cafe",
  "caterer",
  "delivery restaurant",
  "delivery service",
  "family-friendly",
  "food court",
  "restaurant",
  "takeaways",
]);

function slugify(value) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function priceLevel(priceRange) {
  if (!priceRange) return 2;
  if (/100\s*\+/.test(priceRange)) return 4;

  const amounts = [...priceRange.matchAll(/\d+/g)].map((match) =>
    Number(match[0]),
  );
  const upperBound = Math.max(...amounts);

  if (upperBound <= 15) return 1;
  if (upperBound <= 40) return 2;
  if (upperBound <= 90) return 3;
  return 4;
}

function cuisinesFor(categories, type) {
  const seen = new Set();
  const cuisines = [];

  for (const category of categories ?? []) {
    if (typeof category !== "string") continue;
    const label = category.replace(/\s+restaurant$/i, "").trim();
    const normalized = label.toLowerCase();
    if (!label || structuralCategories.has(normalized) || seen.has(normalized)) {
      continue;
    }
    if (/^(?:catering|coffee shop|cocktail bar|event venue|wine bar)$/i.test(label)) {
      continue;
    }

    seen.add(normalized);
    cuisines.push(label);
  }

  return cuisines.slice(0, 3).length
    ? cuisines.slice(0, 3)
    : [type === "hawker" ? "Hawker" : "Dining"];
}

function googleMapsIdFor(place) {
  const placeUrl = place?.[17]?.[0];
  if (typeof placeUrl !== "string") return undefined;

  const match = placeUrl.match(/!1s([^?]+)/);
  return match ? decodeURIComponent(match[1]) : undefined;
}

function coordinateKey(place) {
  if (
    !Number.isFinite(place.latitude) ||
    !Number.isFinite(place.longitude)
  ) {
    return undefined;
  }

  return `${place.latitude.toFixed(6)},${place.longitude.toFixed(6)}`;
}

function likelySamePlace(firstName, secondName) {
  const first = slugify(firstName);
  const second = slugify(secondName);
  if (first.includes(second) || second.includes(first)) return true;

  const firstTokens = new Set(first.split("-").filter(Boolean));
  const secondTokens = new Set(second.split("-").filter(Boolean));
  const sharedTokenCount = [...firstTokens].filter((token) =>
    secondTokens.has(token),
  ).length;
  return sharedTokenCount / Math.max(firstTokens.size, secondTokens.size) >= 0.6;
}

const raw = fs.readFileSync(path.resolve(inputPath), "utf8");
const payload = JSON.parse(raw.replace(/^\)\]\}'\r?\n/, ""));
const contributions = payload?.[45]?.[0];

if (!Array.isArray(contributions)) {
  throw new Error("The input does not contain the expected Google Maps data.");
}

const usedIds = new Map();
let places = contributions.flatMap((contribution) => {
  const place = contribution?.[4];
  const icon = place?.[8]?.[1];
  const countryCode = place?.[29];
  const coordinates = place?.[0];
  const name = place?.[2];

  if (
    countryCode !== "SG" ||
    !foodIcons.has(icon) ||
    typeof name !== "string" ||
    !Number.isFinite(coordinates?.[2]) ||
    !Number.isFinite(coordinates?.[3])
  ) {
    return [];
  }

  const categories = place?.[4] ?? [];
  const isHawker = categories.some((category) =>
    /hawker|food court/i.test(category),
  );
  const type = isHawker ? "hawker" : "restaurant";
  const baseId = slugify(name);
  const duplicateNumber = usedIds.get(baseId) ?? 0;
  usedIds.set(baseId, duplicateNumber + 1);

  return [
    {
      id: duplicateNumber ? `${baseId}-${duplicateNumber + 1}` : baseId,
      googleMapsId: googleMapsIdFor(place),
      name,
      type,
      area: place?.[32] || "Singapore",
      latitude: coordinates[2],
      longitude: coordinates[3],
      cuisines: cuisinesFor(categories, type),
      priceLevel: priceLevel(place?.[31]),
      recommended: contribution?.[2]?.[2]?.[0]?.[0] === 5,
    },
  ];
});

const seenGoogleMapsIds = new Set();
places = places.filter((place) => {
  if (place.googleMapsId && seenGoogleMapsIds.has(place.googleMapsId)) {
    return false;
  }

  if (place.googleMapsId) seenGoogleMapsIds.add(place.googleMapsId);
  return true;
});

let preservedCount = 0;

if (mergeExisting && fs.existsSync(outputPath)) {
  const existingSource = fs.readFileSync(outputPath, "utf8");
  const arrayStart = existingSource.indexOf("[", existingSource.indexOf(" = "));
  const arrayEnd = existingSource.lastIndexOf("]") + 1;
  const existingPlaces = JSON.parse(existingSource.slice(arrayStart, arrayEnd));
  const currentNames = new Set(places.map((place) => slugify(place.name)));
  const currentGoogleMapsIds = new Set(
    places.map((place) => place.googleMapsId).filter(Boolean),
  );
  const preservedPlaces = existingPlaces.filter((place) => {
    const coordinates = coordinateKey(place);
    const renamedCurrentPlace = coordinates
      ? places.find(
          (currentPlace) =>
            coordinateKey(currentPlace) === coordinates &&
            likelySamePlace(currentPlace.name, place.name),
        )
      : undefined;
    return !(
      currentNames.has(slugify(place.name)) ||
      (place.googleMapsId && currentGoogleMapsIds.has(place.googleMapsId)) ||
      renamedCurrentPlace
    );
  });

  preservedCount = preservedPlaces.length;
  places = [...places, ...preservedPlaces];
}

const source = `import type { FoodPlace } from "./restaurants";\n\n// Generated from Michael's public Google Maps contributions.\n// The public feed is refreshed first; --merge-existing preserves older places that Google no longer returns.\n// Re-run scripts/import-google-maps-food.mjs with --merge-existing when ratings change.\nexport const googleMapsFoodPlaces: FoodPlace[] = ${JSON.stringify(places, null, 2)};\n`;

fs.writeFileSync(outputPath, source);
console.log(
  `Wrote ${places.length} Singapore food places to ${outputPath}` +
    (preservedCount ? ` (${preservedCount} older places preserved)` : ""),
);
