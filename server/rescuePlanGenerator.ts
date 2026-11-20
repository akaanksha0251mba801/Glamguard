import fs from "fs";
import path from "path";
import { GoogleGenAI, ThinkingLevel, Type } from "@google/genai";
import { fetchKolkataWeather, type KolkataWeatherData } from "./kolkataWeather.js";

function loadVentureContextSnippet(): string {
  try {
    const jsonPath = path.resolve(
      process.cwd(),
      "public/assets/aistudio/Glamguard_Backup_2026-09-30__1__168837fc.json"
    );
    if (!fs.existsSync(jsonPath)) return "";
    const parsed = JSON.parse(fs.readFileSync(jsonPath, "utf-8")) as {
      venture?: {
        mission0?: { geography?: string; initialCustomer?: string };
        mission2?: { primaryJTBD?: { desiredOutcome?: string } };
      };
    };
    const geo = parsed.venture?.mission0?.geography || "";
    const audience = parsed.venture?.mission0?.initialCustomer || "";
    const outcome = parsed.venture?.mission2?.primaryJTBD?.desiredOutcome || "";
    return `\nVENTURE CONTEXT:\n- Priority Kolkata hubs: ${geo}\n- Core audience: ${audience}\n- Desired outcome: ${outcome}`;
  } catch {
    return "";
  }
}

const VENTURE_CONTEXT = loadVentureContextSnippet();

export interface RescuePlanRequestBody {
  occasion: string;
  concerns: string[];
  customConcern?: string;
  availableTime: string;
  availableMinutes: number;
  situation: {
    environment: string;
    weather: string;
    awayFromHome: boolean;
    washroomAccess: boolean;
    hasProducts: boolean;
    productSource: "owned" | "affordable" | "both";
  };
  liveWeather?: KolkataWeatherData | null;
  profile?: {
    name?: string;
    ageRange?: string;
    location?: string;
    skinType?: string;
    hairType?: string;
    makeupPreference?: string;
    budgetPreference?: string;
    productPreferences?: string;
    existingProducts?: Array<{
      id: string;
      name: string;
      category: string;
      notes?: string;
    }>;
  };
}

export interface GeneratedRescuePlan {
  situationSummary: string;
  steps: Array<{
    stepNumber: number;
    title: string;
    whatToDo: string;
    howToDoIt: string;
    productUsed: string;
    timeMinutes: number;
    whyItHelps: string;
  }>;
  quickFixes: Array<{
    title: string;
    instruction: string;
    productUsed: string;
    timeMinutes: number;
  }>;
  productsThatMayHelp: Array<{
    productType: string;
    whyItHelps: string;
    affordabilityNote: string;
    ownershipStatus: "Already owned" | "Optional affordable addition";
  }>;
  whatToAvoid: string[];
  timeBreakdown: {
    totalMinutes: number;
    fitsWithinLimit: boolean;
    summary: string;
    perStep: Array<{
      stepTitle: string;
      minutes: number;
    }>;
  };
  finalTip: string;
  professionalNote: string;
}

