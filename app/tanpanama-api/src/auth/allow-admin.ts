export function isAllowedAdmin(
  email: string | null | undefined,
  allowlist: string
): boolean {
  if (!email) {
    return false;
  }

  const normalizedEmail = email.trim().toLowerCase();
  return allowlist
    .split(",")
    .some((candidate) => candidate.trim().toLowerCase() === normalizedEmail);
}
