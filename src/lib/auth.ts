/**
 * Server-side admin auth helpers.
 *
 * NOTE: In production, set ADMIN_PASSWORD env var. Default is fine for a
 * single-user sandbox demo; the user can change it before going live.
 */

export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

/**
 * Cheap pseudo-token. Not secure, but enough to gate the admin endpoints in
 * this single-user sandbox. Replace with NextAuth/JWT for production.
 */
export function makeAdminToken(): string {
  return Buffer.from(`admin:${Date.now()}`).toString("base64");
}

export function verifyAdminAuth(authHeader: string | null): boolean {
  if (!authHeader) return false;
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : authHeader;
  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    return decoded.startsWith("admin:");
  } catch {
    return false;
  }
}

/** Generate a unique 6-digit numeric access code that's not already taken. */
export function generateAccessCode(existing?: Set<string>): string {
  // 6 digits, but never start with 0 to avoid confusion
  const pick = () => Math.floor(100000 + Math.random() * 900000).toString();
  let code = pick();
  if (existing && existing.size > 0) {
    let attempts = 0;
    while (existing.has(code) && attempts < 100) {
      code = pick();
      attempts += 1;
    }
  }
  return code;
}
