import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  Droplets,
  Plus,
  RefreshCw,
  Sparkles,
  Thermometer,
  X,
} from "lucide-react";
import { AppShell } from "../components/AppShell";
import { RescuePlanResultView } from "../components/RescuePlanResultView";
import { useAuth } from "../contexts/AuthContext";
import { rateUserPlan, saveRescuePlan } from "../lib/firebase";
import { fetchKolkataLiveWeather } from "../lib/weather";
import {
  HAIR_CONCERNS,
  MAKEUP_CONCERNS,
  MAKEUP_PREFERENCES,
  OCCASION_OPTIONS,
  SKIN_CONCERNS,
  SKIN_TYPES,
  TIME_OPTIONS,
  type GeneratedRescuePlan,
  type KolkataWeatherData,
  type OwnedProduct,
  type QuickSituationPreset,
  type RescuePlanSituation,
} from "../types/glamguard";

export function RescuePlanPage() {
  const { user, profile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const preset = (location.state as { preset?: QuickSituationPreset } | null)?.preset;

  // Step A: Occasion
  const [occasion, setOccasion] = useState(preset?.occasion || "College or university day");
  const [customOccasion, setCustomOccasion] = useState("");

  // Step B: Beauty Concerns
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>(preset?.concerns || []);
  const [customConcern, setCustomConcern] = useState("");

  // Step C: Available Time
  const [availableTime, setAvailableTime] = useState(preset?.timeLabel || "10 minutes");
  const [availableMinutes, setAvailableMinutes] = useState(preset?.minutes || 10);

  // Step D: Current Situation + Live Kolkata Weather
  const [environment, setEnvironment] = useState("Outdoors");
  const [weather, setWeather] = useState("Hot & humid");
  const [weatherTouched, setWeatherTouched] = useState(false);
  const [liveWeather, setLiveWeather] = useState<KolkataWeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [weatherError, setWeatherError] = useState("");
  const [awayFromHome, setAwayFromHome] = useState(true);
  const [washroomAccess, setWashroomAccess] = useState(true);
  const [hasProducts, setHasProducts] = useState(true);

  // Step E: Product Availability + Prefilled Profile Overrides for this plan
  const [productSource, setProductSource] = useState<"owned" | "affordable" | "both">("both");
  const [planSkinType, setPlanSkinType] = useState("");
  const [planMakeupPref, setPlanMakeupPref] = useState("");
  const [planProducts, setPlanProducts] = useState<OwnedProduct[]>([]);
  const [newProductText, setNewProductText] = useState("");
  const [profileSynced, setProfileSynced] = useState(false);

  // Generation & Result State
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedRescuePlan | null>(null);
  const [savedPlanId, setSavedPlanId] = useState<string | null>(null);
  const [savingPlan, setSavingPlan] = useState(false);

  useEffect(() => {
    if (profile && !profileSynced) {
      setPlanSkinType(profile.skinType || "");
      setPlanMakeupPref(profile.makeupPreference || "");
      setPlanProducts(profile.existingProducts || []);
      setProfileSynced(true);
    }
  }, [profile, profileSynced]);

  const loadLiveWeather = async (area?: string, forcePresetSync = false) => {
    setWeatherLoading(true);
    setWeatherError("");
    try {
      const data = await fetchKolkataLiveWeather(area);
      setLiveWeather(data);
      if (forcePresetSync || !weatherTouched) {
        setWeather(data.climatePreset);
      }
    } catch {
      setWeatherError("Live weather unavailable—select how it feels manually below.");
    } finally {
      setWeatherLoading(false);
    }
  };

  useEffect(() => {
    void loadLiveWeather(profile?.location);
  }, [profile?.location]);

  const effectiveOccasion =
    occasion === "Other" ? customOccasion.trim() || "Everyday outing" : occasion;

  const toggleConcern = (c: string) => {
    setSelectedConcerns((prev) =>
      prev.includes(c) ? prev.filter((item) => item !== c) : [...prev, c].slice(0, 20)
    );
  };

  const addQuickProduct = () => {
    if (!newProductText.trim()) return;
    setPlanProducts((prev) => [
      ...prev,
      {
        id: `temp_${Date.now()}`,
        name: newProductText.trim(),
        category: "Makeup",
      },
    ]);
    setNewProductText("");
  };

  const removePlanProduct = (id: string) => {
    setPlanProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const buildPlanTitle = () => {
    const leadConcern =
      selectedConcerns[0] || customConcern.trim().slice(0, 48) || "Quick Beauty Rescue";
    return `${leadConcern} · ${effectiveOccasion}`;
  };

  const formattedSituationWeather = liveWeather
    ? `${weather} (${liveWeather.temperatureC}°C, ${liveWeather.humidityPercent}% RH)`.slice(0, 60)
    : weather.slice(0, 60);

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError("");

    if (selectedConcerns.length === 0 && !customConcern.trim()) {
      setError("Please choose at least one beauty concern or describe what you need help with.");
      return;
    }

    setGenerating(true);
    setSavedPlanId(null);

    const situationPayload: RescuePlanSituation = {
      environment,
      weather: formattedSituationWeather,
      awayFromHome,
      washroomAccess,
      hasProducts,
      productSource,
    };

    try {
      const response = await fetch("/api/rescue-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          occasion: effectiveOccasion,
          concerns: selectedConcerns,
          customConcern: customConcern.trim(),
          availableTime,
          availableMinutes,
          situation: situationPayload,
          liveWeather,
          profile: {
            name: profile?.name || user?.displayName || "",
            ageRange: profile?.ageRange || "",
            location: profile?.location || "Kolkata",
            skinType: planSkinType,
            hairType: profile?.hairType || "",
            makeupPreference: planMakeupPref,
            budgetPreference: profile?.budgetPreference || "Affordable",
            productPreferences: profile?.productPreferences || "",
            existingProducts: hasProducts ? planProducts : [],
          },
        }),
      });

      const data = (await response.json()) as { plan?: GeneratedRescuePlan; error?: string };
      if (!response.ok || !data.plan) {
        throw new Error(data.error || "Could not generate your Beauty Rescue Plan.");
      }
      setGeneratedPlan(data.plan);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something interrupted the request. Please try again."
      );
    } finally {
      setGenerating(false);
    }
  };

  const handleSavePlan = async () => {
    if (!user || !generatedPlan || savedPlanId) return;
    setSavingPlan(true);
    setError("");
    try {
      const newId = await saveRescuePlan(user.uid, {
        title: buildPlanTitle(),
        occasion: effectiveOccasion,
        concerns: selectedConcerns,
        customConcern: customConcern.trim(),
        availableTime,
        availableMinutes,
        situation: {
          environment,
          weather: formattedSituationWeather,
          awayFromHome,
          washroomAccess,
          hasProducts,
          productSource,
        },
        generatedPlan,
        feedbackRating: null,
      });
      setSavedPlanId(newId);
    } catch {
      setError("Could not save this plan to your account. Please try again.");
    } finally {
      setSavingPlan(false);
    }
  };

  const handleRatePlan = async (stars: number) => {
    if (!user || !savedPlanId) return;
    await rateUserPlan(user.uid, savedPlanId, stars);
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        {generating ? (
          <div className="bg-white border border-[#E8DFE6] rounded-2xl p-10 sm:p-14 text-center space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-[#E84D79]/10 flex items-center justify-center mx-auto">
              <Sparkles className="w-7 h-7 text-[#E84D79] animate-pulse" aria-hidden="true" />
            </div>
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-semibold text-[#38243E] mb-2">
                Crafting your {availableTime} rescue plan...
              </h1>
              <p className="text-sm text-[#6B5570] max-w-md mx-auto leading-relaxed">
                Tailoring practical steps for <strong className="text-[#38243E]">{effectiveOccasion}</strong>{" "}
                {liveWeather
                  ? `for ${liveWeather.temperatureC}°C & ${liveWeather.humidityPercent}% humidity in ${liveWeather.locationLabel}`
                  : "using your preferences and what you have on hand"}
                .
              </p>
            </div>
          </div>
        ) : generatedPlan ? (
          <RescuePlanResultView
            title={buildPlanTitle()}
            occasion={effectiveOccasion}
            concerns={selectedConcerns}
            availableTime={availableTime}
            availableMinutes={availableMinutes}
            situation={{
              environment,
              weather: formattedSituationWeather,
              awayFromHome,
              washroomAccess,
              hasProducts,
              productSource,
            }}
            plan={generatedPlan}
            savedPlanId={savedPlanId}
            saving={savingPlan}
            onSavePlan={handleSavePlan}
            onRatePlan={handleRatePlan}
            onGenerateAnother={() => {
              setGeneratedPlan(null);
              setSavedPlanId(null);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            onReturnDashboard={() => navigate("/dashboard")}
            defaultLocation={profile?.location || ""}
          />
        ) : (
          <form onSubmit={handleGenerate} className="space-y-8">
            <div>
              <p className="text-xs font-medium text-[#E84D79] mb-1.5">
                Personalized Beauty Rescue Plan
              </p>
              <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#38243E] text-balance mb-2">
                What do we need to rescue right now?
              </h1>
              <p className="text-sm sm:text-base text-[#6B5570]">
                Answer a few quick questions—your routine will strictly fit your available time.
              </p>
            </div>

            {error && (
              <div
                role="alert"
                className="p-4 rounded-xl bg-[#E84D79]/10 border border-[#E84D79]/30 flex items-start justify-between gap-3 text-sm text-[#38243E]"
              >
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-[#E84D79] shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleGenerate()}
                  className="text-xs font-semibold text-[#E84D79] hover:underline shrink-0 cursor-pointer"
                >
                  Retry
                </button>
              </div>
            )}

            {/* STEP A: Occasion */}
            <section className="bg-white border border-[#E8DFE6] rounded-2xl p-6 sm:p-7 space-y-4">
              <div className="flex items-baseline justify-between gap-2">
                <h2 className="font-display text-xl font-semibold text-[#38243E]">
                  A. Select the occasion
                </h2>
                <span className="text-xs text-[#6B5570]">Required</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {OCCASION_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setOccasion(opt)}
                    className={`py-2.5 px-3.5 rounded-xl border text-xs sm:text-sm font-medium text-left transition-colors cursor-pointer ${
                      occasion === opt
                        ? "border-[#E84D79] bg-[#E84D79]/10 text-[#38243E] font-semibold"
                        : "border-[#E8DFE6] text-[#6B5570] hover:border-[#38243E]/40"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>

              {occasion === "Other" && (
                <div>
                  <label
                    htmlFor="custom-occasion"
                    className="block text-xs font-semibold text-[#38243E] mb-1.5"
                  >
                    Describe your occasion
                  </label>
                  <input
                    id="custom-occasion"
                    type="text"
                    maxLength={120}
                    value={customOccasion}
                    onChange={(e) => setCustomOccasion(e.target.value)}
                    placeholder="e.g., College fest stage performance, family dinner"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DFE6] text-sm text-[#38243E] focus:border-[#E84D79] focus:outline-none"
                  />
                </div>
              )}
            </section>

            {/* STEP B: Beauty Concerns */}
            <section className="bg-white border border-[#E8DFE6] rounded-2xl p-6 sm:p-7 space-y-5">
              <div className="flex items-baseline justify-between gap-2">
                <h2 className="font-display text-xl font-semibold text-[#38243E]">
                  B. Select your beauty concern(s)
                </h2>
                <span className="text-xs text-[#6B5570]">Pick one or more</span>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold text-[#6B5570] mb-2">Makeup concerns</p>
                  <div className="flex flex-wrap gap-2">
                    {MAKEUP_CONCERNS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => toggleConcern(c)}
                        className={`py-2 px-3.5 rounded-xl border text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                          selectedConcerns.includes(c)
                            ? "border-[#E84D79] bg-[#E84D79]/10 text-[#38243E] font-semibold"
                            : "border-[#E8DFE6] text-[#6B5570] hover:border-[#38243E]/40"
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-[#6B5570] mb-2">Skin concerns</p>
                  <div className="flex flex-wrap gap-2">
                    {SKIN_CONCERNS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => toggleConcern(c)}
                        className={`py-2 px-3.5 rounded-xl border text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                          selectedConcerns.includes(c)
                            ? "border-[#E84D79] bg-[#E84D79]/10 text-[#38243E] font-semibold"
                            : "border-[#E8DFE6] text-[#6B5570] hover:border-[#38243E]/40"
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-[#6B5570] mb-2">Hair concerns</p>
                  <div className="flex flex-wrap gap-2">
                    {HAIR_CONCERNS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => toggleConcern(c)}
                        className={`py-2 px-3.5 rounded-xl border text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                          selectedConcerns.includes(c)
                            ? "border-[#E84D79] bg-[#E84D79]/10 text-[#38243E] font-semibold"
                            : "border-[#E8DFE6] text-[#6B5570] hover:border-[#38243E]/40"
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label
                  htmlFor="custom-concern"
                  className="block text-xs font-semibold text-[#38243E] mb-1.5"
                >
                  Anything specific happening? (Optional)
                </label>
                <textarea
                  id="custom-concern"
                  rows={2}
                  maxLength={400}
                  value={customConcern}
                  onChange={(e) => setCustomConcern(e.target.value)}
                  placeholder="e.g., Concealer creased under my eyes after a 40-min metro ride and my bangs look flat."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DFE6] text-sm text-[#38243E] focus:border-[#E84D79] focus:outline-none"
                />
              </div>
            </section>

            {/* STEP C: Available Time */}
            <section className="bg-white border border-[#E8DFE6] rounded-2xl p-6 sm:p-7 space-y-4">
              <div className="flex items-baseline justify-between gap-2">
                <h2 className="font-display text-xl font-semibold text-[#38243E]">
                  C. Available time
                </h2>
                <span className="text-xs text-[#E84D79] font-medium">Strictly respected</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {TIME_OPTIONS.map((t) => (
                  <button
                    key={t.label}
                    type="button"
                    onClick={() => {
                      setAvailableTime(t.label);
                      setAvailableMinutes(t.minutes);
                    }}
                    className={`py-2.5 px-3.5 rounded-xl border text-xs sm:text-sm font-medium tabular-nums transition-colors cursor-pointer ${
                      availableTime === t.label
                        ? "border-[#E84D79] bg-[#E84D79]/10 text-[#38243E] font-semibold"
                        : "border-[#E8DFE6] text-[#6B5570] hover:border-[#38243E]/40"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </section>

            {/* STEP D: Current Situation */}
            <section className="bg-white border border-[#E8DFE6] rounded-2xl p-6 sm:p-7 space-y-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="font-display text-xl font-semibold text-[#38243E]">
                  D. Current situation
                </h2>
                <button
                  type="button"
                  onClick={() => void loadLiveWeather(profile?.location, true)}
                  disabled={weatherLoading}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-[#E84D79] hover:text-[#D43B68] whitespace-nowrap cursor-pointer disabled:opacity-60"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 ${weatherLoading ? "animate-spin" : ""}`}
                    aria-hidden="true"
                  />
                  <span>{weatherLoading ? "Fetching Kolkata weather..." : "Refresh live weather"}</span>
                </button>
              </div>

              {/* Live Kolkata Weather Context Strip */}
              {weatherLoading && !liveWeather ? (
                <div className="p-4 rounded-xl bg-[#FAF7F9] border border-[#E8DFE6] animate-pulse h-16" />
              ) : liveWeather ? (
                <div className="p-4 rounded-xl bg-[#FAF7F9] border border-[#E8DFE6] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm text-[#38243E]">
                      <span className="font-semibold text-[#E84D79]">
                        {liveWeather.locationLabel}
                      </span>
                      <span className="inline-flex items-center gap-1 font-semibold tabular-nums">
                        <Thermometer className="w-3.5 h-3.5 text-[#E84D79]" aria-hidden="true" />
                        {liveWeather.temperatureC}°C (feels {liveWeather.feelsLikeC}°C)
                      </span>
                      <span className="inline-flex items-center gap-1 font-semibold tabular-nums">
                        <Droplets className="w-3.5 h-3.5 text-[#E84D79]" aria-hidden="true" />
                        {liveWeather.humidityPercent}% humidity
                      </span>
                      <span className="text-[#6B5570]">{liveWeather.conditionLabel}</span>
                    </div>
                    <p className="text-xs text-[#6B5570] leading-relaxed">
                      {liveWeather.beautyWeatherNote}
                    </p>
                  </div>
                </div>
              ) : weatherError ? (
                <p className="text-xs text-[#6B5570]">{weatherError}</p>
              ) : null}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="sit-env"
                    className="block text-xs font-semibold text-[#38243E] mb-1.5"
                  >
                    Where are you right now?
                  </label>
                  <select
                    id="sit-env"
                    value={environment}
                    onChange={(e) => setEnvironment(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DFE6] text-sm text-[#38243E] bg-white focus:border-[#E84D79] focus:outline-none"
                  >
                    <option value="Outdoors">Outdoors</option>
                    <option value="Indoors (AC)">Indoors (AC)</option>
                    <option value="Indoors (non-AC / fan)">Indoors (non-AC / fan)</option>
                    <option value="Commuting / travelling">Commuting / travelling</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="sit-weather"
                    className="block text-xs font-semibold text-[#38243E] mb-1.5"
                  >
                    What does the weather feel like?
                    {liveWeather && !weatherTouched ? " (auto-detected)" : ""}
                  </label>
                  <select
                    id="sit-weather"
                    value={weather}
                    onChange={(e) => {
                      setWeather(e.target.value);
                      setWeatherTouched(true);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DFE6] text-sm text-[#38243E] bg-white focus:border-[#E84D79] focus:outline-none"
                  >
                    <option value="Hot & humid">Hot &amp; humid</option>
                    <option value="Warm & sweaty">Warm &amp; sweaty</option>
                    <option value="Rainy / damp">Rainy / damp</option>
                    <option value="Pleasant / dry">Pleasant / dry</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                {[
                  {
                    label: "Away from home",
                    value: awayFromHome,
                    setter: setAwayFromHome,
                  },
                  {
                    label: "Washroom / mirror access",
                    value: washroomAccess,
                    setter: setWashroomAccess,
                  },
                  {
                    label: "Have beauty products with me",
                    value: hasProducts,
                    setter: setHasProducts,
                  },
                ].map((toggle) => (
                  <button
                    key={toggle.label}
                    type="button"
                    onClick={() => toggle.setter(!toggle.value)}
                    className={`p-3.5 rounded-xl border text-left transition-colors cursor-pointer ${
                      toggle.value
                        ? "border-[#E84D79] bg-[#E84D79]/10 text-[#38243E]"
                        : "border-[#E8DFE6] text-[#6B5570]"
                    }`}
                  >
                    <p className="text-xs font-semibold">{toggle.label}</p>
                    <p className="text-xs mt-1 font-medium text-[#E84D79]">
                      {toggle.value ? "Yes" : "No"}
                    </p>
                  </button>
                ))}
              </div>
            </section>

            {/* STEP E: Product Availability & Quick Profile Overrides */}
            <section className="bg-white border border-[#E8DFE6] rounded-2xl p-6 sm:p-7 space-y-5">
              <div>
                <h2 className="font-display text-xl font-semibold text-[#38243E]">
                  E. Product preferences for this plan
                </h2>
                <p className="text-xs text-[#6B5570] mt-1">
                  Prefilled from your Beauty Profile—adjust anything just for today.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  {
                    id: "owned" as const,
                    label: "Only products I already own",
                  },
                  {
                    id: "both" as const,
                    label: "My products + affordable options",
                  },
                  {
                    id: "affordable" as const,
                    label: "Suggest affordable products",
                  },
                ].map((src) => (
                  <button
                    key={src.id}
                    type="button"
                    onClick={() => setProductSource(src.id)}
                    className={`py-3 px-3.5 rounded-xl border text-xs sm:text-sm font-medium text-left transition-colors cursor-pointer ${
                      productSource === src.id
                        ? "border-[#E84D79] bg-[#E84D79]/10 text-[#38243E] font-semibold"
                        : "border-[#E8DFE6] text-[#6B5570] hover:border-[#38243E]/40"
                    }`}
                  >
                    {src.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#E8DFE6]">
                <div>
                  <label
                    htmlFor="plan-skin"
                    className="block text-xs font-semibold text-[#38243E] mb-1.5"
                  >
                    Skin type
                  </label>
                  <select
                    id="plan-skin"
                    value={planSkinType}
                    onChange={(e) => setPlanSkinType(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DFE6] text-sm text-[#38243E] bg-white focus:border-[#E84D79] focus:outline-none"
                  >
                    <option value="">Not specified</option>
                    {SKIN_TYPES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="plan-makeup"
                    className="block text-xs font-semibold text-[#38243E] mb-1.5"
                  >
                    Makeup preference
                  </label>
                  <select
                    id="plan-makeup"
                    value={planMakeupPref}
                    onChange={(e) => setPlanMakeupPref(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DFE6] text-sm text-[#38243E] bg-white focus:border-[#E84D79] focus:outline-none"
                  >
                    <option value="">Not specified</option>
                    {MAKEUP_PREFERENCES.map((mp) => (
                      <option key={mp} value={mp}>
                        {mp}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {hasProducts && (
                <div className="space-y-3 pt-2 border-t border-[#E8DFE6]">
                  <p className="text-xs font-semibold text-[#38243E]">
                    Products available with you ({planProducts.length})
                  </p>

                  {planProducts.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {planProducts.map((p) => (
                        <span
                          key={p.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FAF7F9] border border-[#E8DFE6] text-xs font-medium text-[#38243E]"
                        >
                          <span>{p.name}</span>
                          <button
                            type="button"
                            onClick={() => removePlanProduct(p.id)}
                            aria-label={`Remove ${p.name} for this plan`}
                            className="text-[#6B5570] hover:text-[#E84D79] cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={100}
                      value={newProductText}
                      onChange={(e) => setNewProductText(e.target.value)}
                      placeholder="Add something currently in your bag (e.g., Wet wipes, Lip balm)"
                      className="flex-1 px-3.5 py-2 rounded-xl border border-[#E8DFE6] text-sm text-[#38243E] focus:border-[#E84D79] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={addQuickProduct}
                      className="inline-flex items-center gap-1 px-4 py-2 rounded-xl border border-[#E8DFE6] hover:border-[#38243E] text-xs sm:text-sm font-medium text-[#38243E] cursor-pointer"
                    >
                      <Plus className="w-4 h-4" aria-hidden="true" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              )}
            </section>

            {/* Generate CTA */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
              <p className="text-xs text-[#6B5570]">
                Generated securely using Gemini AI · Strictly respects your {availableTime} limit
              </p>
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-[#E84D79] hover:bg-[#D43B68] text-white text-sm sm:text-base font-semibold transition-colors cursor-pointer"
              >
                <Sparkles className="w-4 h-4" aria-hidden="true" />
                <span>Generate My Beauty Rescue Plan</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </AppShell>
  );
}
