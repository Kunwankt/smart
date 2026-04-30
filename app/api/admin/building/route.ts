import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { getLocalData, saveLocalData } from "@/lib/local-db";
import { isAdminRequest } from "@/lib/admin-auth";
import type { AuditLog } from "@/lib/audit";

export async function GET(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let db: Awaited<ReturnType<typeof getDb>> | null = null;
  try {
    db = await getDb();
  } catch (err) {
    console.log("MongoDB GET unavailable, using local storage:", (err as Error).message);
    const localData = await getLocalData();
    return NextResponse.json({ building: localData ?? null, source: "local-file" });
  }
  const buildingCol = db.collection("buildingData");
  const doc = await buildingCol.findOne({ _id: "current" });
  return NextResponse.json({ building: doc ?? null, source: "db" });
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

  let db: Awaited<ReturnType<typeof getDb>> | null = null;
  try {
    db = await getDb();
  } catch (err) {
    console.log("MongoDB PUT unavailable, using local storage fallback:", (err as Error).message);
    const success = await saveLocalData(floors);
    if (success) {
      // Return success even if using fallback, but indicate it's local
      return NextResponse.json({ ok: true, source: "local-file" });
    } else {
      return NextResponse.json({ error: "Failed to save locally" }, { status: 500 });
    }
  }

  try {
    const buildingCol = db.collection("buildingData");
    const auditCol = db.collection<AuditLog>("auditLogs");

    const before = await buildingCol.findOne({ _id: "current" });

    await buildingCol.updateOne(
      { _id: "current" },
      { $set: { floors, updatedAt: new Date() } },
      { upsert: true }
    );

    await auditCol.insertOne({
      action: "update_building",
      actor: "admin",
      at: new Date(),
      ip: req.headers.get("x-forwarded-for"),
      userAgent: req.headers.get("user-agent"),
      before: before?.floors,
      after: floors,
    });

    return NextResponse.json({ ok: true, source: "mongodb" });
  } catch (err) {
    console.error("MongoDB operation failed, trying local fallback:", err);
    const success = await saveLocalData(floors);
    if (success) {
      return NextResponse.json({ ok: true, source: "local-file-after-db-error" });
    }
    return NextResponse.json({ error: "Database operation failed" }, { status: 500 });
  }
}

