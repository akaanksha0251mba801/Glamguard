import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, BookmarkCheck, Clock, Droplets, Sparkles, Thermometer, UserRound } from "lucide-react";
import { AppShell } from "../components/AppShell";
import { PricingValidationCard } from "../components/PricingValidationCard";
import { useAuth } from "../contexts/AuthContext";
import { listUserPlans } from "../lib/firebase";
import { fetchKolkataLiveWeather } from "../lib/weather";
import {
  EXTRA_KOLKATA_SCENARIOS,
  KOLKATA_CLIMATE_TIPS,
  QUICK_SITUATIONS,
  type KolkataWeatherData,
  type QuickSituationPreset,
  type SavedRescuePlan,
} from "../types/glamguard";

function formatPlanDate(createdAt: unknown): string {
  if (!createdAt) return "Recently";
  const maybeTs = createdAt as { toDate?: () => Date };
  const date = typeof maybeTs.toDate === "function" ? maybeTs.toDate() : new Date(String(createdAt));
  if (Number.isNaN(date.getTime())) return "Recently";
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export function DashboardPage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [recentPlans, setRecentPlans] = useState<SavedRescuePlan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [liveWeather, setLiveWeather] = useState<KolkataWeatherData | null>(null);

  useEffect(() => {
    let active = true;
    fetchKolkataLiveWeather(profile?.location)
      .then((data) => {
        if (active) setLiveWeather(data);
      })
      .catch(() => {
        // Non-blocking: falls back to curated Kolkata climate tip
      });
    return () => {
      active = false;
    };
  }, [profile?.location]);

  useEffect(() => {
    if (!user) return;
    let active = true;
    setPlansLoading(true);
    listUserPlans(user.uid)
      .then((items) => {
        if (active) setRecentPlans(items.slice(0, 3));
      })
      .catch((err) => {
        console.error("Failed loading recent plans:", err);
      })
      .finally(() => {
        if (active) setPlansLoading(false);
      });
    return () => {
      active = false;
    };
  }, [user]);

  const firstName = (profile?.name || user?.displayName || "there").split(" ")[0];
  const tipIndex = (profile?.beautyConcerns?.[0]?.length || 0) % KOLKATA_CLIMATE_TIPS.length;
  const dailyTip = KOLKATA_CLIMATE_TIPS[tipIndex];

  const handleSituationClick = (preset: QuickSituationPreset) => {
    navigate("/rescue-plan", { state: { preset } });
  };

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-10">
        {/* Welcome Hero Card */}
        <section className="bg-white border border-[#E8DFE6] rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <p className="text-xs font-medium text-[#E84D79] mb-1.5">
              {profile?.location ? `${profile.location} · ` : ""}Kolkata Beauty Assistant
            </p>
            <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#38243E] mb-2">
              Hey {firstName}, let&apos;s fix it fast.
            </h1>
            <p className="text-sm sm:text-base text-[#6B5570] max-w-xl">
              Tell us what&apos;s happening with your skin, hair, or makeup right now and how many
              minutes you have.
            </p>
          </div>
          <Link
            to="/rescue-plan"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#E84D79] hover:bg-[#D43B68] text-white text-sm font-semibold transition-colors whitespace-nowrap shrink-0"
          >
            <Sparkles className="w-4 h-4" aria-hidden="true" />
            <span>Create a Beauty Rescue Plan</span>
          </Link>
        </section>

        {/* Quick Situation Cards */}
        <section className="space-y-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-display text-2xl font-semibold text-[#38243E]">
              What are you dealing with today?
            </h2>
            <span className="text-xs text-[#6B5570]">
              Tap any card to pre-fill your rescue plan
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {QUICK_SITUATIONS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSituationClick(preset)}
                className="group text-left bg-white border border-[#E8DFE6] hover:border-[#E84D79] rounded-2xl p-5 transition-colors flex flex-col justify-between gap-4 cursor-pointer"
              >
                <div>
                  <h3 className="text-base font-semibold text-[#38243E] group-hover:text-[#E84D79] transition-colors mb-1.5">
                    {preset.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#6B5570] leading-relaxed">
                    {preset.subtitle}
                  </p>
                </div>
                <div className="flex items-center justify-between text-xs text-[#6B5570] pt-3 border-t border-[#E8DFE6]/70">
                  <span className="inline-flex items-center gap-1 tabular-nums">
                    <Clock className="w-3.5 h-3.5 text-[#E84D79]" aria-hidden="true" />
                    {preset.timeLabel}
                  </span>
                  <span className="font-semibold text-[#38243E] inline-flex items-center gap-1">
                    Fix now <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </span>
                </div>
              </button>
            ))}
          </div>

          <div className="bg-white border border-[#E8DFE6] rounded-2xl p-5">
            <p className="text-xs font-semibold text-[#6B5570] mb-3">
              More Kolkata Scenarios · Durga Puja, Weddings &amp; Commutes
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {EXTRA_KOLKATA_SCENARIOS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleSituationClick(preset)}
                  className="text-left p-3.5 rounded-xl bg-[#FAF7F9] border border-[#E8DFE6] hover:border-[#E84D79] transition-colors cursor-pointer"
                >
                  <p className="text-xs font-semibold text-[#38243E] mb-1">{preset.title}</p>
                  <p className="text-[11px] text-[#6B5570] tabular-nums">
                    {preset.occasion} · {preset.timeLabel}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Recent Plans + Beauty Profile Summary + Climate Tip */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Recently Generated Plans */}
          <section className="lg:col-span-7 bg-white border border-[#E8DFE6] rounded-2xl p-6 sm:p-7">
            <div className="flex items-center justify-between gap-4 mb-5">
              <h2 className="font-display text-xl font-semibold text-[#38243E]">
                Recently Saved Plans
              </h2>
              <Link
                to="/plans"
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#E84D79] hover:underline whitespace-nowrap"
              >
                <span>View My Plans</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
            </div>

            {plansLoading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="h-16 rounded-xl bg-[#FAF7F9] animate-pulse" />
                ))}
              </div>
            ) : recentPlans.length === 0 ? (
              <div className="py-8 text-center border border-dashed border-[#E8DFE6] rounded-xl px-4">
                <BookmarkCheck className="w-6 h-6 text-[#E84D79] mx-auto mb-2" aria-hidden="true" />
                <p className="text-sm font-medium text-[#38243E] mb-1">No saved plans yet</p>
                <p className="text-xs text-[#6B5570] mb-4">
                  Generate your first personalized Beauty Rescue Plan and save it for quick repeat
                  access.
                </p>
                <Link
                  to="/rescue-plan"
                  className="inline-block px-4 py-2 rounded-xl bg-[#E84D79] hover:bg-[#D43B68] text-white text-xs font-semibold"
                >
                  Create First Plan
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-[#E8DFE6]">
                {recentPlans.map((plan) => (
                  <li key={plan.id} className="py-3.5 first:pt-0 last:pb-0">
                    <Link
                      to={`/plans?open=${plan.id}`}
                      className="flex items-center justify-between gap-4 group"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#38243E] group-hover:text-[#E84D79] truncate transition-colors">
                          {plan.title}
                        </p>
                        <p className="text-xs text-[#6B5570] mt-0.5 truncate">
                          {plan.occasion} · {plan.availableTime} · {formatPlanDate(plan.createdAt)}
                        </p>
                      </div>
                      <ArrowRight
                        className="w-4 h-4 text-[#6B5570] group-hover:text-[#E84D79] shrink-0"
                        aria-hidden="true"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Profile Summary & Kolkata Tip */}
          <div className="lg:col-span-5 space-y-6">
            <section className="bg-white border border-[#E8DFE6] rounded-2xl p-6">
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <UserRound className="w-4 h-4 text-[#E84D79]" aria-hidden="true" />
                  <h2 className="font-display text-lg font-semibold text-[#38243E]">
                    My Beauty Profile
                  </h2>
                </div>
                <Link
                  to="/profile"
                  className="text-xs font-semibold text-[#E84D79] hover:underline"
                >
                  Edit
                </Link>
              </div>

              <dl className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs">
                <div>
                  <dt className="text-[#6B5570]">Skin type</dt>
                  <dd className="font-semibold text-[#38243E] mt-0.5">
                    {profile?.skinType || "Not set"}
                  </dd>
                </div>
                <div>
                  <dt className="text-[#6B5570]">Makeup style</dt>
                  <dd className="font-semibold text-[#38243E] mt-0.5">
                    {profile?.makeupPreference || "Not set"}
                  </dd>
                </div>
                <div>
                  <dt className="text-[#6B5570]">Budget</dt>
                  <dd className="font-semibold text-[#38243E] mt-0.5">
                    {profile?.budgetPreference || "Affordable"}
                  </dd>
                </div>
                <div>
                  <dt className="text-[#6B5570]">Owned items</dt>
                  <dd className="font-semibold text-[#38243E] mt-0.5 tabular-nums">
                    {profile?.existingProducts?.length ?? 0} saved
                  </dd>
                </div>
              </dl>
            </section>

            <section className="bg-[#38243E] text-white rounded-2xl p-6 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-medium text-[#E84D79]">
                  {liveWeather ? `Live ${liveWeather.locationLabel} Weather` : "Kolkata Climate Tip"}
                </p>
                {liveWeather && (
                  <span className="text-[11px] text-white/75">{liveWeather.conditionLabel}</span>
                )}
              </div>

              {liveWeather && (
                <div className="flex flex-wrap items-center gap-4 pb-3 border-b border-white/15 text-sm font-semibold tabular-nums">
                  <span className="inline-flex items-center gap-1.5">
                    <Thermometer className="w-4 h-4 text-[#E84D79]" aria-hidden="true" />
                    {liveWeather.temperatureC}°C
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Droplets className="w-4 h-4 text-[#E84D79]" aria-hidden="true" />
                    {liveWeather.humidityPercent}% humidity
                  </span>
                </div>
              )}

              <p className="text-sm leading-relaxed text-white/90">
                {liveWeather ? liveWeather.beautyWeatherNote : dailyTip}
              </p>
            </section>
          </div>
        </div>

        {/* Pilot Pricing Validation */}
        <PricingValidationCard compact />
      </div>
    </AppShell>
  );
}
