export type AccessRole = "owner" | "member";

function parseEmailList(raw: string | undefined): Set<string> {
  return new Set(
    (raw ?? "")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean)
  );
}

const allowedEmails = parseEmailList(process.env.ALLOWED_EMAILS);
const ownerEmails = parseEmailList(process.env.OWNER_EMAILS);

export function isOwnerEmail(email: string): boolean {
  return ownerEmails.has(email.trim().toLowerCase());
}

export function isEmailAllowed(email: string): boolean {
  const normalized = email.trim().toLowerCase();
  return allowedEmails.has(normalized) || ownerEmails.has(normalized);
}

/**
 * Fail-safe by design: if neither ALLOWED_EMAILS nor OWNER_EMAILS is
 * configured, every account is treated as unapproved rather than open.
 */
export function resolveRole(email: string): AccessRole | null {
  if (!isEmailAllowed(email)) return null;
  return isOwnerEmail(email) ? "owner" : "member";
}

export const INVITE_ONLY_MESSAGE = "This beta is currently invite-only.";
