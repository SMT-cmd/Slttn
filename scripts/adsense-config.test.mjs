import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { describe, it } from "node:test";

const rootSource = await readFile(new URL("../src/routes/__root.tsx", import.meta.url), "utf8");
const adsTxt = await readFile(new URL("../public/ads.txt", import.meta.url), "utf8");

describe("AdSense configuration", () => {
  it("publishes the verified seller record", () => {
    assert.match(
      adsTxt,
      /^google\.com, pub-8661087498876975, DIRECT, f08c47fec0942fa0$/m,
    );
  });

  it("renders the publisher metadata and Auto ads script from the shared root", () => {
    assert.match(rootSource, /name="google-adsense-account"/);
    assert.match(rootSource, /pagead2\.googlesyndication\.com\/pagead\/js\/adsbygoogle\.js/);
    assert.match(rootSource, /crossOrigin="anonymous"/);
  });

  it("initializes denied consent before the external AdSense script", () => {
    const consentIndex = rootSource.indexOf("adsenseConsentBootstrap");
    const externalScriptIndex = rootSource.indexOf("pagead2.googlesyndication.com");
    assert.ok(consentIndex >= 0);
    assert.ok(externalScriptIndex > consentIndex);
    assert.match(rootSource, /ad_storage:value/);
    assert.match(rootSource, /ad_personalization:value/);
  });
});
