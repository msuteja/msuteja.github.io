import { useEffect, useState } from "react";

const WEATHER_URL =
  "https://api.open-meteo.com/v1/forecast?latitude=1.3521&longitude=103.8198&current=temperature_2m,weather_code,cloud_cover,precipitation,is_day&timezone=Asia%2FSingapore&forecast_days=1";

type WeatherResponse = {
  current?: {
    temperature_2m?: number;
    weather_code?: number;
    cloud_cover?: number;
    precipitation?: number;
    is_day?: number;
  };
};

type CurrentWeather = NonNullable<WeatherResponse["current"]>;

function describeWeather({
  weather_code: code,
  cloud_cover: cloudCover,
  precipitation,
  is_day: isDay,
}: CurrentWeather) {
  if (code === undefined || cloudCover === undefined) {
    return "current conditions";
  }

  if (code === 45 || code === 48) return "foggy";
  if (code >= 71 && code <= 77) return "snow";
  if (code >= 85 && code <= 86) return "snow showers";
  if (code >= 95 && code <= 99) return "thunderstorms";

  // A trace amount from the preceding hour can otherwise make an already
  // sunny period read as drizzle. Only describe rain when it is measurable.
  if ((precipitation ?? 0) > 0.1) {
    if (code >= 51 && code <= 57) return "drizzle";
    if (code >= 80 && code <= 82) return "showers";
    if (code >= 61 && code <= 67) return "rain";
  }

  if (cloudCover <= 20) return isDay === 0 ? "clear" : "sunny";
  if (cloudCover <= 50) return isDay === 0 ? "mostly clear" : "mostly sunny";
  if (cloudCover <= 80) return "partly cloudy";
  return "cloudy";
}

function singaporeTime() {
  return new Intl.DateTimeFormat("en-SG", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "Asia/Singapore",
    timeZoneName: "short",
  }).format(new Date());
}

export function LocationStatus() {
  const [time, setTime] = useState(singaporeTime);
  const [weather, setWeather] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setInterval(() => setTime(singaporeTime()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function updateWeather() {
      try {
        const response = await fetch(WEATHER_URL, {
          signal: controller.signal,
          cache: "no-store",
        });
        if (!response.ok) throw new Error("Weather request failed");

        const data = (await response.json()) as WeatherResponse;
        const temperature = data.current?.temperature_2m;
        const current = data.current;

        if (
          temperature === undefined ||
          current?.weather_code === undefined ||
          current.cloud_cover === undefined
        ) {
          throw new Error("Weather response was incomplete");
        }

        setWeather(`${Math.round(temperature)}°C, ${describeWeather(current)}`);
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setWeather("weather unavailable");
        }
      }
    }

    void updateWeather();
    const timer = window.setInterval(updateWeather, 15 * 60 * 1000);

    return () => {
      controller.abort();
      window.clearInterval(timer);
    };
  }, []);

  return (
    <p className="location-status" aria-live="polite">
      <time>{time}</time>
      <span aria-hidden="true"> · </span>
      <span title="Weather data by Open-Meteo">
        {weather ?? "checking weather…"}
      </span>
    </p>
  );
}
