import "dotenv/config";
import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { fetchKolkataWeather } from "./server/kolkataWeather.js";
import { generateRescuePlan, type RescuePlanRequestBody } from "./server/rescuePlanGenerator.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const port = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: "1mb" }));

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, service: "glamguard-api" });
  });

  app.get("/api/weather", async (req, res) => {
    try {
      const rawArea = req.query?.area;
      const area = typeof rawArea === "string" ? rawArea : undefined;
      const weather = await fetchKolkataWeather(area);
      res.json({ weather });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to fetch Kolkata weather.";
      console.error("Error fetching Kolkata weather:", error);
      res.status(502).json({ error: message });
    }
  });

  app.post("/api/rescue-plan", async (req, res) => {
    try {
      const body = req.body as RescuePlanRequestBody;
      if (!body || !body.occasion || !body.availableTime) {
        res.status(400).json({ error: "Please select an occasion and available time." });
        return;
      }
      const plan = await generateRescuePlan(body);
      res.json({ plan });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to generate Beauty Rescue Plan.";
      console.error("Error generating rescue plan:", error);
      res.status(500).json({ error: message });
    }
  });

  const isProd = process.env.NODE_ENV === "production";

  if (!isProd) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, "dist");
    app.use(express.static(distDir));
    app.get("*", (_req, res) => {
      const indexPath = path.join(distDir, "index.html");
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).send("Build output not found. Run npm run build first.");
      }
    });
  }

  app.listen(port, "0.0.0.0", () => {
    console.log(`GlamGuard server listening on http://localhost:${port}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start GlamGuard server:", err);
  process.exit(1);
});
