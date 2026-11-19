import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, BookmarkCheck, Check, Download, Plus, Search, Trash2 } from "lucide-react";
import { AppShell } from "../components/AppShell";
import { RescuePlanResultView } from "../components/RescuePlanResultView";
import { useAuth } from "../contexts/AuthContext";
import { deleteUserPlan, listUserPlans, rateUserPlan } from "../lib/firebase";
import { exportRescuePlanPdf } from "../lib/pdfExport";
import type { SavedRescuePlan } from "../types/glamguard";

function formatDate(createdAt: unknown): string {
  if (!createdAt) return "Recently";
  const maybeTs = createdAt as { toDate?: () => Date };
  const date = typeof maybeTs.toDate === "function" ? maybeTs.toDate() : new Date(String(createdAt));
  if (Number.isNaN(date.getTime())) return "Recently";
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function MyPlansPage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [plans, setPlans] = useState<SavedRescuePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [activePlan, setActivePlan] = useState<SavedRescuePlan | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [downloadedPlanId, setDownloadedPlanId] = useState<string | null>(null);

  const handleDownloadSavedPlan = (plan: SavedRescuePlan) => {
    setError("");
    try {
      exportRescuePlanPdf({
        title: plan.title,
        occasion: plan.occasion,
        concerns: plan.concerns,
        availableTime: plan.availableTime,
        availableMinutes: plan.availableMinutes,
        situation: plan.situation,
        plan: plan.generatedPlan,
      });
      setDownloadedPlanId(plan.id);
      window.setTimeout(() => {
        setDownloadedPlanId((prev) => (prev === plan.id ? null : prev));
      }, 2500);
    } catch {
      setError("Could not generate the PDF for this saved plan. Please try again.");
    }
  };

  const loadPlans = async () => {
    if (!user) return;
    setLoading(true);
    setError("");
    try {
      const items = await listUserPlans(user.uid);
      setPlans(items);
      const openId = searchParams.get("open");
      if (openId) {
        const match = items.find((p) => p.id === openId);
        if (match) setActivePlan(match);
      }
    } catch {
      setError("Could not load your saved plans. Please try refreshing.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadPlans();
  }, [user]);

  const handleOpenPlan = (plan: SavedRescuePlan) => {
    setActivePlan(plan);
    setSearchParams({ open: plan.id });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleClosePlan = () => {
    setActivePlan(null);
    setSearchParams({});
  };

  const handleDelete = async (planId: string) => {
    if (!user) return;
    setDeleting(true);
    try {
      await deleteUserPlan(user.uid, planId);
      setPlans((prev) => prev.filter((p) => p.id !== planId));
      if (activePlan?.id === planId) handleClosePlan();
      setConfirmDeleteId(null);
    } catch {
      setError("Could not delete this plan. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  const filteredPlans = plans.filter((p) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      p.occasion.toLowerCase().includes(q) ||
      p.concerns.some((c) => c.toLowerCase().includes(q))
    );
  });

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        {activePlan ? (
          <div className="space-y-6">
            <button
              type="button"
              onClick={handleClosePlan}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[#6B5570] hover:text-[#38243E] cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              <span>Back to My Plans</span>
            </button>

            <RescuePlanResultView
              title={activePlan.title}
              occasion={activePlan.occasion}
              concerns={activePlan.concerns}
              availableTime={activePlan.availableTime}
              availableMinutes={activePlan.availableMinutes}
              situation={activePlan.situation}
              plan={activePlan.generatedPlan}
              savedPlanId={activePlan.id}
              saving={false}
              initialRating={activePlan.feedbackRating ?? null}
              onRatePlan={async (stars) => {
                if (!user) return;
                await rateUserPlan(user.uid, activePlan.id, stars);
                setPlans((prev) =>
                  prev.map((item) =>
                    item.id === activePlan.id ? { ...item, feedbackRating: stars } : item
                  )
                );
              }}
              onGenerateAnother={() => navigate("/rescue-plan")}
              onReturnDashboard={() => navigate("/dashboard")}
              defaultLocation={profile?.location || ""}
            />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs font-medium text-[#E84D79] mb-1">Saved Library</p>
                <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#38243E]">
                  My Plans
                </h1>
              </div>

              <Link
                to="/rescue-plan"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#E84D79] hover:bg-[#D43B68] text-white text-sm font-semibold transition-colors whitespace-nowrap"
              >
                <Plus className="w-4 h-4" aria-hidden="true" />
                <span>New Rescue Plan</span>
              </Link>
            </div>

            {plans.length > 0 && (
              <div className="relative">
                <Search
                  className="w-4 h-4 text-[#6B5570] absolute left-3.5 top-1/2 -translate-y-1/2"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Filter by occasion or beauty concern..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#E8DFE6] text-sm text-[#38243E] focus:border-[#E84D79] focus:outline-none"
                />
              </div>
            )}

            {error && (
              <div className="p-4 rounded-xl bg-[#E84D79]/10 border border-[#E84D79]/30 text-sm text-[#38243E]">
                {error}
              </div>
            )}

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-24 rounded-2xl bg-white border border-[#E8DFE6] animate-pulse" />
                ))}
              </div>
            ) : plans.length === 0 ? (
              <div className="bg-white border border-[#E8DFE6] rounded-2xl p-10 text-center">
                <BookmarkCheck className="w-8 h-8 text-[#E84D79] mx-auto mb-3" aria-hidden="true" />
                <h2 className="font-display text-2xl font-semibold text-[#38243E] mb-2">
                  No saved Beauty Rescue Plans yet
                </h2>
                <p className="text-sm text-[#6B5570] max-w-md mx-auto mb-6">
                  When you generate a Beauty Rescue Plan and tap &ldquo;Save This Plan&rdquo;, it
                  stays safely stored here across every device and login.
                </p>
                <Link
                  to="/rescue-plan"
                  className="inline-block px-5 py-2.5 rounded-xl bg-[#E84D79] hover:bg-[#D43B68] text-white text-sm font-semibold"
                >
                  Create Your First Rescue Plan
                </Link>
              </div>
            ) : filteredPlans.length === 0 ? (
              <div className="bg-white border border-[#E8DFE6] rounded-2xl p-8 text-center text-sm text-[#6B5570]">
                No saved plans match &ldquo;{searchTerm}&rdquo;.
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPlans.map((plan) => (
                  <article
                    key={plan.id}
                    className="bg-white border border-[#E8DFE6] rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-[#6B5570] mb-1.5">
                        <span className="font-semibold text-[#E84D79]">{plan.occasion}</span>
                        <span aria-hidden="true">·</span>
                        <span className="tabular-nums">{plan.availableTime}</span>
                        <span aria-hidden="true">·</span>
                        <span>{formatDate(plan.createdAt)}</span>
                      </div>
                      <h2 className="text-base sm:text-lg font-semibold text-[#38243E] truncate">
                        {plan.title}
                      </h2>
                      <p className="text-xs text-[#6B5570] mt-1 truncate">
                        Main concern: {plan.concerns[0] || plan.customConcern || "Quick refresh"}
                      </p>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleOpenPlan(plan)}
                        className="px-4 py-2 min-h-[38px] rounded-xl bg-[#38243E] hover:bg-[#29182E] text-white text-xs sm:text-sm font-medium whitespace-nowrap transition-colors cursor-pointer"
                      >
                        Open Plan
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDownloadSavedPlan(plan)}
                        aria-label={`Download PDF for ${plan.title}`}
                        className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[38px] rounded-xl border border-[#E8DFE6] bg-[#FAF7F9] hover:border-[#38243E] hover:bg-white text-xs sm:text-sm font-medium text-[#38243E] whitespace-nowrap transition-colors cursor-pointer"
                      >
                        {downloadedPlanId === plan.id ? (
                          <>
                            <Check className="w-4 h-4 text-[#E84D79] shrink-0" aria-hidden="true" />
                            <span>Saved</span>
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4 text-[#E84D79] shrink-0" aria-hidden="true" />
                            <span>PDF</span>
                          </>
                        )}
                      </button>

                      {confirmDeleteId === plan.id ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            disabled={deleting}
                            onClick={() => handleDelete(plan.id)}
                            className="px-3 py-2 rounded-xl bg-[#E84D79] text-white text-xs font-semibold cursor-pointer"
                          >
                            {deleting ? "Deleting..." : "Confirm"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(null)}
                            className="px-3 py-2 rounded-xl border border-[#E8DFE6] text-xs font-medium text-[#6B5570] cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(plan.id)}
                          aria-label={`Delete ${plan.title}`}
                          className="p-2 rounded-xl border border-[#E8DFE6] text-[#6B5570] hover:text-[#E84D79] hover:border-[#E84D79] transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
