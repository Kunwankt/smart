"use client";

import { useEffect } from "react";
import { analytics } from "@/lib/firebase";
import { logEvent } from "firebase/analytics";

export default function FirebaseAnalytics() {
  useEffect(() => {
    // Firebase analytics is already initialized in lib/firebase.ts
    // This component just ensures the file is imported on the client side
    if (typeof window !== "undefined" && analytics) {
      console.log("Firebase Analytics initialized");
      logEvent(analytics, "page_view_custom", {
        page_title: document.title,
        page_location: window.location.href,
        page_path: window.location.pathname,
      });
    }
  }, []);

  return null;
}
