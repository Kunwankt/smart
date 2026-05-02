import { NextResponse } from "next/server";
import { getRoomsData } from "@/lib/local-db";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export async function GET() {
  // Try Firebase first
  if (db) {
    try {
      const docRef = doc(db, "building", "cb_building");
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        // Backward compatibility for Firebase
        const buildings = data.buildings || { cb: { id: "cb", name: "Central Block", floors: data.floors } };
        return NextResponse.json({
          buildings: buildings,
          source: "firebase",
          updatedAt: data.updatedAt?.toDate?.() || data.updatedAt
        });
      } else {
        console.log("Firebase document missing, seeding from local data...");
        const localData = await getRoomsData();
        await setDoc(docRef, {
          buildings: localData.buildings,
          updatedAt: new Date()
        });
        return NextResponse.json({
          buildings: localData.buildings,
          source: "firebase-seeded",
          updatedAt: localData.updatedAt
        });
      }
    } catch (err) {
      console.error("Firebase load failed, falling back to local JSON:", err);
    }
  }

  // Fallback to local JSON
  try {
    const data = await getRoomsData();
    return NextResponse.json({
      buildings: data.buildings,
      source: "json-file",
      updatedAt: data.updatedAt
    });
  } catch (err) {
    console.error("Failed to load rooms data:", err);
    return NextResponse.json({ error: "Failed to load data" }, { status: 500 });
  }
}
