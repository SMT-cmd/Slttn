export type PopupFrequency = "browser" | "session" | "visit";

export type PrelaunchPopupConfig = {
  enabled: boolean;
  version: number;
  title: string;
  message: string;
  footer: string;
  primaryLabel: string;
  secondaryLabel: string;
  primaryUrl: string;
  whatsappUrl: string;
  telegramLabel: string;
  whatsappLabel: string;
  flyerUrl: string;
  flyerAlt: string;
  startsAt: string | null;
  endsAt: string | null;
  frequency: PopupFrequency;
};

export const PRELAUNCH_TIME_ZONE = "Africa/Lagos (WAT, UTC+1)";

export const DEFAULT_PRELAUNCH_POPUP: PrelaunchPopupConfig = {
  enabled: true,
  version: 2,
  title: "Synthetic Indices 101 — Book Prelaunch",
  message:
    "Launching 10 October 2026 📘\n\nJoin the SLT Trade Hub community for FREE online access to the 73-page Synthetic Indices 101 book and toolkit, plus a 3-Day FREE Live Class focused on understanding Synthetic Indices before trading.\n\nThe first live session starts on 10 October at 9 p.m. WAT (Nigerian time).\n\nOnline reading is free for community members, including people who join during prelaunch. Downloading the book is a separate paid option.",
  footer: "Educational content. Trading involves risk.",
  primaryLabel: "Join the Community",
  secondaryLabel: "Continue to Website",
  primaryUrl: "/community",
  whatsappUrl: "/community",
  telegramLabel: "Join Telegram HQ",
  whatsappLabel: "Join WhatsApp Community",
  // The official book cover is a safe built-in campaign fallback. Admin can
  // replace it with the full flyer without a deployment.
  flyerUrl: "/covers/synthetic-indices-101.png",
  flyerAlt: "Synthetic Indices 101 book prelaunch flyer",
  // 4 October 2026 00:00 WAT through 10 October 2026 20:59 WAT.
  startsAt: "2026-10-03T23:00:00.000Z",
  endsAt: "2026-10-10T19:59:00.000Z",
  frequency: "browser",
};

export function normalizePrelaunchPopup(value: unknown): PrelaunchPopupConfig {
  const record = value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
  const text = (key: keyof PrelaunchPopupConfig, fallback: string) =>
    typeof record[key] === "string" ? (record[key] as string) : fallback;
  const nullableDate = (key: "startsAt" | "endsAt", fallback: string | null) => {
    const raw = record[key];
    if (raw === null) return null;
    if (typeof raw !== "string" || Number.isNaN(Date.parse(raw))) return fallback;
    return new Date(raw).toISOString();
  };
  const frequency = record.frequency;

  const isUnpublishedV1 = record.version === 1 && record.enabled === false && record.flyerUrl === "";
  return {
    enabled: isUnpublishedV1 ? true : typeof record.enabled === "boolean" ? record.enabled : DEFAULT_PRELAUNCH_POPUP.enabled,
    version:
      isUnpublishedV1 ? DEFAULT_PRELAUNCH_POPUP.version : typeof record.version === "number" && Number.isInteger(record.version) && record.version > 0
        ? record.version
        : DEFAULT_PRELAUNCH_POPUP.version,
    title: text("title", DEFAULT_PRELAUNCH_POPUP.title),
    message: text("message", DEFAULT_PRELAUNCH_POPUP.message),
    footer: text("footer", DEFAULT_PRELAUNCH_POPUP.footer),
    primaryLabel: text("primaryLabel", DEFAULT_PRELAUNCH_POPUP.primaryLabel),
    secondaryLabel: text("secondaryLabel", DEFAULT_PRELAUNCH_POPUP.secondaryLabel),
    primaryUrl: text("primaryUrl", DEFAULT_PRELAUNCH_POPUP.primaryUrl),
    whatsappUrl: text("whatsappUrl", DEFAULT_PRELAUNCH_POPUP.whatsappUrl),
    telegramLabel: text("telegramLabel", DEFAULT_PRELAUNCH_POPUP.telegramLabel),
    whatsappLabel: text("whatsappLabel", DEFAULT_PRELAUNCH_POPUP.whatsappLabel),
    flyerUrl: isUnpublishedV1 ? DEFAULT_PRELAUNCH_POPUP.flyerUrl : text("flyerUrl", DEFAULT_PRELAUNCH_POPUP.flyerUrl),
    flyerAlt: text("flyerAlt", DEFAULT_PRELAUNCH_POPUP.flyerAlt),
    startsAt: nullableDate("startsAt", DEFAULT_PRELAUNCH_POPUP.startsAt),
    endsAt: nullableDate("endsAt", DEFAULT_PRELAUNCH_POPUP.endsAt),
    frequency:
      frequency === "session" || frequency === "visit" || frequency === "browser"
        ? frequency
        : DEFAULT_PRELAUNCH_POPUP.frequency,
  };
}

export function isPopupScheduled(config: PrelaunchPopupConfig, now = Date.now()) {
  if (!config.enabled || !config.flyerUrl || !config.primaryUrl) return false;
  if (config.startsAt && now < Date.parse(config.startsAt)) return false;
  if (config.endsAt && now > Date.parse(config.endsAt)) return false;
  return true;
}

export function popupDismissalKey(config: Pick<PrelaunchPopupConfig, "version">) {
  return `slt-prelaunch-popup:${config.version}`;
}

export function validatePopupUrl(value: string, allowRelative = false) {
  if (allowRelative && value.startsWith("/")) return true;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}
