const DERIV_API_BASE = "https://api.derivws.com";

export const DERIV_PROVIDER_ID = "grok-deriv";

type DerivCheckResponse = {
  data?: Array<{
    client_id?: string;
    clientId?: string;
    is_tagged?: boolean;
    isTagged?: boolean;
  }>;
  results?: Array<{
    client_id?: string;
    clientId?: string;
    is_tagged?: boolean;
    isTagged?: boolean;
  }>;
  tagged_count?: number;
  checked_count?: number;
};

function readEnv(name: "DERIV_PARTNER_TOKEN" | "DERIV_API_TOKEN" | "DERIV_APP_ID") {
  const value = typeof process !== "undefined" ? process.env[name]?.trim() : undefined;
  return value ? value : undefined;
}

export function getDerivPartnerToken() {
  return readEnv("DERIV_PARTNER_TOKEN") ?? readEnv("DERIV_API_TOKEN");
}

export function getDerivAppId() {
  return readEnv("DERIV_APP_ID");
}

export function canCheckDerivTags() {
  return Boolean(getDerivPartnerToken() && getDerivAppId());
}

export async function checkDerivClientTags(clientIds: string[]) {
  const token = getDerivPartnerToken();
  const appId = getDerivAppId();
  if (!token || !appId || clientIds.length === 0) {
    return new Map<string, boolean>();
  }

  const uniqueClientIds = [...new Set(clientIds.map((value) => value.trim()).filter(Boolean))].slice(
    0,
    100,
  );
  if (uniqueClientIds.length === 0) {
    return new Map<string, boolean>();
  }

  const response = await fetch(`${DERIV_API_BASE}/partners/client-tags/check`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "Deriv-App-ID": appId,
    },
    body: JSON.stringify({ client_ids: uniqueClientIds }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Deriv tag check failed.");
  }

  const payload = (await response.json()) as DerivCheckResponse;
  const rows = payload.data ?? payload.results ?? [];
  const tagged = new Map<string, boolean>();

  for (const row of rows) {
    const clientId = row.client_id ?? row.clientId;
    if (!clientId) continue;
    tagged.set(clientId, Boolean(row.is_tagged ?? row.isTagged));
  }

  return tagged;
}
