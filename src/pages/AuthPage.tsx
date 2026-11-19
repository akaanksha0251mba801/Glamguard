import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

type AuthMode = "login" | "signup" | "forgot";

function mapFirebaseAuthError(error: unknown): string {
  const code = (error as { code?: string })?.code || "";
  switch (code) {
    case "auth/email-already-in-use":
      return "An account with this email already exists. Try logging in instead.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/weak-password":
      return "Please choose a password with at least 6 characters.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Incorrect email or password. Please check and try again.";
    case "auth/too-many-requests":
      return "Too many attempts right now. Please wait a moment and try again.";
    case "auth/operation-not-allowed":
      return "Email/Password sign-in needs to be enabled in Firebase Console (Authentication → Sign-in method → Email/Password → Enable). You can also continue with Google below.";
    case "auth/popup-closed-by-user":
      return "Google sign-in window was closed before completing.";
    default:
      return error instanceof Error ? error.message : "Authentication failed. Please try again.";
  }
}

export function AuthPage({ initialMode }: { initialMode: AuthMode }) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const { signUpWithEmail, loginWithEmail, loginWithGoogle, resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    if (mode === "signup" && !name.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (mode !== "forgot" && password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setSubmitting(true);
    try {
      if (mode === "signup") {
        await signUpWithEmail(name, email, password);
        navigate("/onboarding", { replace: true });
      } else if (mode === "login") {
        await loginWithEmail(email, password);
        navigate("/dashboard", { replace: true });
      } else {
        await resetPassword(email);
        setSuccessMsg(
          "Password reset link sent! Please check your inbox (and spam folder) to choose a new password."
        );
      }
    } catch (err) {
      setError(mapFirebaseAuthError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    setSuccessMsg("");
    setSubmitting(true);
    try {
      const { isNewUser } = await loginWithGoogle();
      navigate(isNewUser ? "/onboarding" : "/dashboard", { replace: true });
    } catch (err) {
      setError(mapFirebaseAuthError(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F9] flex flex-col justify-between px-4 py-8">
      <div className="max-w-md w-full mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#6B5570] hover:text-[#38243E] mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Back to GlamGuard</span>
        </Link>

        <div className="bg-white border border-[#E8DFE6] rounded-2xl p-6 sm:p-8">
          <Link
            to="/"
            className="font-display text-2xl font-semibold text-[#38243E] inline-block mb-4"
          >
            Glam<span className="text-[#E84D79]">Guard</span>
          </Link>

          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-[#38243E] mb-1.5">
            {mode === "signup"
              ? "Create your beauty account"
              : mode === "login"
                ? "Welcome back"
                : "Reset your password"}
          </h1>
          <p className="text-sm text-[#6B5570] mb-6">
            {mode === "signup"
              ? "Save your preferences, products, and personalized rescue plans."
              : mode === "login"
                ? "Log in to access your Beauty Rescue Plans and profile."
                : "Enter your email and we will send you a password reset link."}
          </p>

          {error && (
            <div
              role="alert"
              className="mb-5 p-3.5 rounded-xl bg-[#E84D79]/10 border border-[#E84D79]/30 flex items-start gap-2.5 text-xs sm:text-sm text-[#38243E]"
            >
              <AlertCircle className="w-4 h-4 text-[#E84D79] shrink-0 mt-0.5" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div
              role="status"
              className="mb-5 p-3.5 rounded-xl bg-[#FAF7F9] border border-[#E8DFE6] flex items-start gap-2.5 text-xs sm:text-sm text-[#38243E]"
            >
              <CheckCircle2
                className="w-4 h-4 text-[#E84D79] shrink-0 mt-0.5"
                aria-hidden="true"
              />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label htmlFor="auth-name" className="block text-xs font-semibold text-[#38243E] mb-1.5">
                  Full name
                </label>
                <input
                  id="auth-name"
                  type="text"
                  required
                  maxLength={100}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Ananya Sen"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DFE6] text-sm text-[#38243E] focus:border-[#E84D79] focus:outline-none"
                />
              </div>
            )}

            <div>
              <label htmlFor="auth-email" className="block text-xs font-semibold text-[#38243E] mb-1.5">
                Email address
              </label>
              <input
                id="auth-email"
                type="email"
                required
                maxLength={160}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DFE6] text-sm text-[#38243E] focus:border-[#E84D79] focus:outline-none"
              />
            </div>

            {mode !== "forgot" && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="auth-password" className="block text-xs font-semibold text-[#38243E]">
                    Password
                  </label>
                  {mode === "login" && (
                    <button
                      type="button"
                      onClick={() => {
                        setMode("forgot");
                        setError("");
                        setSuccessMsg("");
                      }}
                      className="text-xs font-medium text-[#E84D79] hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <input
                  id="auth-password"
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DFE6] text-sm text-[#38243E] focus:border-[#E84D79] focus:outline-none"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-4 rounded-xl bg-[#E84D79] hover:bg-[#D43B68] disabled:opacity-55 text-white text-sm font-semibold transition-colors cursor-pointer"
            >
              {submitting
                ? "Please wait..."
                : mode === "signup"
                  ? "Create Account & Continue"
                  : mode === "login"
                    ? "Log In"
                    : "Send Reset Link"}
            </button>
          </form>

          {mode !== "forgot" && (
            <>
              <div className="my-5 flex items-center gap-3 text-xs text-[#6B5570]">
                <span className="flex-1 h-px bg-[#E8DFE6]" />
                <span>or</span>
                <span className="flex-1 h-px bg-[#E8DFE6]" />
              </div>

              <button
                type="button"
                disabled={submitting}
                onClick={handleGoogle}
                className="w-full py-2.5 px-4 rounded-xl border border-[#E8DFE6] bg-white hover:border-[#38243E] text-sm font-medium text-[#38243E] transition-colors cursor-pointer"
              >
                Continue with Google
              </button>
            </>
          )}

          <div className="mt-6 pt-5 border-t border-[#E8DFE6] text-center text-xs text-[#6B5570]">
            {mode === "signup" ? (
              <p>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setError("");
                  }}
                  className="font-semibold text-[#E84D79] hover:underline cursor-pointer"
                >
                  Log in
                </button>
              </p>
            ) : (
              <p>
                {mode === "forgot" ? "Remembered your password? " : "New to GlamGuard? "}
                <button
                  type="button"
                  onClick={() => {
                    setMode(mode === "forgot" ? "login" : "signup");
                    setError("");
                    setSuccessMsg("");
                  }}
                  className="font-semibold text-[#E84D79] hover:underline cursor-pointer"
                >
                  {mode === "forgot" ? "Back to Log in" : "Create an account"}
                </button>
              </p>
            )}
          </div>
        </div>
      </div>

      <p className="text-center text-xs text-[#6B5570] mt-6">
        Private account protected by Firebase Authentication.
      </p>
    </div>
  );
}
