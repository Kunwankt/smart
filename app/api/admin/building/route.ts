import { NextRequest, NextResponse } from "next/server";
import { getRoomsData, saveRoomsData } from "@/lib/local-db";
import { isAdminRequest } from "@/lib/admin-auth";
import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";

export async function GET(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Try Firebase first
  if (db) {
    try {
      const { doc, getDoc } = await import("firebase/firestore");
      const docRef = doc(db, "building", "cb_building");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return NextResponse.json({ building: docSnap.data(), source: "firebase" });
      }
    } catch (err) {
      console.error("Admin Firebase GET failed:", err);
    }
  }

  try {
    const data = await getRoomsData();
    return NextResponse.json({ building: data, source: "json-file" });
  } catch (err) {
    console.error("Admin GET failed:", err);
    return NextResponse.json({ error: "Failed to load data" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const floors = body?.floors;
  if (!floors) {
    return NextResponse.json({ error: "Missing `floors` in body" }, { status: 400 });
  }

  // Try saving to Firebase first
  if (db) {
    try {
      const docRef = doc(db, "building", "cb_building");
      await setDoc(docRef, {
        floors,
        updatedAt: new Date()
      }, { merge: true });
      
      // Also sync to local JSON as backup
      await saveRoomsData(floors);
      
      return NextResponse.json({ ok: true, source: "firebase" });
    } catch (err) {
      console.error("Firebase save failed, falling back to local JSON:", err);
    }
  }

  try {
    const success = await saveRoomsData(floors);
    if (success) {
      return NextResponse.json({ ok: true, source: "json-file" });
    } else {
      return NextResponse.json({ error: "Failed to save to JSON file" }, { status: 500 });
    }
  } catch (err) {
    console.error("Admin PUT failed:", err);
    return NextResponse.json({ error: "Server error during save" }, { status: 500 });
  }
}
