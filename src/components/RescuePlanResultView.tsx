import { useState } from "react";
import {
  AlertTriangle,
  Bookmark,
  BookmarkCheck,
  Check,
  Clock,
  Download,
  Info,
  MapPin,
  RotateCcw,
  Star,
} from "lucide-react";
import { exportRescuePlanPdf } from "../lib/pdfExport";
import type { GeneratedRescuePlan, RescuePlanSituation } from "../types/glamguard";
import { FeedbackModal } from "./FeedbackModal";
import { PricingValidationCard } from "./PricingValidationCard";

interface RescuePlanResultViewProps {
  title: string;
  occasion: string;
  concerns: string[];
  availableTime: string;
  availableMinutes: number;
  situation: RescuePlanSituation;
  plan: GeneratedRescuePlan;
  savedPlanId: string | null;
  saving: boolean;
  onSavePlan?: () => Promise<void>;
  onRatePlan?: (rating: number) => Promise<void>;
  initialRating?: number | null;
  onGenerateAnother: () => void;
  onReturnDashboard: () => void;
  defaultLocation?: string;
}

export function RescuePlanResultView({
  title,
  occasion,
  concerns,
  availableTime,
  availableMinutes,
  situation,
  plan,
  savedPlanId,
  saving,
  onSavePlan,
  onRatePlan,
  initialRating = null,
  onGenerateAnother,
  onReturnDashboard,
  defaultLocation = "",
}: RescuePlanResultViewProps) {
  const [rating, setRating] = useState<number | null>(initialRating);
  const [ratingSaving, setRatingSaving] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [salonArea, setSalonArea] = useState(defaultLocation);
  const [salonChecked, setSalonChecked] = useState(false);
  const [pdfExported, setPdfExported] = useState(false);
  const [pdfError, setPdfError] = useState("");

  const handleDownloadPdf = () => {
    setPdfError("");
    try {
      exportRescuePlanPdf({
        title,
        occasion,
        concerns,
        availableTime,
        availableMinutes,
        situation,
        plan,
      });
      setPdfExported(true);
      window.setTimeout(() => setPdfExported(false), 3000);
    } catch {
      setPdfError("Could not generate the PDF file. Please try again.");
    }
  };

  const handleRating = async (stars: number) => {
    setRating(stars);
    if (onRatePlan && savedPlanId) {
      setRatingSaving(true);
      try {
        await onRatePlan(stars);
      } finally {
        setRatingSaving(false);
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Summary */}
      <div className="bg-white border border-[#E8DFE6] rounded-2xl p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-2 text-xs text-[#6B5570] mb-3">
          <span className="font-semibold text-[#E84D79]">{occasion}</span>
          <span aria-hidden="true">·</span>
          <span className="tabular-nums">{availableTime} limit</span>
          <span aria-hidden="true">·</span>
          <span>{situation.environment || "Everyday setting"}</span>
          {situation.weather && (
            <>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">{situation.weather}</span>
            </>
          )}
        </div>

        <h1 className="font-display text-2xl sm:text-4xl font-semibold text-[#38243E] text-balance mb-3">
          {title}
        </h1>

        {concerns.length > 0 && (
          <p className="text-xs sm:text-sm text-[#6B5570] mb-6">
            Concerns addressed: {concerns.join(" · ")}
          </p>
        )}

        {/* Plan Actions Top Bar */}
        <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-[#E8DFE6]">
          {onSavePlan && (
            <button
              type="button"
              onClick={onSavePlan}
              disabled={Boolean(savedPlanId) || saving}
              className={`inline-flex items-center gap-2 px-5 py-2.5 min-h-[40px] rounded-xl text-sm font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                savedPlanId
                  ? "bg-[#38243E] text-white cursor-default"
                  : "bg-[#E84D79] hover:bg-[#D43B68] text-white"
              }`}
            >
              {savedPlanId ? (
                <>
                  <BookmarkCheck className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>Saved to My Plans</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>{saving ? "Saving..." : "Save This Plan"}</span>
                </>
              )}
            </button>
          )}

          <button
            type="button"
            onClick={handleDownloadPdf}
            className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[40px] rounded-xl border border-[#38243E]/25 bg-[#FAF7F9] hover:border-[#38243E] hover:bg-white text-sm font-medium text-[#38243E] whitespace-nowrap shrink-0 transition-colors cursor-pointer"
          >
            {pdfExported ? (
              <>
                <Check className="w-4 h-4 text-[#E84D79] shrink-0" aria-hidden="true" />
                <span>PDF Downloaded</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 text-[#E84D79] shrink-0" aria-hidden="true" />
                <span>Download PDF</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onGenerateAnother}
            className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[40px] rounded-xl border border-[#E8DFE6] bg-white hover:border-[#38243E] text-sm font-medium text-[#38243E] whitespace-nowrap shrink-0 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Generate Another Plan</span>
          </button>

          <button
            type="button"
            onClick={onReturnDashboard}
            className="px-4 py-2.5 min-h-[40px] rounded-xl text-sm font-medium text-[#6B5570] hover:text-[#38243E] whitespace-nowrap shrink-0 transition-colors cursor-pointer"
          >
            Return to Dashboard
          </button>
        </div>

        {pdfError && (
          <p className="mt-3 text-xs text-[#E84D79] font-medium" role="alert">
            {pdfError}
          </p>
        )}
      </div>

      {/* A. Your Situation */}
      <section className="bg-white border border-[#E8DFE6] rounded-2xl p-6 sm:p-7">
        <h2 className="font-display text-xl font-semibold text-[#38243E] mb-2.5">
          1. Your Situation
        </h2>
        <p className="text-sm sm:text-base text-[#38243E]/90 leading-relaxed">
          {plan.situationSummary}
        </p>
      </section>

      {/* B. Your Personalized Rescue Plan */}
      <section className="bg-white border border-[#E8DFE6] rounded-2xl p-6 sm:p-7">
        <div className="flex flex-wrap items-baseline justify-between gap-2 mb-6">
          <h2 className="font-display text-xl sm:text-2xl font-semibold text-[#38243E]">
            2. Your Personalized Rescue Plan
          </h2>
          <span className="text-xs font-medium text-[#E84D79] tabular-nums">
            {plan.steps.length} steps · {plan.timeBreakdown.totalMinutes} min total
          </span>
        </div>

        <ol className="divide-y divide-[#E8DFE6]">
          {plan.steps.map((step) => (
            <li key={step.stepNumber} className="py-5 first:pt-0 last:pb-0">
              <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
                <h3 className="text-base font-semibold text-[#38243E]">
                  <span className="text-[#E84D79] tabular-nums mr-2">
                    {String(step.stepNumber).padStart(2, "0")}.
                  </span>
                  {step.title}
                </h3>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-[#6B5570] tabular-nums">
                  <Clock className="w-3.5 h-3.5 text-[#E84D79]" aria-hidden="true" />
                  {step.timeMinutes} min
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm mt-2">
                <div>
                  <p className="text-xs font-semibold text-[#6B5570] mb-0.5">What &amp; How</p>
                  <p className="text-[#38243E] leading-relaxed">
                    <span className="font-medium">{step.whatToDo}</span> — {step.howToDoIt}
                  </p>
                </div>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs font-semibold text-[#6B5570] mb-0.5">Product or Item</p>
                    <p className="text-[#38243E]">{step.productUsed}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#6B5570] mb-0.5">Why This Helps</p>
                    <p className="text-[#6B5570] leading-relaxed">{step.whyItHelps}</p>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* C. Quick Fixes & E. What to Avoid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-white border border-[#E8DFE6] rounded-2xl p-6 sm:p-7">
          <h2 className="font-display text-xl font-semibold text-[#38243E] mb-4">
            3. Quick Fixes
          </h2>
          {plan.quickFixes.length > 0 ? (
            <ul className="space-y-4">
              {plan.quickFixes.map((fix, idx) => (
                <li
                  key={idx}
                  className="pb-4 border-b border-[#E8DFE6]/70 last:pb-0 last:border-b-0"
                >
                  <div className="flex items-baseline justify-between gap-2 mb-1">
                    <p className="text-sm font-semibold text-[#38243E]">{fix.title}</p>
                    <span className="text-xs text-[#E84D79] font-medium tabular-nums shrink-0">
                      {fix.timeMinutes} min
                    </span>
                  </div>
                  <p className="text-sm text-[#6B5570] leading-relaxed">{fix.instruction}</p>
                  <p className="text-xs text-[#38243E]/80 mt-1">Using: {fix.productUsed}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-[#6B5570]">
              Follow steps 1 and 2 above for the fastest immediate fix.
            </p>
          )}
        </section>

        <section className="bg-white border border-[#E8DFE6] rounded-2xl p-6 sm:p-7">
          <h2 className="font-display text-xl font-semibold text-[#38243E] mb-4">
            5. What to Avoid
          </h2>
          <ul className="space-y-3">
            {plan.whatToAvoid.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-sm text-[#38243E]">
                <AlertTriangle
                  className="w-4 h-4 text-[#E84D79] shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* D. Products That May Help */}
      <section className="bg-white border border-[#E8DFE6] rounded-2xl p-6 sm:p-7">
        <h2 className="font-display text-xl font-semibold text-[#38243E] mb-1">
          4. Products That May Help
        </h2>
        <p className="text-xs text-[#6B5570] mb-5">
          Focused on what you already own plus optional everyday affordable options.
        </p>

        {plan.productsThatMayHelp.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {plan.productsThatMayHelp.map((prod, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-[#FAF7F9] border border-[#E8DFE6] flex flex-col justify-between gap-2"
              >
                <div>
                  <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-[#38243E]">{prod.productType}</h3>
                    <span
                      className={`text-xs font-medium ${
                        prod.ownershipStatus === "Already owned"
                          ? "text-[#38243E]"
                          : "text-[#E84D79]"
                      }`}
                    >
                      {prod.ownershipStatus}
                    </span>
                  </div>
                  <p className="text-xs text-[#6B5570] leading-relaxed">{prod.whyItHelps}</p>
                </div>
                <p className="text-xs font-medium text-[#38243E]/80 pt-2 border-t border-[#E8DFE6]/70">
                  {prod.affordabilityNote}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[#6B5570]">
            No additional products needed for this quick rescue routine.
          </p>
        )}
      </section>

      {/* F. Time Breakdown & G. Final Beauty Tip */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-white border border-[#E8DFE6] rounded-2xl p-6 sm:p-7">
          <h2 className="font-display text-xl font-semibold text-[#38243E] mb-3">
            6. Time Breakdown
          </h2>
          <p className="text-xs font-medium text-[#E84D79] mb-4">{plan.timeBreakdown.summary}</p>
          <div className="divide-y divide-[#E8DFE6]/70 text-sm">
            {plan.timeBreakdown.perStep.map((item, idx) => (
              <div key={idx} className="py-2 flex items-center justify-between gap-4">
                <span className="text-[#38243E]">{item.stepTitle}</span>
                <span className="tabular-nums text-[#6B5570] font-medium shrink-0">
                  {item.minutes} min
                </span>
              </div>
            ))}
            <div className="pt-3 flex items-center justify-between gap-4 font-semibold text-[#38243E]">
              <span>
                Total Estimated Time (Limit: {availableMinutes} min)
              </span>
              <span className="tabular-nums text-[#E84D79]">
                {plan.timeBreakdown.totalMinutes} min
              </span>
            </div>
          </div>
        </section>

        <section className="bg-[#38243E] text-white rounded-2xl p-6 sm:p-7 flex flex-col justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-[#E84D79] mb-2">7. Final Beauty Tip</p>
            <p className="font-display text-xl sm:text-2xl font-medium leading-snug">
              {plan.finalTip}
            </p>
          </div>
          <div className="pt-4 border-t border-white/15 flex items-start gap-2.5 text-xs text-white/80 leading-relaxed">
            <Info className="w-4 h-4 text-[#E84D79] shrink-0 mt-0.5" aria-hidden="true" />
            <span>
              {plan.professionalNote ||
                "GlamGuard offers practical beauty and styling suggestions, not medical diagnosis. For persistent skin or scalp concerns, please consult a qualified dermatologist."}
            </span>
          </div>
        </section>
      </div>

      {/* Informational Nearby Beauty Service Suggestions (No GPS, No Booking, Zero Fabricated Salons) */}
      <section className="bg-white border border-[#E8DFE6] rounded-2xl p-6 sm:p-7">
        <div className="flex items-start gap-3 mb-3">
          <MapPin className="w-5 h-5 text-[#E84D79] shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <h2 className="font-display text-lg font-semibold text-[#38243E]">
              Need in-person touch-up help in Kolkata?
            </h2>
            <p className="text-xs text-[#6B5570] mt-0.5">
              Informational area lookup only (no live GPS tracking or salon booking).
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 mt-4">
          <input
            type="text"
            value={salonArea}
            onChange={(e) => {
              setSalonArea(e.target.value);
              setSalonChecked(false);
            }}
            placeholder="Enter your Kolkata area (e.g., Gariahat, Salt Lake, Park Street)"
            className="flex-1 px-3.5 py-2.5 rounded-xl border border-[#E8DFE6] text-sm text-[#38243E] focus:border-[#E84D79] focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setSalonChecked(true)}
            className="px-4 py-2.5 rounded-xl border border-[#E8DFE6] hover:border-[#38243E] text-sm font-medium text-[#38243E] whitespace-nowrap cursor-pointer"
          >
            Check Area Info
          </button>
        </div>

        {salonChecked && (
          <div className="mt-4 p-4 rounded-xl bg-[#FAF7F9] border border-[#E8DFE6] text-xs sm:text-sm text-[#6B5570] leading-relaxed">
            {salonArea.trim() ? (
              <p>
                Verified partner salon listings for <strong className="text-[#38243E]">{salonArea}</strong>{" "}
                are not yet published in this pilot directory. We never display unverified salon
                names or contact details—if you need an immediate washroom or blow-dry touch-up nearby,
                check verified listings directly on Google Maps for express salons in {salonArea}.
              </p>
            ) : (
              <p>Enter a Kolkata neighbourhood above to check verified partner availability.</p>
            )}
          </div>
        )}
      </section>

      {/* Rating & Pilot Feedback Section */}
      <section className="bg-white border border-[#E8DFE6] rounded-2xl p-6 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-semibold text-[#38243E]">
              Was this rescue plan helpful?
            </h2>
            <p className="text-xs text-[#6B5570] mt-1">
              {savedPlanId
                ? "Your rating and pilot feedback are saved directly to your account."
                : "Rate this plan or open the pilot feedback form to help us improve."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1" role="group" aria-label="Rate plan helpfulness">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleRating(star)}
                  aria-label={`Rate ${star} out of 5`}
                  className="p-1.5 rounded-lg hover:bg-[#FAF7F9] cursor-pointer"
                >
                  <Star
                    className={`w-5 h-5 transition-colors ${
                      rating !== null && star <= rating
                        ? "fill-[#E84D79] text-[#E84D79]"
                        : "text-[#6B5570]/40"
                    }`}
                  />
                </button>
              ))}
              {ratingSaving && <span className="text-xs text-[#6B5570] ml-1">Saving...</span>}
            </div>

            <button
              type="button"
              onClick={() => setFeedbackOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#E84D79] hover:bg-[#D43B68] text-white text-xs sm:text-sm font-medium transition-colors cursor-pointer"
            >
              Give Pilot Feedback
            </button>
          </div>
        </div>
      </section>

      {/* Proposed ₹99/month Validation */}
      <PricingValidationCard compact />

      <FeedbackModal
        planId={savedPlanId || "generated_plan"}
        planTitle={title}
        open={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
      />
    </div>
  );
}
