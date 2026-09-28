import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Shell } from "@/components/layout/shell";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SITE } from "@/lib/site";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: `Contact ${SITE.name} | Library and Trader Support` },
      {
        name: "description",
        content:
          "Contact SLT Trade Hub about The Trading Library, synthetic indices trading book access, pricing help, or general trader support.",
      },
    ],
  }),
  component: Contact,
});

function Contact() {
  const [busy, setBusy] = useState(false);
  return (
    <Shell>
      <div className="mx-auto max-w-xl px-4 py-16">
        <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">Contact</p>
        <h1 className="mt-3 font-display text-5xl">Contact the desk</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {SITE.email}. For library access, pricing, or general support, send a clear note
          and we will respond.
        </p>
        <form
          className="mt-8 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            setBusy(true);
            window.setTimeout(() => {
              setBusy(false);
              toast.success("Message received. We will write back.");
              (e.target as HTMLFormElement).reset();
            }, 400);
          }}
        >
          <div>
            <Label htmlFor="n">Name</Label>
            <Input id="n" name="name" required />
          </div>
          <div>
            <Label htmlFor="e">Email</Label>
            <Input id="e" name="email" type="email" required />
          </div>
          <div>
            <Label htmlFor="m">Message</Label>
            <Textarea id="m" name="message" required />
          </div>
          <Button type="submit" variant="navy" disabled={busy}>
            {busy ? "Sending…" : "Send"}
          </Button>
        </form>
      </div>
    </Shell>
  );
}
