import React, { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { submitPricingResponse } from "../lib/firebase";

export function PricingValidationCard({ compact = false }: { compact?: boolean }) {
  const { user } = useAuth();
  const [choice, setChoice] = useState<"yes" | "maybe" | "no" | "">("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !choice) return;
    setSubmitting(true);
    setError("");
    try {
      await submitPricingResponse(user.uid, {
        willingnessToPay: choice,
        response: note.trim(),
      });
      setSubmitted(true);
    } catch {
      setError("Could not save your response. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="bg-white border border-[#E8DFE6] rounded-2xl p-6 sm:p-7">
      <div className="flex flex-wrap items-baseline justify-between gap-3 mb-3">
        <div>
          <p className="text-xs font-medium text-[#E84D79] mb-1">
            Proposed Pilot Plan · Pricing Validation Only
          </p>
          <h3 className="font-display text-xl sm:text-2xl font-semibold text-[#38243E]">
            GlamGuard Plus — ₹99 per month
          </h3>
        </div>
        <span className="text-xs text-[#6B5570]">No payment or billing active</span>
      </div>

      <p className="text-sm text-[#6B5570] leading-relaxed mb-5">
        GlamGuard is testing a Freemium + Paid model. Basic situation rescue plans stay free to
        try, while continued unlimited personalized beauty rescue plans, saved history, and routine
        refinements are proposed at <strong className="text-[#38243E]">₹99/month</strong>.
      </p>

      {submitted ? (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-[#FAF7F9] border border-[#E8DFE6]">
          <CheckCircle2 className="w-5 h-5 text-[#E84D79] shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <p className="text-sm font-semibold text-[#38243E]">Thank you for sharing!</p>
            <p className="text-xs text-[#6B5570] mt-0.5">
              Your answer helps us build an affordable plan that genuinely fits Kolkata students and
              young professionals.
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm font-medium text-[#38243E]">
            Would you consider paying ₹99 per month for continued personalized beauty guidance?
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {[
              { value: "yes", label: "Yes, ₹99/mo works" },
              { value: "maybe", label: "Maybe, depending on plans" },
              { value: "no", label: "Prefer free tier only" },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setChoice(opt.value as "yes" | "maybe" | "no")}
                className={`px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm font-medium transition-colors text-center cursor-pointer ${
                  choice === opt.value
                    ? "border-[#E84D79] bg-[#E84D79]/10 text-[#38243E] font-semibold"
                    : "border-[#E8DFE6] bg-white text-[#6B5570] hover:border-[#38243E]/40"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {!compact && (
            <div>
              <label htmlFor="wtp-note" className="block text-xs font-medium text-[#6B5570] mb-1.5">
                Any thoughts on the ₹99/month price? (Optional)
              </label>
              <input
                id="wtp-note"
                type="text"
                maxLength={500}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g., Worth it during Puja and wedding season"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DFE6] text-sm text-[#38243E] placeholder:text-[#6B5570]/60 focus:border-[#E84D79] focus:outline-none"
              />
            </div>
          )}

          {error && <p className="text-xs text-[#D43B68]">{error}</p>}

          <button
            type="submit"
            disabled={!choice || submitting}
            className="px-5 py-2.5 rounded-xl bg-[#38243E] hover:bg-[#29182E] disabled:opacity-45 text-white text-sm font-medium transition-colors cursor-pointer"
          >
            {submitting ? "Saving response..." : "Submit Answer"}
          </button>
        </form>
      )}
    </section>
  );
}
