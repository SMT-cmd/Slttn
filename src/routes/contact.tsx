import { createFileRoute } from "@tanstack/react-router";
import { type FormEvent, useState } from "react";
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

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const message = String(formData.get("message") ?? "").trim();
    const subject = `Support request from ${name || "SLT visitor"}`;
    const body = [
      `Name: ${name || "Not provided"}`,
      `Email: ${email || "Not provided"}`,
      "",
      "Message:",
      message,
    ].join("\n");

    toast.success("Opening your email app…");
    window.location.href =
      `mailto:${SITE.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    form.reset();
    setBusy(false);
  }

  return (
    <Shell>
      <div className="mx-auto max-w-xl px-4 py-16">
        <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">Contact</p>
        <h1 className="mt-3 font-display text-5xl">Contact the desk</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          For library access, login help, pricing questions, or account linking, reach the
          desk on the channel that is fastest for you.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <Button asChild variant="navy">
            <a href={SITE.telegram}>Telegram support</a>
          </Button>
          <Button asChild variant="outline">
            <a href={SITE.whatsapp}>WhatsApp</a>
          </Button>
          <Button asChild variant="outline">
            <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
          </Button>
        </div>
        <form
          className="mt-8 space-y-3"
          onSubmit={handleSubmit}
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
            {busy ? "Opening…" : "Send by email"}
          </Button>
        </form>
        <p className="mt-4 text-sm text-muted-foreground">
          The form opens your email app with your details filled in, so you can send the
          message straight to {SITE.email}.
        </p>
      </div>
    </Shell>
  );
}
