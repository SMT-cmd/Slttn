import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { runAdminAccessCheck, type AdminAccessPayload } from "./access";

export type AdminGateStatus = "checking" | "allowed" | "denied" | "error";

export type AdminGateState = {
  status: AdminGateStatus;
  message: string;
  role: string | null;
  userId: string | null;
};

const CHECKING_MESSAGE = "Checking the desk...";
const DENIED_MESSAGE = "This account does not have admin access.";
const ERROR_MESSAGE = "We could not confirm admin access.";

function sameState(left: AdminGateState, right: AdminGateState) {
  return (
    left.status === right.status &&
    left.message === right.message &&
    left.role === right.role &&
    left.userId === right.userId
  );
}

export function useAdminGate({
  isPending,
  userId,
  checkAccess,
  timeoutMs,
}: {
  isPending: boolean;
  userId: string | null;
  checkAccess: () => Promise<AdminAccessPayload>;
  timeoutMs: number;
}) {
  const [retryCount, setRetryCount] = useState(0);
  const [state, setState] = useState<AdminGateState>(() => ({
    status: isPending || userId ? "checking" : "denied",
    message: isPending || userId ? CHECKING_MESSAGE : DENIED_MESSAGE,
    role: null,
    userId,
  }));
  const resolvedKeyRef = useRef<string | null>(null);

  const gateKey = useMemo(() => `${userId ?? "anonymous"}:${retryCount}`, [retryCount, userId]);

  const transition = useCallback((next: AdminGateState) => {
    setState((current) => {
      if (sameState(current, next)) {
        return current;
      }
      return next;
    });
  }, []);

  const retry = useCallback(() => {
    resolvedKeyRef.current = null;
    setRetryCount((current) => current + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const currentUserId = userId ?? null;

    if (isPending) {
      if (resolvedKeyRef.current === gateKey) {
        return;
      }
      transition({
        status: "checking",
        message: CHECKING_MESSAGE,
        role: null,
        userId: currentUserId,
      });
      const timeoutHandle = window.setTimeout(() => {
        if (cancelled) return;
        resolvedKeyRef.current = gateKey;
        transition({
          status: "error",
          message: "Admin session check timed out after 8 seconds. Please retry or sign in again.",
          role: null,
          userId: currentUserId,
        });
      }, timeoutMs);
      return () => {
        cancelled = true;
        window.clearTimeout(timeoutHandle);
      };
    }

    if (!currentUserId) {
      resolvedKeyRef.current = gateKey;
      transition({
        status: "denied",
        message: "Please sign in with an approved admin account.",
        role: null,
        userId: null,
      });
      return;
    }

    if (resolvedKeyRef.current === gateKey) {
      return;
    }

    transition({
      status: "checking",
      message: CHECKING_MESSAGE,
      role: null,
      userId: currentUserId,
    });

    runAdminAccessCheck(checkAccess, timeoutMs)
      .then((result) => {
        if (cancelled) return;
        resolvedKeyRef.current = gateKey;
        transition({
          status: result.allowed ? "allowed" : "denied",
          message: result.message ?? (result.allowed ? "Admin access confirmed." : DENIED_MESSAGE),
          role: result.role ?? null,
          userId: currentUserId,
        });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        resolvedKeyRef.current = gateKey;
        transition({
          status: "error",
          message:
            error instanceof Error && error.message ? error.message : ERROR_MESSAGE,
          role: null,
          userId: currentUserId,
        });
      });

    return () => {
      cancelled = true;
    };
  }, [checkAccess, gateKey, isPending, timeoutMs, transition, userId]);

  return {
    state,
    retry,
  };
}
