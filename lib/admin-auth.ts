import { NextRequest } from "next/server";

export function isAdminRequest(req: NextRequest) {
  const expected = normalizeKey(process.env.ADMIN_API_KEY);
  if (!expected) return false;
  const provided = normalizeKey(req.headers.get("x-admin-key"));
  return Boolean(provided && timingSafeEqualStrings(provided, expected));
}

function normalizeKey(value: string | null | undefined) {
  if (!value) return "";
  const trimmed = value.trim();
  // Handle values that accidentally include surrounding quotes.
  return trimmed.replace(/^"(.*)"$/, "$1").replace(/^'(.*)'$/, "$1").trim();
}

function timingSafeEqualStrings(a: string, b: string) {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return mismatch === 0;
}

