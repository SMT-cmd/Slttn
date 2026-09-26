import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

const KEY = "slt-consent";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

function gtag(...args: unknown[]) {
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push(args);
}

export function CookieBanner() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    window.dataLayer = window.dataLayer ?? [];
    const stored = window.localStorage.getItem(KEY);
    const ageOk = window.localStorage.getItem("slt-age-ok") === "1";
    if (!ageOk) {
      const onAge = () => {
        if (window.localStorage.getItem(KEY)) return;
        gtag("consent", "default", {
          ad_storage: "denied",
          analytics_storage: "denied",
          ad_user_data: "denied",
          ad_personalization: "denied",
        });
        setOpen(true);
      };
      window.addEventListener("slt-age", onAge);
      return () => window.removeEventListener("slt-age", onAge);
    }
    if (!stored) {
      gtag("consent", "default", {
        ad_storage: "denied",
        analytics_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
      });
      setOpen(true);
    }
  }, []);

  function set(granted: boolean) {
    const value = granted ? "granted" : "denied";
    gtag("consent", "update", {
      ad_storage: value,
      analytics_storage: value,
      ad_user_data: value,
      ad_personalization: value,
    });
    window.localStorage.setItem(KEY, granted ? "granted" : "denied");
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card p-4 shadow-[var(--shadow)]">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          We use cookies for the site, and — after you agree — for Google AdSense. Read the{" "}
          <Link to="/cookies" className="underline">
            Cookie Policy
          </Link>{" "}
          and{" "}
          <Link to="/privacy" className="underline">
            Privacy Policy
          </Link>
          .
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => set(false)}>
            Reject extra cookies
          </Button>
          <Button variant="navy" size="sm" onClick={() => set(true)}>
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
}