const SYSTEM_INSTRUCTION = `You are GlamGuard, a practical, warm, and knowledgeable everyday beauty assistant designed specifically for young women aged 18–30 in Kolkata (college students, young working women, and commuters).

CORE PRINCIPLES:
1. Respect the user's exact time budget. The sum of all step timeMinutes in "steps" MUST NEVER exceed availableMinutes. If availableMinutes is 5, design a tight, realistic 4–5 minute rescue plan.
2. Prioritize products the user already owns (listed in existingProducts). Only mark a product as "Already owned" if it actually appears in the user's existingProducts list. Never assume they own something they did not list.
3. Keep any suggested new products practical, accessible in Indian local stores/pharmacies/everyday beauty counters, and aligned with the user's budgetPreference. Do NOT invent exact product prices or fabricate brand pricing claims — use honest affordability categories such as "Budget-friendly everyday staple", "Pocket-friendly pharmacy option", or "Optional mid-range upgrade". Do NOT turn the output into a shopping catalogue.
4. Tailor advice directly to the user's stated occasion, current situation (indoors/outdoors, weather/humidity, away from home, washroom/mirror access, whether they have products on hand), live Kolkata temperature & relative humidity readings when available, Kolkata area/commute realities, and makeup/skin/hair preferences. For example, high humidity (>70%) or damp/rainy readings require anti-frizz control, gentle tissue blotting instead of heavy powdering over sweat, and water-resistant eye/lip choices; high heat requires lightweight breathable resets.
5. Never make medical claims or diagnose skin/scalp conditions. Never recommend unsafe DIY home remedies (like lemon juice, baking soda, or toothpaste on skin). Include a brief, supportive reminder to consult a qualified dermatologist for persistent or serious skin/scalp concerns.
6. Write concise, clear, step-by-step instructions that someone can actually follow in a college washroom, office desk, cab, or before stepping out.${VENTURE_CONTEXT}`;

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    situationSummary: {
      type: Type.STRING,
      description: "2-3 sentence summary reflecting the user's exact concern, occasion, environment, and time limit.",
    },
    steps: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          stepNumber: { type: Type.INTEGER },
          title: { type: Type.STRING },
          whatToDo: { type: Type.STRING },
          howToDoIt: { type: Type.STRING },
          productUsed: {
            type: Type.STRING,
            description: "Exact owned product name, basic item like clean tissue/water, or optional product type.",
          },
          timeMinutes: { type: Type.NUMBER },
          whyItHelps: { type: Type.STRING },
        },
        required: ["stepNumber", "title", "whatToDo", "howToDoIt", "productUsed", "timeMinutes", "whyItHelps"],
      },
    },
    quickFixes: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          instruction: { type: Type.STRING },
          productUsed: { type: Type.STRING },
          timeMinutes: { type: Type.NUMBER },
        },
        required: ["title", "instruction", "productUsed", "timeMinutes"],
      },
    },
    productsThatMayHelp: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          productType: { type: Type.STRING },
          whyItHelps: { type: Type.STRING },
          affordabilityNote: { type: Type.STRING },
          ownershipStatus: {
            type: Type.STRING,
            enum: ["Already owned", "Optional affordable addition"],
          },
        },
        required: ["productType", "whyItHelps", "affordabilityNote", "ownershipStatus"],
      },
    },
    whatToAvoid: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    timeBreakdown: {
      type: Type.OBJECT,
      properties: {
        totalMinutes: { type: Type.NUMBER },
        fitsWithinLimit: { type: Type.BOOLEAN },
        summary: { type: Type.STRING },
        perStep: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              stepTitle: { type: Type.STRING },
              minutes: { type: Type.NUMBER },
            },
            required: ["stepTitle", "minutes"],
          },
        },
      },
      required: ["totalMinutes", "fitsWithinLimit", "summary", "perStep"],
    },
    finalTip: {
      type: Type.STRING,
      description: "One practical closing tip tailored to the occasion and Kolkata conditions.",
    },
    professionalNote: {
      type: Type.STRING,
      description: "Brief non-diagnostic disclaimer advising professional dermatological care for persistent skin or scalp concerns.",
    },
  },
  required: [
    "situationSummary",
    "steps",
    "quickFixes",
    "productsThatMayHelp",
    "whatToAvoid",
    "timeBreakdown",
    "finalTip",
    "professionalNote",
  ],
};

