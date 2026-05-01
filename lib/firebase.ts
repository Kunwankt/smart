import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { 
  getFirestore, 
  enableNetwork,
  disableNetwork
} from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Diagnostics: Log masked config to help user debug connection
if (typeof window !== "undefined") {
  const mask = (str: string | undefined) => str ? `${str.slice(0, 4)}...${str.slice(-4)}` : "MISSING";
  console.log("🛠️ Firebase Config Check:", {
    projectId: firebaseConfig.projectId || "MISSING",
    apiKey: mask(firebaseConfig.apiKey),
    appId: mask(firebaseConfig.appId),
    databaseURL: firebaseConfig.databaseURL || "NOT SET",
  });
}

// Check if Firebase config is complete
const requiredKeys = [
  "apiKey",
  "authDomain",
  "projectId",
  "storageBucket",
  "messagingSenderId",
  "appId"
] as const;

const optionalKeys = ["databaseURL", "measurementId"] as const;

const missingKeys = requiredKeys.filter(key => !firebaseConfig[key]);

// Only log a hint if the user actually wants to use Firebase
if (missingKeys.length > 0 && typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  // Silent warning instead of error to avoid cluttering the console
  // console.log("ℹ️ Firebase is not configured. Some analytics features may be disabled.");
}

// Initialize Firebase safely
let app: any = null;
let auth: any = null;
let db: any = null;
let analytics: any = null;

if (firebaseConfig.apiKey && firebaseConfig.apiKey !== "MISSING") {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);

    // Force network connection on startup
    if (typeof window !== "undefined") {
      enableNetwork(db).catch(err => console.error("Failed to enable network:", err));
    }
  } catch (err) {
    console.error("Firebase initialization failed:", err);
  }
} else {
  if (typeof window !== "undefined") {
    console.warn("⚠️ Firebase: No API key found. Firebase features will be disabled.");
  }
}

export { app, auth, db, enableNetwork, disableNetwork, analytics };
