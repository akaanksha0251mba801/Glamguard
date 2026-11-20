interface ApiRequest {
  method?: string;
}

interface ApiResponse {
  status: (code: number) => ApiResponse;
  json: (payload: unknown) => void;
  setHeader?: (name: string, value: string) => void;
}

export default function handler(_req: ApiRequest, res: ApiResponse) {
  res.setHeader?.("Content-Type", "application/json; charset=utf-8");
  return res.status(200).json({ ok: true, service: "glamguard-api" });
}