function enforceTimeBudget(plan: GeneratedRescuePlan, availableMinutes: number): GeneratedRescuePlan {
  const safeLimit = Math.max(1, Math.min(120, Number(availableMinutes) || 10));
  const steps = Array.isArray(plan.steps) ? plan.steps.slice(0, 12) : [];

  let rawTotal = steps.reduce((sum, step) => sum + Math.max(0.5, Number(step.timeMinutes) || 1), 0);

  const normalizedSteps = steps.map((step, index) => {
    const rawStepMin = Math.max(0.5, Number(step.timeMinutes) || 1);
    const scaled =
      rawTotal > safeLimit
        ? Math.max(0.5, Math.round(((rawStepMin / rawTotal) * safeLimit) * 2) / 2)
        : Math.round(rawStepMin * 2) / 2;
    return {
      ...step,
      stepNumber: index + 1,
      timeMinutes: scaled,
    };
  });

  // Final guard in case rounding pushed total slightly over safeLimit
  let finalTotal = normalizedSteps.reduce((sum, s) => sum + s.timeMinutes, 0);
  if (finalTotal > safeLimit && normalizedSteps.length > 0) {
    const ratio = safeLimit / finalTotal;
    for (let i = 0; i < normalizedSteps.length; i++) {
      normalizedSteps[i].timeMinutes = Math.max(0.5, Math.floor(normalizedSteps[i].timeMinutes * ratio * 2) / 2);
    }
    finalTotal = normalizedSteps.reduce((sum, s) => sum + s.timeMinutes, 0);
  }

  const roundedTotal = Math.round(finalTotal * 10) / 10;

  return {
    ...plan,
    steps: normalizedSteps,
    timeBreakdown: {
      totalMinutes: roundedTotal,
      fitsWithinLimit: roundedTotal <= safeLimit,
      summary: `Fits comfortably within your ${safeLimit}-minute window (${roundedTotal} min total).`,
      perStep: normalizedSteps.map((s) => ({
        stepTitle: s.title,
        minutes: s.timeMinutes,
      })),
    },
  };
}

