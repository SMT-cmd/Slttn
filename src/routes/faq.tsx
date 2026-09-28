import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/layout/shell";
import { Button } from "@/components/ui/button";
import { SITE } from "@/lib/site";

const FAQS = [
  {
    question: "How do I access The Trading Library?",
    answer:
      "Open the library, choose your book or access option, and sign in with the same email you use for your SLT Trade Hub account. If your access does not show, contact support and we will check it.",
  },
  {
    question: "Do I need a Deriv account?",
    answer:
      "You do not need a Deriv account to browse the site or read pricing. You need one when your access or member pricing depends on partner tagging.",
  },
  {
    question: "How do I link my Deriv account to SLT Trade Hub?",
    answer:
      "Go to your account desk, add your CR number, include the partner code if needed, and submit the link request. If the tag has not updated yet, support can help you review it.",
  },
  {
    question: "Are the books free for SLT members?",
    answer:
      "Tagged SLT members can qualify for member pricing and pre-launch coupon access. The exact offer depends on the current launch stage shown on the site.",
  },
  {
    question: "What happens after public launch pricing?",
    answer:
      "Public launch pricing replaces the early offer. Tagged members still keep the member path, but the public rate and coupon rules shown at checkout become the active terms.",
  },
  {
    question: "Can I download the books?",
    answer:
      "That depends on the access type attached to the book. Some offers are online reading only, while others include download access where stated on the product page.",
  },
  {
    question: "How do I get support?",
    answer:
      "Use Telegram for the fastest reply, WhatsApp for quick follow-up, or email if you want to send full details. The support desk is also linked on the Support and Contact pages.",
  },
  {
    question: "How do I join Telegram / WhatsApp community?",
    answer:
      "Open the Community page and use the Telegram or WhatsApp buttons there. If an invite link gives you trouble, contact support and ask for a fresh route in.",
  },
  {
    question: "I cannot log in — what should I do?",
    answer:
      "First, sign in with the same email tied to your access. If your library or account still does not load, contact support with your email address and what happens when you try.",
  },
  {
    question: "How do coupons work?",
    answer:
      "Coupons apply according to the current launch stage and your member status. If you already have a code, redeem it in your account or at checkout. If you expect one and do not see it, support can confirm your status.",
  },
] as const;

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: `FAQ | ${SITE.name}` },
      {
        name: "description",
        content:
          "Frequently asked questions about The Trading Library, Deriv account linking, member pricing, coupons, and support.",
      },
    ],
  }),
  component: Faq,
});

function Faq() {
  return (
    <Shell>
      <div className="mx-auto max-w-4xl px-4 py-16">
        <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">FAQ</p>
        <h1 className="mt-3 font-display text-5xl">Answers traders ask before they lose time.</h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          If you need a direct reply, go to Support or Contact and the desk will help you
          move forward.
        </p>

        <div className="mt-10 space-y-4">
          {FAQS.map((item) => (
            <section key={item.question} className="rounded-2xl border border-border bg-card p-6">
              <h2 className="font-display text-2xl">{item.question}</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.answer}</p>
            </section>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild variant="navy">
            <a href="/support">Go to Support</a>
          </Button>
          <Button asChild variant="outline">
            <a href="/contact">Open Contact</a>
          </Button>
        </div>
      </div>
    </Shell>
  );
}
