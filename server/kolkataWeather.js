const DEFAULT_KOLKATA = {
  lat: 22.5726,
  lon: 88.3639,
  label: "Kolkata",
};

const AREA_COORDINATES = [
  { match: "new town", coords: { lat: 22.5867, lon: 88.4772, label: "New Town, Kolkata" } },
  { match: "salt lake", coords: { lat: 22.5806, lon: 88.4177, label: "Salt Lake, Kolkata" } },
  { match: "sector v", coords: { lat: 22.5735, lon: 88.4331, label: "Sector V, Kolkata" } },
  { match: "park street", coords: { lat: 22.5535, lon: 88.3526, label: "Park Street, Kolkata" } },
  { match: "ballygunge", coords: { lat: 22.528, lon: 88.3659, label: "Ballygunge, Kolkata" } },
  { match: "gariahat", coords: { lat: 22.5194, lon: 88.3654, label: "Gariahat, Kolkata" } },
  { match: "south kolkata", coords: { lat: 22.4989, lon: 88.3614, label: "South Kolkata" } },
  { match: "jadavpur", coords: { lat: 22.4955, lon: 88.3709, label: "Jadavpur, Kolkata" } },
  { match: "north kolkata", coords: { lat: 22.5958, lon: 88.3732, label: "North Kolkata" } },
  { match: "alipore", coords: { lat: 22.5335, lon: 88.3326, label: "Alipore, Kolkata" } },
  { match: "behala", coords: { lat: 22.4985, lon: 88.3106, label: "Behala, Kolkata" } },
  { match: "howrah", coords: { lat: 22.5958, lon: 88.2636, label: "Howrah, Kolkata" } },
  { match: "dum dum", coords: { lat: 22.622, lon: 88.4177, label: "Dum Dum, Kolkata" } },
];

function resolveKolkataCoords(area) {
  if (!area || !area.trim()) return DEFAULT_KOLKATA;
  const normalized = area.toLowerCase();
  const matched = AREA_COORDINATES.find((entry) => normalized.includes(entry.match));
  return matched ? matched.coords : DEFAULT_KOLKATA;
}

function describeWmoCode(code) {
  if (code === 0) return "Clear sky";
  if (code === 1) return "Mainly clear";
  if (code === 2) return "Partly cloudy";
  if (code === 3) return "Overcast";
  if (code === 45 || code === 48) return "Mist / hazy";
  if (code >= 51 && code <= 57) return "Light drizzle";
  if (code >= 61 && code <= 67) return "Rain";
  if (code >= 80 && code <= 82) return "Rain showers";
  if (code >= 95) return "Thunderstorm";
  return "Humid & cloudy";
}

function deriveClimatePreset({ temperatureC, feelsLikeC, humidityPercent, precipitationMm, weatherCode }) {
  const isRainyCode =
    (weatherCode >= 51 && weatherCode <= 67) ||
    (weatherCode >= 80 && weatherCode <= 82) ||
    weatherCode >= 95;

  if (precipitationMm > 0.1 || isRainyCode) {
    return "Rainy / damp";
  }
  if (feelsLikeC >= 30 || (temperatureC >= 28 && humidityPercent >= 65)) {
    return "Hot & humid";
  }
  if (feelsLikeC >= 25 || (temperatureC >= 24 && humidityPercent >= 70)) {
    return "Warm & sweaty";
  }
  return "Pleasant / dry";
}

function buildBeautyWeatherNote({ temperatureC, humidityPercent, preset }) {
  if (preset === "Rainy / damp") {
    return `Damp air at ${humidityPercent}% humidity—prioritize waterproof kajal/lip tints, gentle tissue blotting, and frizz control.`;
  }
  if (preset === "Hot & humid") {
    return `Warm ${temperatureC}°C with ${humidityPercent}% humidity—use thin breathable layers, oil-control blotting, and sweat-resistant hair pinning.`;
  }
  if (preset === "Warm & sweaty") {
    return `Muggy ${humidityPercent}% humidity—focus on T-zone shine control and lightweight setting rather than heavy powder.`;
  }
  if (humidityPercent >= 75) {
    return `Mild ${temperatureC}°C but high ${humidityPercent}% humidity—watch for hair flyaways and light T-zone shine.`;
  }
  return `Comfortable ${temperatureC}°C and ${humidityPercent}% humidity—great for soft hydration and effortless touch-ups.`;
}

const WEATHER_CACHE = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000;

export async function fetchKolkataWeather(area) {
  const coords = resolveKolkataCoords(area);
  const cacheKey = `${coords.lat.toFixed(3)},${coords.lon.toFixed(3)}`;
  const cached = WEATHER_CACHE.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(coords.lat));
  url.searchParams.set("longitude", String(coords.lon));
  url.searchParams.set(
    "current",
    "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,precipitation"
  );
  url.searchParams.set("timezone", "Asia/Kolkata");

  const response = await fetch(url.toString(), {
    signal: AbortSignal.timeout(5000),
  });

  if (!response.ok) {
    throw new Error(`Weather service responded with ${response.status}`);
  }

  const payload = await response.json();

  if (!payload.current || typeof payload.current.temperature_2m !== "number") {
    throw new Error("Incomplete weather data received.");
  }

  const temperatureC = Math.round(payload.current.temperature_2m * 10) / 10;
  const feelsLikeC = Math.round((payload.current.apparent_temperature ?? temperatureC) * 10) / 10;
  const humidityPercent = Math.round(payload.current.relative_humidity_2m ?? 70);
  const precipitationMm = Math.round((payload.current.precipitation ?? 0) * 10) / 10;
  const weatherCode = Number(payload.current.weather_code ?? 0);

  const conditionLabel = describeWmoCode(weatherCode);
  const climatePreset = deriveClimatePreset({
    temperatureC,
    feelsLikeC,
    humidityPercent,
    precipitationMm,
    weatherCode,
  });

  const data = {
    locationLabel: coords.label,
    temperatureC,
    feelsLikeC,
    humidityPercent,
    precipitationMm,
    weatherCode,
    conditionLabel,
    climatePreset,
    beautyWeatherNote: buildBeautyWeatherNote({
      temperatureC,
      humidityPercent,
      preset: climatePreset,
    }),
    fetchedAt: new Date().toISOString(),
    source: "open-meteo",
  };

  WEATHER_CACHE.set(cacheKey, {
    data,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });

  return data;
}
