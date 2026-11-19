import { generateRescuePlan, type RescuePlanRequestBody } from "../server/rescuePlanGenerator";

interface ApiRequest {
  method?: string;
  body?: unknown;
}

interface ApiResponse {
  status: (code: number) => ApiResponse;
  json: (payload: unknown) => void;
  setHeader: (name: string, value: string) => void;
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  try {
    const body = (typeof req.body === "string" ? JSON.parse(req.body) : req.body) as RescuePlanRequestBody;
    if (!body || !body.occasion || !body.availableTime) {
      return res.status(400).json({ error: "Please select an occasion and available time." });
    }
    const plan = await generateRescuePlan(body);
    return res.status(200).json({ plan });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to generate Beauty Rescue Plan.";
    return res.status(500).json({ error: message });
  }
}
