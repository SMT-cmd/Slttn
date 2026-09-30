export type AdminAccessPayload = {
  allowed: boolean;
  message: string | null;
  role: string | null;
};

export const ADMIN_ACCESS_TIMEOUT_MS = 8_000;

function normalizeAdminEmail(email: string) {
  return email.trim().toLowerCase();
}

export function parseAdminEmails(raw = process.env.ADMIN_EMAILS ?? "") {
  return new Set(
    raw
      .split(",")
      .map((email) => normalizeAdminEmail(email))
      .filter(Boolean),
  );
}

export function isAllowlistedAdminEmail(email: string | null | undefined, raw = process.env.ADMIN_EMAILS ?? "") {
  if (!email) return false;
  return parseAdminEmails(raw).has(normalizeAdminEmail(email));
}

export async function runAdminAccessCheck<T extends AdminAccessPayload>(
  check: () => Promise<T>,
  timeoutMs = ADMIN_ACCESS_TIMEOUT_MS,
): Promise<T> {
  let timeoutHandle: ReturnType<typeof setTimeout> | undefined;

  try {
    return await Promise.race([
      check(),
      new Promise<never>((_, reject) => {
        timeoutHandle = setTimeout(() => {
          reject(
            new Error("Admin access check timed out. Reload your session or return to admin login."),
          );
        }, timeoutMs);
      }),
    ]);
  } finally {
    if (timeoutHandle) {
      clearTimeout(timeoutHandle);
    }
  }
}
