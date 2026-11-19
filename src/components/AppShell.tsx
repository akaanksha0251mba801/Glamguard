import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { BookmarkCheck, Home, LogOut, Sparkles, UserRound } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Home", mobileLabel: "Home", icon: Home },
  { to: "/rescue-plan", label: "Beauty Rescue Plan", mobileLabel: "Rescue Plan", icon: Sparkles },
  { to: "/plans", label: "My Plans", mobileLabel: "My Plans", icon: BookmarkCheck },
  { to: "/profile", label: "My Beauty Profile", mobileLabel: "Profile", icon: UserRound },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { logout, profile, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const firstName = (profile?.name || user?.displayName || "").split(" ")[0];

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F9] text-[#38243E]">
      {/* Top Bar Contract: [Brand wordmark] — [4 nav links] — [1 primary/account action] */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-[#E8DFE6]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-8">
          <Link
            to="/dashboard"
            className="font-display text-2xl font-semibold tracking-tight text-[#38243E] whitespace-nowrap shrink-0"
          >
            Glam<span className="text-[#E84D79]">Guard</span>
          </Link>

          <nav
            aria-label="Main navigation"
            className="hidden md:flex items-center gap-7 text-sm font-medium"
          >
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors ${
                    isActive
                      ? "border-[#E84D79] text-[#38243E] font-semibold"
                      : "border-transparent text-[#6B5570] hover:text-[#38243E]"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-4 shrink-0">
            {firstName && (
              <Link
                to="/profile"
                className="hidden lg:inline-block text-sm font-medium text-[#6B5570] hover:text-[#38243E] whitespace-nowrap truncate max-w-[140px]"
              >
                {firstName}
              </Link>
            )}
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#E8DFE6] text-xs font-semibold text-[#38243E] hover:border-[#38243E] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Log out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 pb-20 md:pb-12">{children}</main>

      <footer className="hidden md:block border-t border-[#E8DFE6] bg-white py-6">
        <div className="max-w-6xl mx-auto px-6 flex flex-wrap items-center justify-between gap-4 text-xs text-[#6B5570]">
          <div className="flex items-center gap-2">
            <span className="font-display font-semibold text-[#38243E] text-sm">GlamGuard</span>
            <span aria-hidden="true">·</span>
            <span>Personalized beauty guidance for everyday life in Kolkata</span>
          </div>
          <p>
            General beauty &amp; styling guidance only — not medical or dermatological diagnosis.
          </p>
        </div>
      </footer>

      {/* Mobile Bottom Navigation (compact <= 15% viewport, >= 44px touch targets) */}
      <nav
        aria-label="Mobile navigation"
        className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-[#E8DFE6]"
      >
        <div className="grid grid-cols-4 h-16">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors min-h-[44px] ${
                    isActive ? "text-[#E84D79] font-semibold" : "text-[#6B5570]"
                  }`
                }
              >
                <Icon className="w-4 h-4" aria-hidden="true" />
                <span className="whitespace-nowrap">{item.mobileLabel}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
