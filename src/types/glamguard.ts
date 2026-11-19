export interface OwnedProduct {
  id: string;
  name: string;
  category: "Skincare" | "Makeup" | "Haircare" | "Tool / Other";
  notes?: string;
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  ageRange?: string;
  location?: string;
  skinType?: string;
  hairType?: string;
  makeupPreference?: string;
  beautyConcerns?: string[];
  budgetPreference?: string;
  existingProducts?: OwnedProduct[];
  productPreferences?: string;
  onboardingCompleted: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface RescuePlanSituation {
  environment: string;
  weather: string;
  awayFromHome: boolean;
  washroomAccess: boolean;
  hasProducts: boolean;
  productSource: "owned" | "affordable" | "both";
}

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
  professionalNote?: string;
}

export interface SavedRescuePlan {
  id: string;
  userId: string;
  title: string;
  occasion: string;
  concerns: string[];
  customConcern?: string;
  availableTime: string;
  availableMinutes: number;
  situation: RescuePlanSituation;
  generatedPlan: GeneratedRescuePlan;
  feedbackRating?: number | null;
  createdAt?: unknown;
}

export interface PlanFeedback {
  id?: string;
  userId: string;
  planId: string;
  usefulness: number;
  relevance: number;
  easeOfUse: number;
  timeFit: boolean;
  reuseIntent: string;
  writtenFeedback?: string;
  createdAt?: unknown;
}

export interface PricingResponse {
  id?: string;
  userId: string;
  proposedPrice: number;
  willingnessToPay: "yes" | "maybe" | "no";
  response?: string;
  createdAt?: unknown;
}

export const AGE_RANGES = ["18–21", "22–25", "26–30", "31–35", "36+"];

export const KOLKATA_AREAS = [
  "New Town",
  "Salt Lake / Sector V",
  "Park Street / Camac Street",
  "Ballygunge",
  "Gariahat",
  "South Kolkata (Jadavpur / Tollygunge)",
  "North Kolkata (Shyambazar / College Street)",
  "Alipore / New Alipore",
  "Behala",
  "Howrah",
  "Dum Dum / Lake Town",
  "Other Kolkata area",
];

export const SKIN_TYPES = ["Oily", "Dry", "Combination", "Normal", "Sensitive", "Not sure"];

export const HAIR_TYPES = [
  "Straight & fine",
  "Straight & thick",
  "Wavy & frizz-prone",
  "Curly / coily",
  "Oily scalp, dry ends",
  "Not sure",
];

export const MAKEUP_PREFERENCES = [
  "No makeup",
  "Minimal",
  "Natural",
  "Everyday",
  "Glam",
];

export const BUDGET_PREFERENCES = [
  { value: "Affordable", label: "Affordable (pocket-friendly staples)" },
  { value: "Moderate", label: "Moderate (everyday mid-range)" },
  { value: "Flexible", label: "Flexible (mix of essentials)" },
];

export const COMMON_OWNED_PRODUCTS: Array<{ name: string; category: OwnedProduct["category"] }> = [
  { name: "Moisturizer", category: "Skincare" },
  { name: "Sunscreen", category: "Skincare" },
  { name: "Face powder", category: "Makeup" },
  { name: "Compact", category: "Makeup" },
  { name: "Lipstick or lip tint", category: "Makeup" },
  { name: "Setting spray", category: "Makeup" },
  { name: "Hair serum", category: "Haircare" },
  { name: "Dry shampoo", category: "Haircare" },
  { name: "Kajal / eyeliner", category: "Makeup" },
  { name: "Blotting paper / tissues", category: "Skincare" },
];

export const OCCASION_OPTIONS = [
  "College or university day",
  "Office or workday",
  "Durga Puja",
  "Wedding or wedding function",
  "Party or night out",
  "Shopping or outdoor outing",
  "Casual day out",
  "Special event",
  "Other",
];

export const MAKEUP_CONCERNS = [
  "Makeup melting",
  "Foundation looking patchy",
  "Makeup becoming oily or shiny",
  "Lipstick fading",
  "Makeup looking dull",
  "Need for a quick touch-up",
];

export const SKIN_CONCERNS = [
  "Excessive oiliness",
  "Dryness",
  "Dull-looking skin",
  "Skin feeling sweaty",
  "Need for a quick freshening-up routine",
  "Other self-reported concern",
];

export const HAIR_CONCERNS = [
  "Frizzy hair",
  "Flat or lifeless hair",
  "Untidy hairstyle",
  "Excessive oiliness",
  "Hair losing its shape",
  "Other self-reported concern",
];

