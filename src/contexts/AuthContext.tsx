import React, { createContext, useContext, useEffect, useState } from "react";
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
  createUserProfile,
  db,
  getUserProfile,
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

  useEffect(() => {
    let unsubProfile: (() => void) | null = null;

    const unsubAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (unsubProfile) {
        unsubProfile();
        unsubProfile = null;
      }

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
      try {
        const existing = await getUserProfile(firebaseUser.uid);
        if (!existing) {
          await createUserProfile({
            uid: firebaseUser.uid,
            name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "GlamGuard User",
            email: firebaseUser.email || "",
            onboardingCompleted: false,
          });
        }

        unsubProfile = onSnapshot(
          doc(db, "users", firebaseUser.uid),
          (snap) => {
            if (snap.exists()) {
              setProfile(snap.data() as UserProfile);
            } else {
              setProfile(null);
            }
            setProfileLoading(false);
          },
          (error) => {
            setProfileLoading(false);
            handleFirestoreError(error, OperationType.GET, userPath);
          }
        );
      } catch (err) {
        console.error("Failed to initialize user profile:", err);
        setProfileLoading(false);
      }
    });

    return () => {
      unsubAuth();
      if (unsubProfile) unsubProfile();
    };
  }, []);

  const signUpWithEmail = async (name: string, email: string, password: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
    await updateProfile(cred.user, { displayName: name.trim() });
    await createUserProfile({
      uid: cred.user.uid,
      name: name.trim(),
      email: email.trim(),
      onboardingCompleted: false,
    });
  };

  const loginWithEmail = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email.trim(), password);
  };

  const loginWithGoogle = async (): Promise<{ isNewUser: boolean }> => {
    const cred = await signInWithPopup(auth, googleProvider);
    const existing = await getUserProfile(cred.user.uid);
    if (!existing) {
      await createUserProfile({
        uid: cred.user.uid,
        name: cred.user.displayName || cred.user.email?.split("@")[0] || "GlamGuard User",
        email: cred.user.email || "",
        onboardingCompleted: false,
      });
      return { isNewUser: true };
    }
    return { isNewUser: !existing.onboardingCompleted };
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
