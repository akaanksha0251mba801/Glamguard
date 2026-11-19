import { fetchKolkataWeather } from "../server/kolkataWeather";

interface ApiRequest {
  method?: string;
  query?: { area?: string | string[] };
}

interface ApiResponse {
  status: (code: number) => ApiResponse;
  json: (payload: unknown) => void;
  setHeader: (name: string, value: string) => void;
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed. Use GET." });
  }

  try {
    const rawArea = req.query?.area;
    const area = Array.isArray(rawArea) ? rawArea[0] : rawArea;
    const weather = await fetchKolkataWeather(area);
    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");
    return res.status(200).json({ weather });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not fetch Kolkata weather.";
    return res.status(502).json({ error: message });
  }
}
