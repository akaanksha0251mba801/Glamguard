import React, { useEffect, useState } from "react";
import { CheckCircle2, Pencil, Plus, Trash2 } from "lucide-react";
import { AppShell } from "../components/AppShell";
import { PricingValidationCard } from "../components/PricingValidationCard";
import { useAuth } from "../contexts/AuthContext";
import {
  listUserFeedback,
  listUserPricingResponses,
  updateUserProfile,
} from "../lib/firebase";
import {
  AGE_RANGES,
  BUDGET_PREFERENCES,
  HAIR_CONCERNS,
  HAIR_TYPES,
  KOLKATA_AREAS,
  MAKEUP_CONCERNS,
  MAKEUP_PREFERENCES,
  SKIN_CONCERNS,
  SKIN_TYPES,
  type OwnedProduct,
  type PlanFeedback,
  type PricingResponse,
} from "../types/glamguard";

const CONCERN_OPTIONS = [
  ...MAKEUP_CONCERNS.slice(0, 4),
  ...SKIN_CONCERNS.slice(0, 4),
  ...HAIR_CONCERNS.slice(0, 4),
];

export function ProfilePage() {
  const { user, profile } = useAuth();

  const [name, setName] = useState("");
  const [ageRange, setAgeRange] = useState("");
  const [location, setLocation] = useState("");
  const [skinType, setSkinType] = useState("");
  const [hairType, setHairType] = useState("");
  const [makeupPreference, setMakeupPreference] = useState("");
  const [beautyConcerns, setBeautyConcerns] = useState<string[]>([]);
  const [budgetPreference, setBudgetPreference] = useState("Affordable");
  const [productPreferences, setProductPreferences] = useState("");
  const [existingProducts, setExistingProducts] = useState<OwnedProduct[]>([]);

  const [newProdName, setNewProdName] = useState("");
  const [newProdCat, setNewProdCat] = useState<OwnedProduct["category"]>("Skincare");
  const [editingProdId, setEditingProdId] = useState<string | null>(null);
  const [editingProdName, setEditingProdName] = useState("");

  const [saving, setSaving] = useState(false);
  const [savedBanner, setSavedBanner] = useState(false);
  const [error, setError] = useState("");
  const [hydrated, setHydrated] = useState(false);

  const [feedbackHistory, setFeedbackHistory] = useState<PlanFeedback[]>([]);
  const [pricingHistory, setPricingHistory] = useState<PricingResponse[]>([]);

  useEffect(() => {
    if (profile && !hydrated) {
      setName(profile.name || "");
      setAgeRange(profile.ageRange || "");
      setLocation(profile.location || "");
      setSkinType(profile.skinType || "");
      setHairType(profile.hairType || "");
      setMakeupPreference(profile.makeupPreference || "");
      setBeautyConcerns(profile.beautyConcerns || []);
      setBudgetPreference(profile.budgetPreference || "Affordable");
      setProductPreferences(profile.productPreferences || "");
      setExistingProducts(profile.existingProducts || []);
      setHydrated(true);
    }
  }, [profile, hydrated]);

  useEffect(() => {
    if (!user) return;
    let active = true;
    Promise.all([listUserFeedback(user.uid), listUserPricingResponses(user.uid)])
      .then(([fb, pr]) => {
        if (active) {
          setFeedbackHistory(fb);
          setPricingHistory(pr);
        }
      })
      .catch((err) => {
        console.error("Could not load pilot responses:", err);
      });
    return () => {
      active = false;
    };
  }, [user]);

  const toggleConcern = (c: string) => {
    setBeautyConcerns((prev) =>
      prev.includes(c) ? prev.filter((item) => item !== c) : [...prev, c].slice(0, 15)
    );
  };

  const handleAddProduct = () => {
    if (!newProdName.trim()) return;
    setExistingProducts((prev) => [
      ...prev,
      {
        id: `prod_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        name: newProdName.trim(),
        category: newProdCat,
      },
    ]);
    setNewProdName("");
  };

  const startEditProduct = (p: OwnedProduct) => {
    setEditingProdId(p.id);
    setEditingProdName(p.name);
  };

  const saveEditProduct = (id: string) => {
    if (!editingProdName.trim()) return;
    setExistingProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, name: editingProdName.trim() } : p))
    );
    setEditingProdId(null);
    setEditingProdName("");
  };

  const removeProduct = (id: string) => {
    setExistingProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setSavedBanner(false);
    setError("");
    try {
      await updateUserProfile(user.uid, {
        name: name.trim() || profile?.name || "GlamGuard User",
        ageRange,
        location,
        skinType,
        hairType,
        makeupPreference,
        beautyConcerns,
        budgetPreference,
        existingProducts,
        productPreferences,
        onboardingCompleted: true,
      });
      setSavedBanner(true);
    } catch {
      setError("Could not update your profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8">
        <div>
          <p className="text-xs font-medium text-[#E84D79] mb-1">Personal Preferences</p>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#38243E]">
            My Beauty Profile
          </h1>
          <p className="text-sm text-[#6B5570] mt-1">
            Update only what you want—every field is optional and helps personalize future Beauty
            Rescue Plans.
          </p>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-[#E84D79]/10 border border-[#E84D79]/30 text-sm text-[#38243E]">
              {error}
            </div>
          )}

          {savedBanner && (
            <div className="p-4 rounded-xl bg-white border border-[#E84D79] flex items-center gap-2.5 text-sm text-[#38243E]">
              <CheckCircle2 className="w-5 h-5 text-[#E84D79] shrink-0" aria-hidden="true" />
              <span>Your Beauty Profile has been saved to your account.</span>
            </div>
          )}

          {/* Basic Info */}
          <section className="bg-white border border-[#E8DFE6] rounded-2xl p-6 sm:p-7 space-y-4">
            <h2 className="font-display text-xl font-semibold text-[#38243E]">
              Basic Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="prof-name" className="block text-xs font-semibold text-[#38243E] mb-1.5">
                  Name
                </label>
                <input
                  id="prof-name"
                  type="text"
                  maxLength={100}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DFE6] text-sm text-[#38243E] focus:border-[#E84D79] focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="prof-email" className="block text-xs font-semibold text-[#38243E] mb-1.5">
                  Email
                </label>
                <input
                  id="prof-email"
                  type="email"
                  disabled
                  value={profile?.email || user?.email || ""}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DFE6] bg-[#FAF7F9] text-sm text-[#6B5570]"
                />
              </div>

              <div>
                <label htmlFor="prof-location" className="block text-xs font-semibold text-[#38243E] mb-1.5">
                  Kolkata Area
                </label>
                <select
                  id="prof-location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DFE6] text-sm text-[#38243E] bg-white focus:border-[#E84D79] focus:outline-none"
                >
                  <option value="">Not specified</option>
                  {KOLKATA_AREAS.map((area) => (
                    <option key={area} value={area}>
                      {area}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="prof-age" className="block text-xs font-semibold text-[#38243E] mb-1.5">
                  Age Range
                </label>
                <select
                  id="prof-age"
                  value={ageRange}
                  onChange={(e) => setAgeRange(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DFE6] text-sm text-[#38243E] bg-white focus:border-[#E84D79] focus:outline-none"
                >
                  <option value="">Not specified</option>
                  {AGE_RANGES.map((age) => (
                    <option key={age} value={age}>
                      {age}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* Beauty Preferences */}
          <section className="bg-white border border-[#E8DFE6] rounded-2xl p-6 sm:p-7 space-y-5">
            <div>
              <h2 className="font-display text-xl font-semibold text-[#38243E]">
                Beauty Preferences
              </h2>
              <p className="text-xs text-[#6B5570] mt-0.5">
                Self-reported preferences only—never treated as a medical skin assessment.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="prof-skin" className="block text-xs font-semibold text-[#38243E] mb-1.5">
                  Skin Type
                </label>
                <select
                  id="prof-skin"
                  value={skinType}
                  onChange={(e) => setSkinType(e.target.value)}
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
                <label htmlFor="prof-hair" className="block text-xs font-semibold text-[#38243E] mb-1.5">
                  Hair Type / Texture
                </label>
                <select
                  id="prof-hair"
                  value={hairType}
                  onChange={(e) => setHairType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DFE6] text-sm text-[#38243E] bg-white focus:border-[#E84D79] focus:outline-none"
                >
                  <option value="">Not specified</option>
                  {HAIR_TYPES.map((ht) => (
                    <option key={ht} value={ht}>
                      {ht}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="prof-makeup" className="block text-xs font-semibold text-[#38243E] mb-1.5">
                  Makeup Preference
                </label>
                <select
                  id="prof-makeup"
                  value={makeupPreference}
                  onChange={(e) => setMakeupPreference(e.target.value)}
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

              <div>
                <label htmlFor="prof-budget" className="block text-xs font-semibold text-[#38243E] mb-1.5">
                  Budget Preference
                </label>
                <select
                  id="prof-budget"
                  value={budgetPreference}
                  onChange={(e) => setBudgetPreference(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DFE6] text-sm text-[#38243E] bg-white focus:border-[#E84D79] focus:outline-none"
                >
                  {BUDGET_PREFERENCES.map((bp) => (
                    <option key={bp.value} value={bp.value}>
                      {bp.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-[#38243E] mb-2">Usual Beauty Concerns</p>
              <div className="flex flex-wrap gap-2">
                {CONCERN_OPTIONS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => toggleConcern(c)}
                    className={`py-2 px-3 rounded-xl border text-xs font-medium transition-colors cursor-pointer ${
                      beautyConcerns.includes(c)
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
              <label htmlFor="prof-sens" className="block text-xs font-semibold text-[#38243E] mb-1.5">
                Product Preferences &amp; Sensitivities
              </label>
              <textarea
                id="prof-sens"
                rows={2}
                maxLength={500}
                value={productPreferences}
                onChange={(e) => setProductPreferences(e.target.value)}
                placeholder="e.g., Avoid heavy silicones or strong fragrance"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DFE6] text-sm text-[#38243E] focus:border-[#E84D79] focus:outline-none"
              />
            </div>
          </section>

          {/* Existing Products Manager */}
          <section className="bg-white border border-[#E8DFE6] rounded-2xl p-6 sm:p-7 space-y-4">
            <h2 className="font-display text-xl font-semibold text-[#38243E]">
              Existing Products You Own
            </h2>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                maxLength={100}
                value={newProdName}
                onChange={(e) => setNewProdName(e.target.value)}
                placeholder="Add product (e.g., Compact powder, Hair serum)"
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-[#E8DFE6] text-sm text-[#38243E] focus:border-[#E84D79] focus:outline-none"
              />
              <select
                value={newProdCat}
                onChange={(e) => setNewProdCat(e.target.value as OwnedProduct["category"])}
                className="px-3 py-2.5 rounded-xl border border-[#E8DFE6] text-sm text-[#38243E] bg-white focus:border-[#E84D79] focus:outline-none"
              >
                <option value="Skincare">Skincare</option>
                <option value="Makeup">Makeup</option>
                <option value="Haircare">Haircare</option>
                <option value="Tool / Other">Tool / Other</option>
              </select>
              <button
                type="button"
                onClick={handleAddProduct}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#38243E] hover:bg-[#29182E] text-white text-sm font-medium cursor-pointer"
              >
                <Plus className="w-4 h-4" aria-hidden="true" />
                <span>Add</span>
              </button>
            </div>

            {existingProducts.length === 0 ? (
              <p className="text-sm text-[#6B5570] py-3">
                No products listed yet. Add items you regularly keep at home or in your bag.
              </p>
            ) : (
              <ul className="divide-y divide-[#E8DFE6] border border-[#E8DFE6] rounded-xl">
                {existingProducts.map((p) => (
                  <li
                    key={p.id}
                    className="px-4 py-3 flex items-center justify-between gap-3 text-sm"
                  >
                    {editingProdId === p.id ? (
                      <div className="flex-1 flex items-center gap-2">
                        <input
                          type="text"
                          maxLength={100}
                          value={editingProdName}
                          onChange={(e) => setEditingProdName(e.target.value)}
                          className="flex-1 px-3 py-1.5 rounded-lg border border-[#E84D79] text-sm focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => saveEditProduct(p.id)}
                          className="px-3 py-1.5 rounded-lg bg-[#E84D79] text-white text-xs font-semibold cursor-pointer"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <div>
                        <span className="font-medium text-[#38243E]">{p.name}</span>
                        <span className="text-xs text-[#6B5570] ml-2">· {p.category}</span>
                      </div>
                    )}

                    {editingProdId !== p.id && (
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => startEditProduct(p)}
                          aria-label={`Edit ${p.name}`}
                          className="p-1.5 text-[#6B5570] hover:text-[#38243E] cursor-pointer"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeProduct(p.id)}
                          aria-label={`Remove ${p.name}`}
                          className="p-1.5 text-[#6B5570] hover:text-[#E84D79] cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-7 py-3 rounded-xl bg-[#E84D79] hover:bg-[#D43B68] disabled:opacity-50 text-white text-sm font-semibold transition-colors cursor-pointer"
            >
              {saving ? "Saving Changes..." : "Save Profile Changes"}
            </button>
          </div>
        </form>

        <PricingValidationCard />

        {/* Submitted Feedback & Pricing History */}
        {(feedbackHistory.length > 0 || pricingHistory.length > 0) && (
          <section className="bg-white border border-[#E8DFE6] rounded-2xl p-6 sm:p-7 space-y-5">
            <h2 className="font-display text-xl font-semibold text-[#38243E]">
              Your Submitted Pilot Feedback
            </h2>

            {pricingHistory.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-[#6B5570]">
                  ₹99/month Willingness-to-Pay Responses
                </p>
                <ul className="divide-y divide-[#E8DFE6] border border-[#E8DFE6] rounded-xl text-sm">
                  {pricingHistory.map((pr, idx) => (
                    <li key={pr.id || idx} className="px-4 py-3 flex flex-wrap justify-between gap-2">
                      <span className="font-medium text-[#38243E]">
                        Choice: {pr.willingnessToPay}
                        {pr.response ? ` — "${pr.response}"` : ""}
                      </span>
                      <span className="text-xs text-[#E84D79] font-medium tabular-nums">
                        ₹{pr.proposedPrice}/mo
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {feedbackHistory.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-[#6B5570]">
                  Plan Ratings &amp; Notes ({feedbackHistory.length})
                </p>
                <ul className="divide-y divide-[#E8DFE6] border border-[#E8DFE6] rounded-xl text-sm">
                  {feedbackHistory.map((fb, idx) => (
                    <li key={fb.id || idx} className="px-4 py-3 space-y-1">
                      <div className="flex flex-wrap items-center gap-3 text-xs text-[#6B5570] tabular-nums">
                        <span className="font-semibold text-[#38243E]">
                          Usefulness {fb.usefulness}/5
                        </span>
                        <span>·</span>
                        <span>Relevance {fb.relevance}/5</span>
                        <span>·</span>
                        <span>Ease {fb.easeOfUse}/5</span>
                        <span>·</span>
                        <span>Reuse: {fb.reuseIntent}</span>
                      </div>
                      {fb.writtenFeedback && (
                        <p className="text-xs sm:text-sm text-[#38243E]">{fb.writtenFeedback}</p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}
      </div>
    </AppShell>
  );
}
