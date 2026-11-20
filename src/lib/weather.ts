import type { KolkataWeatherData } from "../types/glamguard";
import { parseJsonResponse } from "./apiClient";

export async function fetchKolkataLiveWeather(area?: string): Promise<KolkataWeatherData> {
  const params = new URLSearchParams();
  if (area && area.trim()) {
    params.set("area", area.trim());
  }
  const query = params.toString();
  const response = await fetch(`/api/weather${query ? `?${query}` : ""}`);
  const payload = await parseJsonResponse<{ weather?: KolkataWeatherData; error?: string }>(
    response,
    "Could not fetch live Kolkata weather."
  );
  if (!payload.weather) {
    throw new Error(payload.error || "Could not fetch live Kolkata weather.");
  }
  return payload.weather;
}
