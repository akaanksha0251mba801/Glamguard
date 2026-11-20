import type { KolkataWeatherData } from "./kolkataWeather.js";

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

export declare function generateRescuePlan(input: RescuePlanRequestBody): Promise<GeneratedRescuePlan>;
