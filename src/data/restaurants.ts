import { googleMapsFoodPlaces } from "./googleMapsFoodPlaces";

export type FoodPlaceType = "hawker" | "restaurant";
export type PriceLevel = 1 | 2 | 3 | 4;

export type FoodPlace = {
  id: string;
  name: string;
  type: FoodPlaceType;
  area: string;
  latitude: number;
  longitude: number;
  cuisines: string[];
  priceLevel: PriceLevel;
  recommended: boolean;
  summary?: string;
  dishesToOrder?: string[];
  dishesToAvoid?: string[];
};

const manuallyAddedFoodPlaces: FoodPlace[] = [
  {
    id: "tian-tian-chicken-rice",
    name: "Tian Tian Chicken Rice",
    type: "hawker",
    area: "Chinatown",
    latitude: 1.28035,
    longitude: 103.84463,
    cuisines: ["Hainanese", "Singaporean"],
    priceLevel: 1,
    recommended: false,
  },
  {
    id: "jade-palace-seafood-restaurant",
    name: "Jade Palace Seafood Restaurant",
    type: "restaurant",
    area: "Orchard",
    latitude: 1.3061105,
    longitude: 103.8286985,
    cuisines: ["Cantonese", "Seafood"],
    priceLevel: 3,
    recommended: true,
  },
  {
    id: "jumbo-seafood-ion-orchard",
    name: "JUMBO Seafood ION Orchard",
    type: "restaurant",
    area: "Orchard",
    latitude: 1.3039479,
    longitude: 103.8319051,
    cuisines: ["Singaporean", "Seafood"],
    priceLevel: 3,
    recommended: false,
  },
  {
    id: "pierre-herme-paris-singapore",
    name: "Pierre Hermé Paris Singapore",
    type: "restaurant",
    area: "Sentosa",
    latitude: 1.2556955,
    longitude: 103.8202156,
    cuisines: ["French", "Patisserie"],
    priceLevel: 3,
    recommended: false,
  },
];

function normalizedPlaceName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

const manualPlaceNames = new Set(
  manuallyAddedFoodPlaces.map((place) => normalizedPlaceName(place.name)),
);

export const foodPlaces: FoodPlace[] = [
  ...manuallyAddedFoodPlaces,
  ...googleMapsFoodPlaces.filter(
    (place) => !manualPlaceNames.has(normalizedPlaceName(place.name)),
  ),
];
