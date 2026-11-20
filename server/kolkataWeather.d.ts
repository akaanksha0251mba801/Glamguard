export interface KolkataWeatherData {
  locationLabel: string;
  temperatureC: number;
  feelsLikeC: number;
  humidityPercent: number;
  precipitationMm: number;
  weatherCode: number;
  conditionLabel: string;
  climatePreset: "Hot & humid" | "Warm & sweaty" | "Rainy / damp" | "Pleasant / dry";
  beautyWeatherNote: string;
  fetchedAt: string;
  source: "open-meteo";
}

export declare function fetchKolkataWeather(area?: string): Promise<KolkataWeatherData>;
