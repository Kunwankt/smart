import { NextRequest } from "next/server";

export function isAdminRequest(req: NextRequest) {
  const expected = process.env.ADMIN_API_KEY;
  if (!expected) return false;
  const provided = req.headers.get("x-admin-key");
  return Boolean(provided && timingSafeEqualStrings(provided, expected));
}

function timingSafeEqualStrings(a: string, b: string) {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return mismatch === 0;
}