export const TIME_OPTIONS = [
  { label: "5 minutes", minutes: 5 },
  { label: "10 minutes", minutes: 10 },
  { label: "15 minutes", minutes: 15 },
  { label: "20 minutes", minutes: 20 },
  { label: "30 minutes", minutes: 30 },
  { label: "More than 30 minutes", minutes: 45 },
];

export interface QuickSituationPreset {
  id: string;
  title: string;
  subtitle: string;
  concerns: string[];
  occasion: string;
  timeLabel: string;
  minutes: number;
}

export const QUICK_SITUATIONS: QuickSituationPreset[] = [
  {
    id: "melting",
    title: "My makeup is melting",
    subtitle: "Reset patchy or sliding base without starting over",
    concerns: ["Makeup melting", "Foundation looking patchy"],
    occasion: "Shopping or outdoor outing",
    timeLabel: "10 minutes",
    minutes: 10,
  },
  {
    id: "oily",
    title: "My skin is looking oily",
    subtitle: "De-shine T-zone and restore a fresh matte balance",
    concerns: ["Excessive oiliness", "Makeup becoming oily or shiny"],
    occasion: "College or university day",
    timeLabel: "5 minutes",
    minutes: 5,
  },
  {
    id: "frizzy",
    title: "My hair is getting frizzy",
    subtitle: "Tame humidity flyaways and tidy your style fast",
    concerns: ["Frizzy hair", "Untidy hairstyle"],
    occasion: "Office or workday",
    timeLabel: "10 minutes",
    minutes: 10,
  },
  {
    id: "dull",
    title: "My skin looks dull or tired",
    subtitle: "Wake up fatigued skin after a long commute or shift",
    concerns: ["Dull-looking skin", "Skin feeling sweaty"],
    occasion: "Casual day out",
    timeLabel: "10 minutes",
    minutes: 10,
  },
  {
    id: "event",
    title: "I need a quick refresh before an event",
    subtitle: "Transition from day to evening lighting effortlessly",
    concerns: ["Need for a quick touch-up", "Makeup looking dull", "Lipstick fading"],
    occasion: "Special event",
    timeLabel: "15 minutes",
    minutes: 15,
  },
  {
    id: "short-time",
    title: "I have very little time to get ready",
    subtitle: "High-impact 5-minute routine that stays put",
    concerns: ["Need for a quick freshening-up routine", "Need for a quick touch-up"],
    occasion: "College or university day",
    timeLabel: "5 minutes",
    minutes: 5,
  },
];

export const EXTRA_KOLKATA_SCENARIOS: QuickSituationPreset[] = [
  {
    id: "durga-puja-pandal",
    title: "Pandal hopping in humid weather",
    subtitle: "Keep your base breathable and sweat-resistant across long outdoor walks",
    concerns: ["Makeup melting", "Skin feeling sweaty", "Frizzy hair"],
    occasion: "Durga Puja",
    timeLabel: "10 minutes",
    minutes: 10,
  },
  {
    id: "wedding-photos",
    title: "Wedding guest touch-up before photos",
    subtitle: "Revive faded lip tint, shine, and hair volume between functions",
    concerns: ["Lipstick fading", "Makeup becoming oily or shiny", "Hair losing its shape"],
    occasion: "Wedding or wedding function",
    timeLabel: "10 minutes",
    minutes: 10,
  },
  {
    id: "office-to-party",
    title: "Post-commute desk-to-dinner refresh",
    subtitle: "Lift tired skin and freshen kajal and lips after a full workday",
    concerns: ["Makeup looking dull", "Excessive oiliness", "Need for a quick touch-up"],
    occasion: "Party or night out",
    timeLabel: "15 minutes",
    minutes: 15,
  },
  {
    id: "monsoon-auto",
    title: "Humidity flyaways after a long commute",
    subtitle: "Smooth frizz and restyle damp hair ends with minimal tools",
    concerns: ["Frizzy hair", "Flat or lifeless hair", "Untidy hairstyle"],
    occasion: "College or university day",
    timeLabel: "5 minutes",
    minutes: 5,
  },
];

export const KOLKATA_CLIMATE_TIPS = [
  "In humid Kolkata afternoons, blot sweat gently with a clean tissue before pressing compact powder—rubbing powder over damp skin causes cakey streaks.",
  "Keep a tiny pocket hairbrush or wide-tooth comb and a pea-sized drop of serum for post-Metro or auto-rickshaw frizz resets.",
  "On long college or office days, cream lip-and-cheek tints double up fast without weighing down skin in warm weather.",
  "During Durga Puja pandal hopping, switch heavy full-coverage layers for spot concealing and waterproof kajal so your base breathes.",
];