export async function generateRescuePlan(input: RescuePlanRequestBody): Promise<GeneratedRescuePlan> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    throw new Error("GEMINI_API_KEY is not configured on the server.");
  }

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });

  const ownedList =
    input.profile?.existingProducts && input.profile.existingProducts.length > 0
      ? input.profile.existingProducts
          .map((p) => `- ${p.name} (${p.category}${p.notes ? `, note: ${p.notes}` : ""})`)
          .join("\n")
      : "None listed";

  let liveWeather: KolkataWeatherData | null = input.liveWeather ?? null;
  if (!liveWeather) {
    try {
      liveWeather = await fetchKolkataWeather(input.profile?.location);
    } catch {
      liveWeather = null;
    }
  }

  const liveWeatherSection = liveWeather
    ? `\nLIVE KOLKATA WEATHER (${liveWeather.locationLabel}):
- Current temperature: ${liveWeather.temperatureC}°C (feels like ${liveWeather.feelsLikeC}°C)
- Relative humidity: ${liveWeather.humidityPercent}%
- Current sky / precipitation: ${liveWeather.conditionLabel}${liveWeather.precipitationMm > 0 ? ` (${liveWeather.precipitationMm} mm precipitation)` : ""}
- Climate takeaway: ${liveWeather.beautyWeatherNote}`
    : "";

  const concerns = Array.isArray(input.concerns) ? input.concerns : [];
  const situation = input.situation ?? {
    environment: "Not specified",
    weather: "Hot & humid",
    awayFromHome: false,
    washroomAccess: true,
    hasProducts: true,
    productSource: "both" as const,
  };

  const prompt = `Create a personalized Beauty Rescue Plan for this exact user request:

OCCASION: ${input.occasion}
SELECTED BEAUTY CONCERNS: ${concerns.length > 0 ? concerns.join(", ") : "General refresh"}
CUSTOM CONCERN DETAILS: ${input.customConcern?.trim() || "None specified"}
STRICT TIME LIMIT: ${input.availableTime} (Maximum ${input.availableMinutes} minutes total — NEVER exceed ${input.availableMinutes} minutes)

CURRENT SITUATION:
- Environment: ${situation.environment || "Not specified"}
- Weather / climate felt right now: ${situation.weather || "Not specified"}
- Away from home: ${situation.awayFromHome ? "Yes" : "No"}
- Washroom or mirror access: ${situation.washroomAccess ? "Yes" : "No (hands-free / minimal-mirror friendly steps needed)"}
- Has beauty products with them right now: ${situation.hasProducts ? "Yes" : "No (focus on zero-product / basic tissue-and-water techniques)"}
- Recommendation preference: ${
    situation.productSource === "owned"
      ? "Prioritize ONLY products the user already owns"
      : situation.productSource === "affordable"
        ? "Suggest affordable accessible product types they could consider"
        : "Combine products the user already owns with optional affordable additions if helpful"
  }${liveWeatherSection}

USER BEAUTY PROFILE (self-reported preferences, not medical):
- First name / name: ${input.profile?.name || "Friend"}
- Age range: ${input.profile?.ageRange || "18-30"}
- Area in Kolkata: ${input.profile?.location || "Kolkata"}
- Skin type: ${input.profile?.skinType || "Not specified"}
- Hair type / texture: ${input.profile?.hairType || "Not specified"}
- Makeup preference: ${input.profile?.makeupPreference || "Not specified"}
- Budget preference: ${input.profile?.budgetPreference || "Affordable"}
- Product preferences / sensitivities: ${input.profile?.productPreferences || "None disclosed"}

PRODUCTS ALREADY OWNED BY USER:
${ownedList}

Remember:
- Strictly keep total step minutes <= ${input.availableMinutes} minutes.
- If washroomAccess is false or hasProducts is false, ensure every step is genuinely doable in that exact situation.
- Distinguish clearly between "Already owned" and "Optional affordable addition" in productsThatMayHelp.
- Keep steps practical, specific, and tailored to Kolkata life.`;

  let responseText: string | undefined;
  let lastError: unknown;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-4-hydrogen",
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          responseSchema: RESPONSE_SCHEMA,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        },
      });
      responseText = response.text?.trim();
      if (responseText) break;
    } catch (err) {
      lastError = err;
      const msg = err instanceof Error ? err.message : String(err);
      const isTransient = msg.includes("503") || msg.includes("UNAVAILABLE") || msg.includes("429");
      if (!isTransient || attempt === 2) {
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 900 * (attempt + 1)));
    }
  }

  if (!responseText) {
    const rawMsg = lastError instanceof Error ? lastError.message : String(lastError || "");
    console.error("[rescuePlanGenerator] Gemini generation failed:", rawMsg);
    if (rawMsg.includes("API_KEY_INVALID") || rawMsg.includes("API key not valid")) {
      throw new Error(
        "The configured Gemini API key was rejected. Please verify GEMINI_API_KEY in your server environment."
      );
    }
    if (rawMsg.includes("PERMISSION_DENIED")) {
      throw new Error(
        "Gemini API access was denied for the configured key. Please verify GEMINI_API_KEY permissions."
      );
    }
    if (rawMsg.includes("NOT_FOUND")) {
      throw new Error("The requested Gemini model is currently unavailable for this API key.");
    }
    if (rawMsg.includes("503") || rawMsg.includes("UNAVAILABLE")) {
      throw new Error("Our beauty assistant is momentarily busy. Please tap Retry in a few seconds.");
    }
    if (rawMsg.includes("429") || rawMsg.includes("RESOURCE_EXHAUSTED")) {
      throw new Error("AI request quota reached right now. Please try again shortly.");
    }
    throw new Error("Could not generate your Beauty Rescue Plan right now. Please retry.");
  }

  let parsed: GeneratedRescuePlan;
  try {
    parsed = JSON.parse(responseText) as GeneratedRescuePlan;
  } catch {
    throw new Error("Could not parse the generated Beauty Rescue Plan. Please retry.");
  }

  return enforceTimeBudget(parsed, input.availableMinutes);
}
