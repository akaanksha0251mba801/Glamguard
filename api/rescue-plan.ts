import { generateRescuePlan, type RescuePlanRequestBody } from "../server/rescuePlanGenerator.js";

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
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  let body: RescuePlanRequestBody | null = null;
  try {
    body = (typeof req.body === "string" ? JSON.parse(req.body) : req.body) as RescuePlanRequestBody;
  } catch {
    return res.status(400).json({ error: "Invalid JSON request body." });
  }

  if (!body || !body.occasion || !body.availableTime) {
    return res.status(400).json({ error: "Please select an occasion and available time." });
  }

  try {
    const plan = await generateRescuePlan(body);
    return res.status(200).json({ plan });
  } catch (error) {
    console.error("[api/rescue-plan] Generation failed:", error);
    const message = error instanceof Error ? error.message : "Failed to generate Beauty Rescue Plan.";
    return res.status(500).json({ error: message });
  }
}
