import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { isAdminRequest } from "@/lib/admin-auth";
import type { AuditLog } from "@/lib/audit";

export async function GET(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const limitRaw = url.searchParams.get("limit") ?? "50";
  const limit = Math.max(1, Math.min(200, Number(limitRaw) || 50));

  const db = await getDb();
  const auditCol = db.collection<AuditLog>("auditLogs");

  const logs = await auditCol
    .find({})
    .sort({ at: -1 })
    .limit(limit)
    .toArray();

  return NextResponse.json({ logs });
}

