import { DERIV_PROVIDER_ID } from "../deriv";

/**
 * The upstream identity providers this app offers for sign-in.
 *
 * Source of truth for BOTH the server (`server.ts`) and the client
 * (`client.ts` / sign-in buttons). Kept dependency-free so the client can
 * import it without pulling the server-only Better Auth instance into the
 * browser bundle.
 */
export type AuthProvider = {
  /** Better Auth provider id or generic OAuth provider id. */
  providerId: string;
  /** Whether this provider is a native Better Auth social provider or generic OAuth. */
  kind: "social" | "oauth2";
  /** Human label for the sign-in button. */
  label: string;
};

export const AUTH_PROVIDERS: readonly AuthProvider[] = [
  { providerId: DERIV_PROVIDER_ID, kind: "oauth2", label: "Deriv" },
  { providerId: "google", kind: "social", label: "Google" },
];

export function getAuthProvider(providerId: string): AuthProvider | undefined {
  return AUTH_PROVIDERS.find((provider) => provider.providerId === providerId);
}
