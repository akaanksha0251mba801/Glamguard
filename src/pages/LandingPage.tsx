import { Link } from "react-router-dom";
import { ArrowRight, Check, Clock, ShieldCheck, Sparkles } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useVentureData } from "../hooks/useVentureData";
import { EditorialImage } from "../components/EditorialImage";

const COMMON_SITUATIONS = [
  {
    title: "Makeup melting during a long outing",
    detail: "Stop foundation separation and patchy concealer in warm, humid air without washing everything off.",
  },
  {
    title: "Oily-looking skin after college",
    detail: "Reset shine across your T-zone between lectures, metro commutes, and evening plans.",
  },
  {
    title: "Frizzy hair in humid weather",
    detail: "Smooth flyaways and restore shape after an auto ride or outdoor walk in minutes.",
  },
  {
    title: "Dull-looking skin before an event",
    detail: "Bring back fresh brightness before a wedding function, dinner, or Durga Puja outing.",
  },
  {
    title: "Last-minute makeup touch-ups",
    detail: "Five-minute desk or washroom fixes using the compact, tint, or serum already in your bag.",
  },
];

export function LandingPage() {
  const { user } = useAuth();
  const { venture } = useVentureData();

  const coreMessage =
    venture?.mission9?.coreMessage ||
    "Personalized beauty rescue plans for your skin, hair and makeup, whenever you need them.";
  const priorityGeography =
    venture?.mission0?.geography ||
    "New Town, Salt Lake, Park Street, Ballygunge, Gariahat and South Kolkata.";
  const alternatives = venture?.mission5?.alternatives || [];
  const proposedPrice = venture?.mission7?.sellingPrice ?? 99;

  return (
    <div className="min-h-screen bg-[#FAF7F9] text-[#38243E]">
      {/* Top Bar Contract: [Brand wordmark] — [Nav links] — [Primary CTA] */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-[#E8DFE6]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
          <Link
            to="/"
            className="font-display text-2xl font-semibold tracking-tight text-[#38243E] whitespace-nowrap shrink-0"
          >
            Glam<span className="text-[#E84D79]">Guard</span>
          </Link>

          <nav
            aria-label="Landing navigation"
            className="hidden md:flex items-center gap-7 text-sm font-medium text-[#6B5570]"
          >
            <a
              href="#how-it-works"
              className="hover:text-[#38243E] transition-colors whitespace-nowrap shrink-0"
            >
              How It Works
            </a>
            <a
              href="#situations"
              className="hover:text-[#38243E] transition-colors whitespace-nowrap shrink-0"
            >
              Situations
            </a>
            <a
              href="#philosophy"
              className="hover:text-[#38243E] transition-colors whitespace-nowrap shrink-0"
            >
              Why GlamGuard
            </a>
            <a
              href="#pricing"
              className="hover:text-[#38243E] transition-colors whitespace-nowrap shrink-0"
            >
              Pricing
            </a>
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            {user ? (
              <Link
                to="/dashboard"
                className="px-4 py-2 rounded-xl bg-[#E84D79] hover:bg-[#D43B68] text-white text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0"
              >
                Open Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-xs sm:text-sm font-medium text-[#38243E] hover:text-[#E84D79] transition-colors whitespace-nowrap shrink-0 px-2 py-1"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 rounded-xl bg-[#E84D79] hover:bg-[#D43B68] text-white text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-16 sm:pt-14 sm:pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
          <div className="lg:col-span-6 flex flex-col justify-center py-2">
            <p className="text-xs sm:text-sm font-medium text-[#E84D79] mb-4">
              Built for Kolkata · New Town, Salt Lake, Park Street, Ballygunge &amp; Gariahat
            </p>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.5rem] font-semibold leading-[1.08] tracking-tight text-[#38243E] text-balance mb-5">
              Your Beauty Emergency? We&apos;ve Got You.
            </h1>
            <p className="text-base sm:text-lg text-[#6B5570] leading-relaxed max-w-xl mb-8">
              {coreMessage}
            </p>

            <div className="flex flex-wrap items-center gap-3.5">
              <Link
                to={user ? "/rescue-plan" : "/signup"}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#E84D79] hover:bg-[#D43B68] text-white text-sm sm:text-base font-medium transition-colors whitespace-nowrap"
              >
                <span>Get My Beauty Rescue Plan</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center px-5 py-3.5 rounded-xl border border-[#E8DFE6] bg-white hover:border-[#38243E] text-[#38243E] text-sm sm:text-base font-medium transition-colors whitespace-nowrap"
              >
                How It Works
              </a>
            </div>

            <div className="mt-8 pt-6 border-t border-[#E8DFE6] flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[#6B5570]">
              <span>Uses products you already own</span>
              <span aria-hidden="true">·</span>
              <span>Respects 5–30 min time limits</span>
              <span aria-hidden="true">·</span>
              <span>College, office, Durga Puja &amp; weddings</span>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="h-full min-h-[300px] sm:min-h-[380px] rounded-2xl overflow-hidden border border-[#E8DFE6] bg-white">
              <EditorialImage
                src="/src/assets/images/hero_glamguard_editorial_1795076643933.jpg"
                alt="Young Indian woman with fresh natural makeup smiling in warm Kolkata window light"
                fallbackTitle="Fresh, humid-weather ready beauty"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Common Beauty Situations */}
      <section id="situations" className="bg-white border-y border-[#E8DFE6] py-14 sm:py-18">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mb-10">
            <p className="text-xs font-medium text-[#E84D79] mb-2">Real-Life Emergencies</p>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#38243E] text-balance">
              Made for the exact moments Kolkata weather catches you off guard.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {COMMON_SITUATIONS.map((item, idx) => (
              <Link
                key={item.title}
                to={user ? "/rescue-plan" : "/signup"}
                className="group p-6 rounded-2xl border border-[#E8DFE6] bg-[#FAF7F9] hover:border-[#E84D79] transition-colors flex flex-col justify-between gap-4"
              >
                <div>
                  <span className="text-xs font-semibold text-[#E84D79] tabular-nums">
                    0{idx + 1}
                  </span>
                  <h3 className="text-base font-semibold text-[#38243E] mt-2 mb-2 group-hover:text-[#E84D79] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-sm text-[#6B5570] leading-relaxed">{item.detail}</p>
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#38243E]">
                  Create plan <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </span>
              </Link>
            ))}

            <div className="p-6 rounded-2xl bg-[#38243E] text-white flex flex-col justify-between gap-4">
              <div>
                <Sparkles className="w-5 h-5 text-[#E84D79] mb-3" aria-hidden="true" />
                <h3 className="font-display text-xl font-semibold mb-2">
                  Focused on Kolkata neighborhoods
                </h3>
                <p className="text-sm text-white/80 leading-relaxed">{priorityGeography}</p>
              </div>
              <Link
                to={user ? "/rescue-plan" : "/signup"}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#E84D79] hover:underline"
              >
                Start your rescue plan <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          <div className="lg:col-span-5">
            <div className="h-full min-h-[280px] rounded-2xl overflow-hidden border border-[#E8DFE6] bg-white">
              <EditorialImage
                src="/src/assets/images/beauty_kit_flatlay_1795076644410.jpg"
                alt="Minimalist beauty rescue kit flatlay with compact powder, hydrating mist, lip balm, hair serum, and blotting papers"
                fallbackTitle="Your everyday beauty bag, put to work"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="lg:col-span-7 flex flex-col justify-center">
            <p className="text-xs font-medium text-[#E84D79] mb-2">How It Works</p>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#38243E] text-balance mb-8">
              Three quick steps from beauty panic to sorted.
            </h2>

            <div className="divide-y divide-[#E8DFE6] border-y border-[#E8DFE6]">
              {[
                {
                  num: "01",
                  title: "Tell us your beauty concern.",
                  desc: "Pick makeup melting, oily shine, frizzy hair, dullness, or describe what is happening in your own words.",
                },
                {
                  num: "02",
                  title: "Share your occasion and available time.",
                  desc: "College day, office, Durga Puja, or a wedding—plus whether you have 5 minutes or 30, and what products are in your bag.",
                },
                {
                  num: "03",
                  title: "Get your personalized rescue plan.",
                  desc: "Receive clear, timed steps prioritizing products you already own, quick emergency fixes, and what to avoid.",
                },
              ].map((step) => (
                <div key={step.num} className="py-5 flex items-start gap-5">
                  <span className="font-display text-2xl font-semibold text-[#E84D79] tabular-nums shrink-0">
                    {step.num}
                  </span>
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-[#38243E] mb-1">
                      {step.title}
                    </h3>
                    <p className="text-sm text-[#6B5570] leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Quick, Practical & Affordable Philosophy */}
      <section id="philosophy" className="bg-[#38243E] text-white py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          <div className="lg:col-span-7 flex flex-col justify-center">
            <p className="text-xs font-medium text-[#E84D79] mb-2">
              Quick · Practical · Affordable
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-balance mb-5">
              Built for real emergencies—not another shopping catalog or salon booking queue.
            </h2>
            <p className="text-sm sm:text-base text-white/80 leading-relaxed mb-6 max-w-2xl">
              {venture?.mission0?.problemSolved ||
                "Existing beauty platforms focus on product shopping or booking appointments rather than solving an immediate, situation-specific problem."}
            </p>

            {alternatives.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-7">
                {alternatives.map((alt) => (
                  <div
                    key={alt.id}
                    className="p-4 rounded-xl bg-white/5 border border-white/15 text-xs"
                  >
                    <p className="font-semibold text-white mb-1">{alt.name}</p>
                    <p className="text-white/70 leading-relaxed">{alt.mainWeakness}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-4 border-t border-white/15">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-[#E84D79] shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <h3 className="text-sm font-semibold mb-1">Time-guaranteed routines</h3>
                  <p className="text-xs text-white/75 leading-relaxed">
                    Select 5, 10, 15, or 30 minutes—your plan never goes over your clock.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-[#E84D79] shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <h3 className="text-sm font-semibold mb-1">Honest, non-medical guidance</h3>
                  <p className="text-xs text-white/75 leading-relaxed">
                    Tailored to your self-reported preferences without fake skin scans or unsafe
                    DIY hacks.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="h-full min-h-[280px] rounded-2xl overflow-hidden border border-white/15">
              <EditorialImage
                src="/src/assets/images/festive_evening_glow_1795076644021.jpg"
                alt="Young woman in Kolkata outdoors at twilight with fresh dewy makeup and glossy hair"
                fallbackTitle="Ready for Kolkata evenings"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Proposed Freemium & Premium Presentation */}
      <section id="pricing" className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <p className="text-xs font-medium text-[#E84D79] mb-2">
            Proposed Freemium Model · Pilot Testing
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#38243E] text-balance mb-3">
            Start free. Help shape our proposed ₹{proposedPrice}/month plan.
          </h2>
          <p className="text-sm text-[#6B5570]">
            No payment gateway or subscription billing is active during this pilot—we are testing
            what works best for you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div className="bg-white border border-[#E8DFE6] rounded-2xl p-7 flex flex-col justify-between">
            <div>
              <p className="text-xs font-semibold text-[#6B5570] mb-1">Free Access</p>
              <h3 className="font-display text-2xl font-semibold text-[#38243E] mb-4">
                ₹0 <span className="text-sm font-sans font-normal text-[#6B5570]">/ pilot</span>
              </h3>
              <ul className="space-y-2.5 text-sm text-[#38243E] mb-7">
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#E84D79] shrink-0 mt-0.5" aria-hidden="true" />
                  <span>Personalized situation-based Beauty Rescue Plans</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#E84D79] shrink-0 mt-0.5" aria-hidden="true" />
                  <span>Beauty Profile &amp; owned product bag tracker</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#E84D79] shrink-0 mt-0.5" aria-hidden="true" />
                  <span>Save and reopen your rescue plans anytime</span>
                </li>
              </ul>
            </div>
            <Link
              to={user ? "/dashboard" : "/signup"}
              className="block text-center py-3 px-4 rounded-xl border border-[#38243E] text-sm font-semibold text-[#38243E] hover:bg-[#38243E] hover:text-white transition-colors"
            >
              {user ? "Go to Dashboard" : "Create Free Account"}
            </Link>
          </div>

          <div className="bg-white border-2 border-[#E84D79] rounded-2xl p-7 flex flex-col justify-between">
            <div>
              <p className="text-xs font-semibold text-[#E84D79] mb-1">
                Proposed Plus Tier · Being Tested
              </p>
              <h3 className="font-display text-2xl font-semibold text-[#38243E] mb-4">
                ₹{proposedPrice}{" "}
                <span className="text-sm font-sans font-normal text-[#6B5570]">
                  / month (proposed)
                </span>
              </h3>
              <ul className="space-y-2.5 text-sm text-[#38243E] mb-7">
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#E84D79] shrink-0 mt-0.5" aria-hidden="true" />
                  <span>Continued unlimited personalized beauty guidance</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#E84D79] shrink-0 mt-0.5" aria-hidden="true" />
                  <span>Full saved history across festivals, college &amp; workdays</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#E84D79] shrink-0 mt-0.5" aria-hidden="true" />
                  <span>Share your willingness-to-pay inside the app (no charge today)</span>
                </li>
              </ul>
            </div>
            <Link
              to={user ? "/profile" : "/signup"}
              className="block text-center py-3 px-4 rounded-xl bg-[#E84D79] hover:bg-[#D43B68] text-white text-sm font-semibold transition-colors"
            >
              {user ? "Share Pricing Feedback" : "Try GlamGuard Free"}
            </Link>
          </div>
        </div>
      </section>

      {/* Quiet Footer */}
      <footer className="border-t border-[#E8DFE6] bg-white py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#6B5570]">
          <div className="flex items-center gap-2.5">
            <span className="font-display text-lg font-semibold text-[#38243E]">
              Glam<span className="text-[#E84D79]">Guard</span>
            </span>
            <span aria-hidden="true">·</span>
            <span>Kolkata Beauty-Tech MVP</span>
          </div>
          <div className="flex items-center gap-5">
            <Link to="/login" className="hover:text-[#38243E]">
              Log in
            </Link>
            <Link to="/signup" className="hover:text-[#38243E]">
              Sign up
            </Link>
            <span>Non-medical beauty guidance only</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
