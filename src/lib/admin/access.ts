export type AdminAccessPayload = {
  allowed: boolean;
  message: string | null;
};

export const ADMIN_ACCESS_TIMEOUT_MS = 10_000;

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
