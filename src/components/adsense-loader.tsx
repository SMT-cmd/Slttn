import { useEffect } from "react";

const CONSENT_KEY = "slt-consent";
const SCRIPT_ID = "slt-adsense-script";

/** Loads AdSense only after an explicit visitor opt-in. */
export function AdsenseLoader({ client }: { client?: string }) {
  useEffect(() => {
    if (!client) return;

    const load = () => {
      if (window.localStorage.getItem(CONSENT_KEY) !== "granted") return;
      if (document.getElementById(SCRIPT_ID)) return;
      const script = document.createElement("script");
      script.id = SCRIPT_ID;
      script.async = true;
      script.crossOrigin = "anonymous";
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(client)}`;
      document.head.append(script);
    };

    load();
    window.addEventListener("slt-consent-updated", load);
    return () => window.removeEventListener("slt-consent-updated", load);
  }, [client]);

  return null;
}
