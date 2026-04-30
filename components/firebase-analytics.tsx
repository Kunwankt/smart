"use client";

import { useEffect } from "react";
import { analytics } from "@/lib/firebase";

export default function FirebaseAnalytics() {
  useEffect(() => {
    // Firebase analytics is already initialized in lib/firebase.ts
    // This component just ensures the file is imported on the client side
    if (typeof window !== "undefined" && analytics) {
      console.log("Firebase Analytics initialized");
    }
  }, []);

  return null;
}
