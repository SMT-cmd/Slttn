import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const KEY = "slt-age-ok";

export function AgeGate() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (window.localStorage.getItem(KEY) !== "1") setOpen(true);
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-navy/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 text-card-foreground">
        <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">Age confirmation</p>
        <h2 className="mt-2 font-display text-3xl">You must be 18 or older</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          SLT Trade Hub publishes educational material about trading. Trading involves a
          real risk of loss. Confirm you are at least 18 before you continue.
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <Button
            variant="navy"
            className="flex-1"
            onClick={() => {
              window.localStorage.setItem(KEY, "1");
              window.dispatchEvent(new Event("slt-age"));
              setOpen(false);
            }}
          >
            I am 18 or older
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => {
              window.location.href = "https://www.google.com";
            }}
          >
            Leave
          </Button>
        </div>
      </div>
    </div>
  );
}
