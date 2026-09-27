const DERIV_PARTNER_CHECK_URL = "https://api.deriv.com/partners/client-tags/check";
const DERIV_AUTHORIZE_URL = "https://oauth.deriv.com/oauth2/authorize";

export type DerivTagCheckResult = {
  isTagged: boolean;
  raw: unknown;
};

function readServerEnv(name: "DERIV_APP_ID" | "DERIV_API_TOKEN" | "DERIV_PARTNER_TAG") {
  const value = typeof process !== "undefined" ? process.env[name]?.trim() : undefined;
  return value || undefined;
}

export function buildDerivAuthorizeUrl(state: string, redirectUri: string) {
  const appId = readServerEnv("DERIV_APP_ID");
  if (!appId) {
    throw new Error("DERIV_APP_ID is not configured.");
  }
  const url = new URL(DERIV_AUTHORIZE_URL);
  url.searchParams.set("app_id", appId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("state", state);
  return url.toString();
}

export async function checkDerivPartnerTag(crNumber: string): Promise<DerivTagCheckResult> {
  const token = readServerEnv("DERIV_API_TOKEN");
  const appId = readServerEnv("DERIV_APP_ID");
  const partnerTag = readServerEnv("DERIV_PARTNER_TAG");

  if (!token || !appId) {
    return { isTagged: false, raw: { reason: "missing_deriv_credentials" } };
  }

  const payload = {
    app_id: appId,
    cr: crNumber,
    client_id: crNumber,
    partner_shortcode: partnerTag,
    tag: partnerTag,
  };

  const response = await fetch(DERIV_PARTNER_CHECK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const raw = (await response.json().catch(() => null)) as Record<string, unknown> | null;

  if (!response.ok) {
    throw new Error(
      typeof raw?.error === "string"
        ? raw.error
        : "Deriv partnership check failed.",
    );
  }

  const isTagged =
    raw?.tagged === true ||
    raw?.is_tagged === true ||
    raw?.status === "tagged" ||
    raw?.has_partner_tag === true;

  return { isTagged, raw };
}
