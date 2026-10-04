const DERIV_LOGIN_ID = /^(?:CR|VRTC)\d+$/i;
// Deriv has issued several internal prefixes (including RT, ROT, DOT, DMT,
// MF, and MLT). Treat any provider-shaped letters+digits value as an internal
// identifier so a future prefix can never leak into the person's display name.
const RAW_DERIV_ACCOUNT_ID = /^(?!(?:CR|VRTC)\d+$)[A-Z]{2,5}\d{5,}$/i;

function firstString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function readObjectString(payload: Record<string, unknown>, keys: readonly string[]) {
  for (const key of keys) {
    const value = firstString(payload[key]);
    if (value) return value;
  }
  return null;
}

export function extractDerivAccountId(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  if (Array.isArray(payload)) {
    for (const entry of payload) {
      const found = extractDerivAccountId(entry);
      if (found) return found;
    }
    return null;
  }

  const record = payload as Record<string, unknown>;
  const direct = readObjectString(record, [
    "account_id",
    "accountId",
    "loginid",
    "loginId",
    "client_id",
    "clientId",
    "id",
  ]);
  if (direct) return direct.toUpperCase();

  for (const value of Object.values(record)) {
    const found = extractDerivAccountId(value);
    if (found) return found;
  }
  return null;
}

/** The legacy mapping is the authoritative source for a user's CR login ID. */
export function extractDerivLoginId(payload: unknown): string | null {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return null;
  const record = payload as Record<string, unknown>;
  const loginids = record.loginids;
  if (loginids && typeof loginids === "object" && !Array.isArray(loginids)) {
    const match = Object.keys(loginids as Record<string, unknown>).find((key) =>
      DERIV_LOGIN_ID.test(key.trim()),
    );
    if (match) return match.trim().toUpperCase();
  }
  for (const value of Object.values(record)) {
    const found = extractDerivLoginId(value);
    if (found) return found;
  }
  return null;
}

export function extractDerivNickname(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  if (Array.isArray(payload)) {
    for (const entry of payload) {
      const found = extractDerivNickname(entry);
      if (found) return found;
    }
    return null;
  }
  const record = payload as Record<string, unknown>;
  const direct = readObjectString(record, ["nickname", "display_name", "displayName", "name"]);
  if (direct && !DERIV_LOGIN_ID.test(direct) && !RAW_DERIV_ACCOUNT_ID.test(direct)) {
    return direct;
  }
  for (const value of Object.values(record)) {
    const found = extractDerivNickname(value);
    if (found) return found;
  }
  return null;
}

export function derivLoginIdFromSyntheticEmail(email: string | null | undefined) {
  const local = email?.trim().toUpperCase().split("@", 1)[0] ?? "";
  return DERIV_LOGIN_ID.test(local) ? local : null;
}

/** Never surface provider-internal RT/DOT identifiers as a person's name. */
export function safeDerivDisplayName(name: string | null | undefined) {
  const value = name?.trim() ?? "";
  const raw = value.replace(/^Deriv\s+/i, "");
  return !value || /^member$/i.test(raw) || RAW_DERIV_ACCOUNT_ID.test(raw) || DERIV_LOGIN_ID.test(raw)
    ? ""
    : value;
}

export function hasUsableDerivName(name: string | null | undefined) {
  return safeDerivDisplayName(name).length >= 2;
}
