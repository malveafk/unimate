// Emails listed in ADMIN_EMAILS (comma-separated, server-only env var) can
// access /admin and are treated as Premium everywhere quota checks apply.
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map(e => e.trim().toLowerCase())
    .filter(Boolean);
  return adminEmails.includes(email.trim().toLowerCase());
}
