import { NextResponse } from "next/server";
import { defaultBuildingData } from "@/lib/building-data";
import { getDb } from "@/lib/mongodb";
import type { AuditLog } from "@/lib/audit";

export async function GET() {
  const db = await getDb();
  const buildingCol = db.collection("buildingData");
  const auditCol = db.collection<AuditLog>("auditLogs");

  const existing = await buildingCol.findOne<{ _id: "current"; floors: unknown }>({
    _id: "current",
  });

  if (existing?.floors) {
    return NextResponse.json({ floors: existing.floors });
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

  return NextResponse.json({ floors: defaultBuildingData });
}

