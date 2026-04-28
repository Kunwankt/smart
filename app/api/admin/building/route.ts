import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { isAdminRequest } from "@/lib/admin-auth";
import type { AuditLog } from "@/lib/audit";

export async function GET(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = await getDb();
  const buildingCol = db.collection("buildingData");
  const doc = await buildingCol.findOne({ _id: "current" });
  return NextResponse.json({ building: doc ?? null });
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

  const db = await getDb();
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

  return NextResponse.json({ ok: true });
}

