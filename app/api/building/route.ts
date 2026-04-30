import { NextResponse } from "next/server";
import { getRoomsData } from "@/lib/local-db";

export async function GET() {
  try {
    const data = await getRoomsData();
    return NextResponse.json({
      floors: data.floors,
      source: "json-file",
      updatedAt: data.updatedAt
    });
  } catch (err) {
    console.error("Failed to load rooms data:", err);
    return NextResponse.json({ error: "Failed to load data" }, { status: 500 });
  }
}

