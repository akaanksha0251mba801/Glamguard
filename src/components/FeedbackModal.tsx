import React, { useState } from "react";
import { CheckCircle2, X } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { submitPlanFeedback } from "../lib/firebase";

interface FeedbackModalProps {
  planId: string;
  planTitle: string;
  open: boolean;
  onClose: () => void;
}

function RatingRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 py-2 border-b border-[#E8DFE6]/60 last:border-b-0">
      <span className="text-sm text-[#38243E] font-medium">{label}</span>
      <div className="flex items-center gap-1.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`w-9 h-9 rounded-lg text-xs font-semibold tabular-nums border transition-colors cursor-pointer ${
              value === n
                ? "bg-[#E84D79] border-[#E84D79] text-white"
                : "bg-white border-[#E8DFE6] text-[#6B5570] hover:border-[#38243E]"
            }`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}

export function FeedbackModal({ planId, planTitle, open, onClose }: FeedbackModalProps) {
  const { user } = useAuth();
  const [usefulness, setUsefulness] = useState(5);
  const [relevance, setRelevance] = useState(5);
  const [easeOfUse, setEaseOfUse] = useState(5);
  const [timeFit, setTimeFit] = useState(true);
  const [reuseIntent, setReuseIntent] = useState("Yes, definitely");
  const [writtenFeedback, setWrittenFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    setError("");
    try {
      await submitPlanFeedback(user.uid, {
        planId: planId || "unsaved_plan",
        usefulness,
        relevance,
        easeOfUse,
        timeFit,
        reuseIntent,
        writtenFeedback: writtenFeedback.trim(),
      });
      setDone(true);
    } catch {
      setError("Could not save your feedback. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#38243E]/50 backdrop-blur-xs flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="feedback-modal-title"
    >
      <div className="bg-white border border-[#E8DFE6] rounded-2xl max-w-lg w-full p-6 sm:p-7 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <p className="text-xs font-medium text-[#E84D79] mb-1">Pilot Validation</p>
            <h2 id="feedback-modal-title" className="font-display text-2xl font-semibold text-[#38243E]">
              Share your feedback
            </h2>
            <p className="text-xs text-[#6B5570] mt-1">{planTitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close feedback dialog"
            className="p-2 rounded-lg text-[#6B5570] hover:text-[#38243E] hover:bg-[#FAF7F9] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {done ? (
          <div className="py-6 text-center space-y-4">
            <CheckCircle2 className="w-10 h-10 text-[#E84D79] mx-auto" />
            <h3 className="font-display text-xl font-semibold text-[#38243E]">
              Feedback recorded
            </h3>
            <p className="text-sm text-[#6B5570]">
              Thank you for helping us refine GlamGuard for everyday Kolkata routines.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-[#E84D79] hover:bg-[#D43B68] text-white text-sm font-medium transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <p className="text-xs text-[#6B5570] mb-2">Rate from 1 (low) to 5 (high)</p>
              <RatingRow
                label="Was this plan useful?"
                value={usefulness}
                onChange={setUsefulness}
              />
              <RatingRow
                label="Were the recommendations relevant?"
                value={relevance}
                onChange={setRelevance}
              />
              <RatingRow
                label="Was the plan easy to follow?"
                value={easeOfUse}
                onChange={setEaseOfUse}
              />
            </div>

            <div>
              <p className="text-sm font-medium text-[#38243E] mb-2">
                Did it fit your available time?
              </p>
              <div className="flex gap-2.5">
                {[
                  { val: true, label: "Yes, fit my time" },
                  { val: false, label: "No, felt too long" },
                ].map((opt) => (
                  <button
                    key={String(opt.val)}
                    type="button"
                    onClick={() => setTimeFit(opt.val)}
                    className={`flex-1 py-2.5 px-3 rounded-xl border text-xs font-medium transition-colors cursor-pointer ${
                      timeFit === opt.val
                        ? "border-[#E84D79] bg-[#E84D79]/10 text-[#38243E] font-semibold"
                        : "border-[#E8DFE6] text-[#6B5570]"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-[#38243E] mb-2">
                Would you use GlamGuard again?
              </p>
              <div className="grid grid-cols-3 gap-2">
                {["Yes, definitely", "Maybe", "Not really"].map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setReuseIntent(opt)}
                    className={`py-2 px-2.5 rounded-xl border text-xs font-medium transition-colors cursor-pointer ${
                      reuseIntent === opt
                        ? "border-[#E84D79] bg-[#E84D79]/10 text-[#38243E] font-semibold"
                        : "border-[#E8DFE6] text-[#6B5570]"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label
                htmlFor="written-feedback"
                className="block text-sm font-medium text-[#38243E] mb-1.5"
              >
                What would you improve? (Optional)
              </label>
              <textarea
                id="written-feedback"
                rows={3}
                maxLength={1000}
                value={writtenFeedback}
                onChange={(e) => setWrittenFeedback(e.target.value)}
                placeholder="Tell us what worked well or what felt missing..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DFE6] text-sm text-[#38243E] placeholder:text-[#6B5570]/60 focus:border-[#E84D79] focus:outline-none"
              />
            </div>

            {error && <p className="text-xs text-[#D43B68]">{error}</p>}

            <div className="flex items-center justify-end gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-[#E8DFE6] text-sm font-medium text-[#6B5570] hover:text-[#38243E] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 rounded-xl bg-[#E84D79] hover:bg-[#D43B68] disabled:opacity-50 text-white text-sm font-medium transition-colors cursor-pointer"
              >
                {submitting ? "Submitting..." : "Submit Feedback"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
