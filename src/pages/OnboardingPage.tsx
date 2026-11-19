import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { updateUserProfile } from "../lib/firebase";
import {
  AGE_RANGES,
  BUDGET_PREFERENCES,
  COMMON_OWNED_PRODUCTS,
  HAIR_TYPES,
  KOLKATA_AREAS,
  MAKEUP_CONCERNS,
  MAKEUP_PREFERENCES,
  SKIN_CONCERNS,
  HAIR_CONCERNS,
  SKIN_TYPES,
  type OwnedProduct,
} from "../types/glamguard";

const ALL_CONCERN_CHIPS = [
  ...MAKEUP_CONCERNS.slice(0, 3),
  ...SKIN_CONCERNS.slice(0, 3),
  ...HAIR_CONCERNS.slice(0, 3),
];

export function OnboardingPage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2 | 3>(1);
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
  const [customProductName, setCustomProductName] = useState("");
  const [customProductCat, setCustomProductCat] =
    useState<OwnedProduct["category"]>("Skincare");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (profile) {
      setName((prev) => prev || profile.name || "");
      setAgeRange((prev) => prev || profile.ageRange || "");
      setLocation((prev) => prev || profile.location || "");
      setSkinType((prev) => prev || profile.skinType || "");
      setHairType((prev) => prev || profile.hairType || "");
      setMakeupPreference((prev) => prev || profile.makeupPreference || "");
      setBudgetPreference((prev) => prev || profile.budgetPreference || "Affordable");
      setProductPreferences((prev) => prev || profile.productPreferences || "");
      if (profile.beautyConcerns?.length && beautyConcerns.length === 0) {
        setBeautyConcerns(profile.beautyConcerns);
      }
      if (profile.existingProducts?.length && existingProducts.length === 0) {
        setExistingProducts(profile.existingProducts);
      }
    }
  }, [profile]);

  const toggleConcern = (concern: string) => {
    setBeautyConcerns((prev) =>
      prev.includes(concern) ? prev.filter((c) => c !== concern) : [...prev, concern].slice(0, 15)
    );
  };

  const toggleCommonProduct = (prod: { name: string; category: OwnedProduct["category"] }) => {
    setExistingProducts((prev) => {
      const exists = prev.some((p) => p.name.toLowerCase() === prod.name.toLowerCase());
      if (exists) {
        return prev.filter((p) => p.name.toLowerCase() !== prod.name.toLowerCase());
      }
      return [
        ...prev,
        {
          id: `prod_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          name: prod.name,
          category: prod.category,
        },
      ];
    });
  };

  const addCustomProduct = () => {
    if (!customProductName.trim()) return;
    setExistingProducts((prev) => [
      ...prev,
      {
        id: `prod_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        name: customProductName.trim(),
        category: customProductCat,
      },
    ]);
    setCustomProductName("");
  };

  const removeProduct = (id: string) => {
    setExistingProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const finishOnboarding = async () => {
    if (!user) return;
    setSaving(true);
    setError("");
    try {
      await updateUserProfile(user.uid, {
        name: name.trim() || profile?.name || user.displayName || "GlamGuard User",
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
      navigate("/dashboard", { replace: true });
    } catch {
      setError("Could not save your preferences right now. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F9] py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between gap-4 mb-6">
          <span className="font-display text-2xl font-semibold text-[#38243E]">
            Glam<span className="text-[#E84D79]">Guard</span>
          </span>
          <button
            type="button"
            onClick={finishOnboarding}
            disabled={saving}
            className="text-xs sm:text-sm font-medium text-[#6B5570] hover:text-[#38243E] cursor-pointer"
          >
            Skip for now
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs font-medium text-[#6B5570] mb-2">
            <span>Personalize your GlamGuard profile</span>
            <span className="tabular-nums">Step {step} of 3</span>
          </div>
          <div className="h-1.5 rounded-full bg-[#E8DFE6] overflow-hidden">
            <div
              className="h-full bg-[#E84D79] transition-all duration-200"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-white border border-[#E8DFE6] rounded-2xl p-6 sm:p-8">
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-[#E84D79]/10 border border-[#E84D79]/30 text-sm text-[#38243E]">
              {error}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h1 className="font-display text-2xl sm:text-3xl font-semibold text-[#38243E] mb-1.5">
                  Tell us a little about you
                </h1>
                <p className="text-sm text-[#6B5570]">
                  Everything is optional—skip anything you prefer not to share.
                </p>
              </div>

              <div>
                <label htmlFor="ob-name" className="block text-xs font-semibold text-[#38243E] mb-1.5">
                  Your name
                </label>
                <input
                  id="ob-name"
                  type="text"
                  maxLength={100}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="How should we greet you?"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DFE6] text-sm text-[#38243E] focus:border-[#E84D79] focus:outline-none"
                />
              </div>

              <div>
                <p className="text-xs font-semibold text-[#38243E] mb-2">Age range</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {AGE_RANGES.map((age) => (
                    <button
                      key={age}
                      type="button"
                      onClick={() => setAgeRange(ageRange === age ? "" : age)}
                      className={`py-2.5 px-3 rounded-xl border text-sm font-medium transition-colors cursor-pointer ${
                        ageRange === age
                          ? "border-[#E84D79] bg-[#E84D79]/10 text-[#38243E] font-semibold"
                          : "border-[#E8DFE6] text-[#6B5570] hover:border-[#38243E]/40"
                      }`}
                    >
                      {age}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label
                  htmlFor="ob-location"
                  className="block text-xs font-semibold text-[#38243E] mb-1.5"
                >
                  Area in Kolkata (helps tailor commute &amp; weather context)
                </label>
                <select
                  id="ob-location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DFE6] text-sm text-[#38243E] bg-white focus:border-[#E84D79] focus:outline-none"
                >
                  <option value="">Select area (optional)</option>
                  {KOLKATA_AREAS.map((area) => (
                    <option key={area} value={area}>
                      {area}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h1 className="font-display text-2xl sm:text-3xl font-semibold text-[#38243E] mb-1.5">
                  Your beauty preferences
                </h1>
                <p className="text-sm text-[#6B5570]">
                  These are your self-reported preferences so we suggest steps that suit your style—not
                  a medical or skin diagnosis.
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-[#38243E] mb-2">Skin type (self-reported)</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {SKIN_TYPES.map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setSkinType(skinType === st ? "" : st)}
                      className={`py-2.5 px-3 rounded-xl border text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                        skinType === st
                          ? "border-[#E84D79] bg-[#E84D79]/10 text-[#38243E] font-semibold"
                          : "border-[#E8DFE6] text-[#6B5570] hover:border-[#38243E]/40"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-[#38243E] mb-2">Hair type or texture</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {HAIR_TYPES.map((ht) => (
                    <button
                      key={ht}
                      type="button"
                      onClick={() => setHairType(hairType === ht ? "" : ht)}
                      className={`py-2.5 px-3 rounded-xl border text-xs sm:text-sm font-medium text-left transition-colors cursor-pointer ${
                        hairType === ht
                          ? "border-[#E84D79] bg-[#E84D79]/10 text-[#38243E] font-semibold"
                          : "border-[#E8DFE6] text-[#6B5570] hover:border-[#38243E]/40"
                      }`}
                    >
                      {ht}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-[#38243E] mb-2">Makeup preference</p>
                <div className="flex flex-wrap gap-2">
                  {MAKEUP_PREFERENCES.map((mp) => (
                    <button
                      key={mp}
                      type="button"
                      onClick={() => setMakeupPreference(makeupPreference === mp ? "" : mp)}
                      className={`py-2 px-3.5 rounded-xl border text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                        makeupPreference === mp
                          ? "border-[#E84D79] bg-[#E84D79]/10 text-[#38243E] font-semibold"
                          : "border-[#E8DFE6] text-[#6B5570] hover:border-[#38243E]/40"
                      }`}
                    >
                      {mp}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-[#38243E] mb-2">
                  Usual concerns (select any)
                </p>
                <div className="flex flex-wrap gap-2">
                  {ALL_CONCERN_CHIPS.map((c) => (
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
                <p className="text-xs font-semibold text-[#38243E] mb-2">
                  Preferred product budget
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {BUDGET_PREFERENCES.map((bp) => (
                    <button
                      key={bp.value}
                      type="button"
                      onClick={() => setBudgetPreference(bp.value)}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-medium text-left transition-colors cursor-pointer ${
                        budgetPreference === bp.value
                          ? "border-[#E84D79] bg-[#E84D79]/10 text-[#38243E] font-semibold"
                          : "border-[#E8DFE6] text-[#6B5570] hover:border-[#38243E]/40"
                      }`}
                    >
                      {bp.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label
                  htmlFor="ob-sensitivities"
                  className="block text-xs font-semibold text-[#38243E] mb-1.5"
                >
                  Preferences or sensitivities (optional)
                </label>
                <input
                  id="ob-sensitivities"
                  type="text"
                  maxLength={500}
                  value={productPreferences}
                  onChange={(e) => setProductPreferences(e.target.value)}
                  placeholder="e.g., Prefer fragrance-free, avoid heavy oils, sensitive around eyes"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DFE6] text-sm text-[#38243E] focus:border-[#E84D79] focus:outline-none"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h1 className="font-display text-2xl sm:text-3xl font-semibold text-[#38243E] mb-1.5">
                  What products do you already own?
                </h1>
                <p className="text-sm text-[#6B5570]">
                  We always prioritize what is already in your bag before suggesting anything new.
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-[#38243E] mb-2">Tap to add staples</p>
                <div className="flex flex-wrap gap-2">
                  {COMMON_OWNED_PRODUCTS.map((item) => {
                    const selected = existingProducts.some(
                      (p) => p.name.toLowerCase() === item.name.toLowerCase()
                    );
                    return (
                      <button
                        key={item.name}
                        type="button"
                        onClick={() => toggleCommonProduct(item)}
                        className={`py-2 px-3.5 rounded-xl border text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                          selected
                            ? "border-[#E84D79] bg-[#E84D79]/10 text-[#38243E] font-semibold"
                            : "border-[#E8DFE6] text-[#6B5570] hover:border-[#38243E]/40"
                        }`}
                      >
                        {selected ? "✓ " : "+ "}
                        {item.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-[#E8DFE6]">
                <p className="text-xs font-semibold text-[#38243E] mb-2">
                  Add a specific product you own
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    maxLength={100}
                    value={customProductName}
                    onChange={(e) => setCustomProductName(e.target.value)}
                    placeholder="e.g., Maybelline Fit Me Compact, Aloe gel"
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-[#E8DFE6] text-sm text-[#38243E] focus:border-[#E84D79] focus:outline-none"
                  />
                  <select
                    value={customProductCat}
                    onChange={(e) =>
                      setCustomProductCat(e.target.value as OwnedProduct["category"])
                    }
                    className="px-3 py-2.5 rounded-xl border border-[#E8DFE6] text-sm text-[#38243E] bg-white focus:border-[#E84D79] focus:outline-none"
                  >
                    <option value="Skincare">Skincare</option>
                    <option value="Makeup">Makeup</option>
                    <option value="Haircare">Haircare</option>
                    <option value="Tool / Other">Tool / Other</option>
                  </select>
                  <button
                    type="button"
                    onClick={addCustomProduct}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#38243E] hover:bg-[#29182E] text-white text-sm font-medium cursor-pointer"
                  >
                    <Plus className="w-4 h-4" aria-hidden="true" />
                    <span>Add</span>
                  </button>
                </div>
              </div>

              {existingProducts.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-[#6B5570]">
                    Your beauty bag ({existingProducts.length})
                  </p>
                  <ul className="divide-y divide-[#E8DFE6] border border-[#E8DFE6] rounded-xl">
                    {existingProducts.map((p) => (
                      <li
                        key={p.id}
                        className="px-3.5 py-2.5 flex items-center justify-between gap-3 text-sm"
                      >
                        <div>
                          <span className="font-medium text-[#38243E]">{p.name}</span>
                          <span className="text-xs text-[#6B5570] ml-2">· {p.category}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeProduct(p.id)}
                          aria-label={`Remove ${p.name}`}
                          className="p-1.5 text-[#6B5570] hover:text-[#E84D79] cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Navigation Controls */}
          <div className="mt-8 pt-5 border-t border-[#E8DFE6] flex items-center justify-between gap-4">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => (s === 3 ? 2 : 1))}
                className="px-4 py-2.5 rounded-xl border border-[#E8DFE6] text-sm font-medium text-[#38243E] hover:border-[#38243E] cursor-pointer"
              >
                Back
              </button>
            ) : (
              <span />
            )}

            <div className="flex items-center gap-3">
              {step < 3 ? (
                <button
                  type="button"
                  onClick={() => setStep((s) => (s === 1 ? 2 : 3))}
                  className="px-6 py-2.5 rounded-xl bg-[#E84D79] hover:bg-[#D43B68] text-white text-sm font-semibold transition-colors cursor-pointer"
                >
                  Continue
                </button>
              ) : (
                <button
                  type="button"
                  disabled={saving}
                  onClick={finishOnboarding}
                  className="px-6 py-2.5 rounded-xl bg-[#E84D79] hover:bg-[#D43B68] disabled:opacity-50 text-white text-sm font-semibold transition-colors cursor-pointer"
                >
                  {saving ? "Saving Profile..." : "Finish & Go to Dashboard"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
