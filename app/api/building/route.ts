import { NextResponse } from "next/server";
import { defaultBuildingData } from "@/lib/building-data";
import { getDb } from "@/lib/mongodb";
import { getLocalData } from "@/lib/local-db";
import type { AuditLog } from "@/lib/audit";

export async function GET() {
  let db: Awaited<ReturnType<typeof getDb>> | null = null;
  try {
    db = await getDb();
  } catch (err) {
    console.log("MongoDB unavailable, falling back to local storage:", (err as Error).message);
    const localData = await getLocalData();
    return NextResponse.json({
      floors: localData.floors,
      source: "local-file",
    });
  }

  const buildingCol = db.collection("buildingData");
  const auditCol = db.collection<AuditLog>("auditLogs");

  const existing = await buildingCol.findOne<{ _id: "current"; floors: unknown }>({
    _id: "current",
  });

  if (existing?.floors) {
    return NextResponse.json({ floors: existing.floors, source: "db" });
  }

  await buildingCol.updateOne(
    { _id: "current" },
    {
      $set: {
        floors: defaultBuildingData,
        updatedAt: new Date(),
      },
    },
    { upsert: true }
  );

  await auditCol.insertOne({
    action: "seed_building",
    actor: "system",
    at: new Date(),
  });

  return NextResponse.json({ floors: defaultBuildingData, source: "seed" });
}

