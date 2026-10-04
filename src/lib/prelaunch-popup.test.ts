import assert from "node:assert/strict";
import test from "node:test";
import { DEFAULT_PRELAUNCH_POPUP, isPopupScheduled, normalizePrelaunchPopup, popupDismissalKey, validatePopupUrl } from "./prelaunch-popup.ts";

test("prelaunch defaults preserve the requested WAT end time and browser frequency", () => {
  assert.equal(DEFAULT_PRELAUNCH_POPUP.endsAt, "2026-10-10T19:59:00.000Z");
  assert.equal(DEFAULT_PRELAUNCH_POPUP.frequency, "browser");
});

test("schedule requires enablement, media, destination, and an active window", () => {
  const config = { ...DEFAULT_PRELAUNCH_POPUP, enabled: true, flyerUrl: "/flyer.jpg" };
  assert.equal(isPopupScheduled(config, Date.parse("2026-10-10T19:58:00Z")), true);
  assert.equal(isPopupScheduled(config, Date.parse("2026-10-10T20:00:00Z")), false);
  assert.equal(isPopupScheduled({ ...config, flyerUrl: "" }, Date.parse("2026-10-10T19:58:00Z")), false);
});

test("normalization and version keys isolate revised announcements", () => {
  const config = normalizePrelaunchPopup({ version: 4, frequency: "session" });
  assert.equal(config.version, 4);
  assert.equal(config.frequency, "session");
  assert.equal(popupDismissalKey(config), "slt-prelaunch-popup:4");
});

test("popup links allow safe web URLs and site-relative media only", () => {
  assert.equal(validatePopupUrl("https://t.me/slttradehub"), true);
  assert.equal(validatePopupUrl("/campaign/flyer.jpg", true), true);
  assert.equal(validatePopupUrl("javascript:alert(1)"), false);
});
