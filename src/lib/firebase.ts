import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocFromServer,
  getDocs,
  getFirestore,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import firebaseConfigJson from "../../firebase-applet-config.json";
import type {
  OwnedProduct,
  PlanFeedback,
  PricingResponse,
  SavedRescuePlan,
  UserProfile,
} from "../types/glamguard";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || firebaseConfigJson.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || firebaseConfigJson.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || firebaseConfigJson.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfigJson.storageBucket,
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseConfigJson.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || firebaseConfigJson.appId,
  firestoreDatabaseId:
    import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || firebaseConfigJson.firestoreDatabaseId,
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: Array<{
      providerId?: string | null;
      email?: string | null;
    }>;
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error("Firestore Error: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

async function testConnection() {
  try {
    await getDocFromServer(doc(db, "test", "connection"));
  } catch (error) {
    if (error instanceof Error && error.message.includes("the client is offline")) {
      console.error("Please check your Firebase configuration.");
    }
  }
}

void testConnection();

function clip(value: string | undefined, max: number): string {
  return (value ?? "").trim().slice(0, max);
}

function sanitizeProducts(products: OwnedProduct[] | undefined): OwnedProduct[] {
  if (!Array.isArray(products)) return [];
  return products
    .filter((p) => p && p.name && p.name.trim().length > 0)
    .slice(0, 40)
    .map((p) => ({
      id: clip(p.id || `prod_${Math.random().toString(36).slice(2, 10)}`, 64),
      name: clip(p.name, 100),
      category: p.category || "Skincare",
      notes: clip(p.notes, 200),
    }));
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const path = `users/${uid}`;
  try {
    const snap = await getDoc(doc(db, "users", uid));
    if (!snap.exists()) return null;
    return snap.data() as UserProfile;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function createUserProfile(params: {
  uid: string;
  name: string;
  email: string;
  onboardingCompleted?: boolean;
}): Promise<void> {
  const path = `users/${params.uid}`;
  try {
    await setDoc(doc(db, "users", params.uid), {
      uid: params.uid,
      name: clip(params.name || "GlamGuard User", 100),
      email: clip(params.email, 160),
      ageRange: "",
      location: "",
      skinType: "",
      hairType: "",
      makeupPreference: "",
      beautyConcerns: [],
      budgetPreference: "Affordable",
      existingProducts: [],
      productPreferences: "",
      onboardingCompleted: Boolean(params.onboardingCompleted),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateUserProfile(
  uid: string,
  updates: Partial<Omit<UserProfile, "uid" | "email" | "createdAt" | "updatedAt">>
): Promise<void> {
  const path = `users/${uid}`;
  const payload: Record<string, unknown> = {
    updatedAt: serverTimestamp(),
  };

  if (updates.name !== undefined) payload.name = clip(updates.name, 100) || "GlamGuard User";
  if (updates.ageRange !== undefined) payload.ageRange = clip(updates.ageRange, 40);
  if (updates.location !== undefined) payload.location = clip(updates.location, 120);
  if (updates.skinType !== undefined) payload.skinType = clip(updates.skinType, 40);
  if (updates.hairType !== undefined) payload.hairType = clip(updates.hairType, 80);
  if (updates.makeupPreference !== undefined) {
    payload.makeupPreference = clip(updates.makeupPreference, 40);
  }
  if (updates.beautyConcerns !== undefined) {
    payload.beautyConcerns = updates.beautyConcerns.slice(0, 15).map((c) => clip(c, 100));
  }
  if (updates.budgetPreference !== undefined) {
    payload.budgetPreference = clip(updates.budgetPreference, 40);
  }
  if (updates.existingProducts !== undefined) {
    payload.existingProducts = sanitizeProducts(updates.existingProducts);
  }
  if (updates.productPreferences !== undefined) {
    payload.productPreferences = clip(updates.productPreferences, 500);
  }
  if (updates.onboardingCompleted !== undefined) {
    payload.onboardingCompleted = Boolean(updates.onboardingCompleted);
  }

  try {
    await updateDoc(doc(db, "users", uid), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function saveRescuePlan(
  uid: string,
  planData: Omit<SavedRescuePlan, "id" | "userId" | "createdAt">
): Promise<string> {
  const path = `users/${uid}/plans`;
  try {
    const ref = await addDoc(collection(db, "users", uid, "plans"), {
      userId: uid,
      title: clip(planData.title, 160),
      occasion: clip(planData.occasion, 120),
      concerns: (planData.concerns || []).slice(0, 20).map((c) => clip(c, 100)),
      customConcern: clip(planData.customConcern, 400),
      availableTime: clip(planData.availableTime, 40),
      availableMinutes: Number(planData.availableMinutes) || 10,
      situation: {
        environment: clip(planData.situation.environment, 60),
        weather: clip(planData.situation.weather, 60),
        awayFromHome: Boolean(planData.situation.awayFromHome),
        washroomAccess: Boolean(planData.situation.washroomAccess),
        hasProducts: Boolean(planData.situation.hasProducts),
        productSource: planData.situation.productSource || "both",
      },
      generatedPlan: {
        situationSummary: clip(planData.generatedPlan.situationSummary, 1200),
        steps: (planData.generatedPlan.steps || []).slice(0, 15),
        quickFixes: (planData.generatedPlan.quickFixes || []).slice(0, 10),
        productsThatMayHelp: (planData.generatedPlan.productsThatMayHelp || []).slice(0, 10),
        whatToAvoid: (planData.generatedPlan.whatToAvoid || []).slice(0, 10),
        timeBreakdown: planData.generatedPlan.timeBreakdown,
        finalTip: clip(planData.generatedPlan.finalTip, 600),
        professionalNote: clip(planData.generatedPlan.professionalNote, 500),
      },
      feedbackRating: planData.feedbackRating ?? null,
      createdAt: serverTimestamp(),
    });
    return ref.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

function toEpochMs(createdAt: unknown): number {
  if (!createdAt) return 0;
  const maybeTs = createdAt as { toMillis?: () => number; toDate?: () => Date };
  if (typeof maybeTs.toMillis === "function") return maybeTs.toMillis();
  if (typeof maybeTs.toDate === "function") return maybeTs.toDate().getTime();
  const parsed = new Date(String(createdAt)).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
}

export async function listUserPlans(uid: string): Promise<SavedRescuePlan[]> {
  const path = `users/${uid}/plans`;
  try {
    const q = query(collection(db, "users", uid, "plans"), where("userId", "==", uid));
    const snap = await getDocs(q);
    return snap.docs
      .map((d) => ({
        id: d.id,
        ...(d.data() as Omit<SavedRescuePlan, "id">),
      }))
      .sort((a, b) => toEpochMs(b.createdAt) - toEpochMs(a.createdAt));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function getUserPlan(uid: string, planId: string): Promise<SavedRescuePlan | null> {
  const path = `users/${uid}/plans/${planId}`;
  try {
    const snap = await getDoc(doc(db, "users", uid, "plans", planId));
    if (!snap.exists()) return null;
    return { id: snap.id, ...(snap.data() as Omit<SavedRescuePlan, "id">) };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function rateUserPlan(uid: string, planId: string, rating: number): Promise<void> {
  const path = `users/${uid}/plans/${planId}`;
  try {
    await updateDoc(doc(db, "users", uid, "plans", planId), {
      feedbackRating: Math.max(1, Math.min(5, Math.round(rating))),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteUserPlan(uid: string, planId: string): Promise<void> {
  const path = `users/${uid}/plans/${planId}`;
  try {
    await deleteDoc(doc(db, "users", uid, "plans", planId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function submitPlanFeedback(
  uid: string,
  feedback: Omit<PlanFeedback, "id" | "userId" | "createdAt">
): Promise<string> {
  const path = `users/${uid}/feedback`;
  try {
    const ref = await addDoc(collection(db, "users", uid, "feedback"), {
      userId: uid,
      planId: clip(feedback.planId || "general_pilot", 128),
      usefulness: Math.max(1, Math.min(5, Number(feedback.usefulness) || 5)),
      relevance: Math.max(1, Math.min(5, Number(feedback.relevance) || 5)),
      easeOfUse: Math.max(1, Math.min(5, Number(feedback.easeOfUse) || 5)),
      timeFit: Boolean(feedback.timeFit),
      reuseIntent: clip(feedback.reuseIntent || "yes", 40),
      writtenFeedback: clip(feedback.writtenFeedback, 1000),
      createdAt: serverTimestamp(),
    });
    return ref.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function listUserFeedback(uid: string): Promise<PlanFeedback[]> {
  const path = `users/${uid}/feedback`;
  try {
    const q = query(collection(db, "users", uid, "feedback"), where("userId", "==", uid));
    const snap = await getDocs(q);
    return snap.docs
      .map((d) => ({
        id: d.id,
        ...(d.data() as Omit<PlanFeedback, "id">),
      }))
      .sort((a, b) => toEpochMs(b.createdAt) - toEpochMs(a.createdAt));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function submitPricingResponse(
  uid: string,
  response: Omit<PricingResponse, "id" | "userId" | "proposedPrice" | "createdAt">
): Promise<string> {
  const path = `users/${uid}/pricingResponses`;
  try {
    const ref = await addDoc(collection(db, "users", uid, "pricingResponses"), {
      userId: uid,
      proposedPrice: 99,
      willingnessToPay: clip(response.willingnessToPay, 40),
      response: clip(response.response, 600),
      createdAt: serverTimestamp(),
    });
    return ref.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function listUserPricingResponses(uid: string): Promise<PricingResponse[]> {
  const path = `users/${uid}/pricingResponses`;
  try {
    const q = query(
      collection(db, "users", uid, "pricingResponses"),
      where("userId", "==", uid)
    );
    const snap = await getDocs(q);
    return snap.docs
      .map((d) => ({
        id: d.id,
        ...(d.data() as Omit<PricingResponse, "id">),
      }))
      .sort((a, b) => toEpochMs(b.createdAt) - toEpochMs(a.createdAt));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}
