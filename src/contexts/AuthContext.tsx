import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import {
  auth,
  db,
  ensureUserProfile,
  googleProvider,
  handleFirestoreError,
  OperationType,
} from "../lib/firebase";
import type { UserProfile } from "../types/glamguard";

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  authReady: boolean;
  profileLoading: boolean;
  signUpWithEmail: (name: string, email: string, password: string) => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<{ isNewUser: boolean }>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const pendingSignupNameRef = useRef<{ email: string; name: string } | null>(null);

  useEffect(() => {
    let unsubProfile: (() => void) | null = null;
    let isMounted = true;

    const unsubAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (unsubProfile) {
        unsubProfile();
        unsubProfile = null;
      }

      if (!isMounted) return;
      setUser(firebaseUser);

      if (!firebaseUser) {
        setProfile(null);
        setProfileLoading(false);
        setAuthReady(true);
        return;
      }

      setProfileLoading(true);
      setAuthReady(true);

      const userPath = `users/${firebaseUser.uid}`;
      const pending = pendingSignupNameRef.current;
      const matchesPending =
        pending &&
        firebaseUser.email &&
        pending.email.toLowerCase() === firebaseUser.email.toLowerCase();

      const resolvedName =
        (matchesPending ? pending.name : "") ||
        firebaseUser.displayName ||
        firebaseUser.email?.split("@")[0] ||
        "GlamGuard User";

      try {
        const ensured = await ensureUserProfile({
          uid: firebaseUser.uid,
          name: resolvedName,
          email: firebaseUser.email || "",
          onboardingCompleted: false,
          preferExplicitName: Boolean(matchesPending),
        });

        if (!isMounted || auth.currentUser?.uid !== firebaseUser.uid) return;
        setProfile(ensured);

        unsubProfile = onSnapshot(
          doc(db, "users", firebaseUser.uid),
          (snap) => {
            if (!isMounted) return;
            if (snap.exists()) {
              setProfile(snap.data() as UserProfile);
            } else {
              setProfile(null);
            }
            setProfileLoading(false);
          },
          (error) => {
            if (!isMounted) return;
            setProfileLoading(false);
            handleFirestoreError(error, OperationType.GET, userPath);
          }
        );
      } catch (err) {
        console.error("Failed to initialize user profile:", err);
        if (isMounted) setProfileLoading(false);
      }
    });

    return () => {
      isMounted = false;
      unsubAuth();
      if (unsubProfile) unsubProfile();
    };
  }, []);

  const signUpWithEmail = async (name: string, email: string, password: string) => {
    const trimmedEmail = email.trim();
    const trimmedName = name.trim() || trimmedEmail.split("@")[0] || "GlamGuard User";
    pendingSignupNameRef.current = { email: trimmedEmail, name: trimmedName };

    try {
      const cred = await createUserWithEmailAndPassword(auth, trimmedEmail, password);
      await updateProfile(cred.user, { displayName: trimmedName });
      const ensured = await ensureUserProfile({
        uid: cred.user.uid,
        name: trimmedName,
        email: cred.user.email || trimmedEmail,
        onboardingCompleted: false,
        preferExplicitName: true,
      });
      setProfile(ensured);
    } finally {
      pendingSignupNameRef.current = null;
    }
  };

  const loginWithEmail = async (email: string, password: string) => {
    const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
    const ensured = await ensureUserProfile({
      uid: cred.user.uid,
      name: cred.user.displayName || cred.user.email?.split("@")[0] || "GlamGuard User",
      email: cred.user.email || email.trim(),
      onboardingCompleted: false,
    });
    setProfile(ensured);
  };

  const loginWithGoogle = async (): Promise<{ isNewUser: boolean }> => {
    const cred = await signInWithPopup(auth, googleProvider);
    const ensured = await ensureUserProfile({
      uid: cred.user.uid,
      name: cred.user.displayName || cred.user.email?.split("@")[0] || "GlamGuard User",
      email: cred.user.email || "",
      onboardingCompleted: false,
    });
    setProfile(ensured);
    return { isNewUser: !ensured.onboardingCompleted };
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email.trim());
  };

  const logout = async () => {
    await signOut(auth);
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        authReady,
        profileLoading,
        signUpWithEmail,
        loginWithEmail,
        loginWithGoogle,
        resetPassword,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
}
