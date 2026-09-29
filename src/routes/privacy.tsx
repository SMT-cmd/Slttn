import { createFileRoute } from "@tanstack/react-router";
import { Legal } from "@/components/layout/legal";

export const Route = createFileRoute("/privacy")({
  component: () => (
    <Legal title="Privacy Policy">
      <p>Last updated 26 September 2026. SLT Trade Hub (“we”) runs slttradehub.trade and library.slttradehub.trade.</p>
      <p>
        We collect the name, email, and authentication identifiers you give us when you sign in
        with Google, Deriv, or email and password, plus any Deriv CR number you link, coupon
        use, purchases, and reading activity (which book and page, when).
      </p>
      <p>
        Google AdSense may use cookies to serve ads after you consent. We use Google Consent Mode
        so ad storage stays denied until you accept. You can reject extra cookies; the site still
        works. See the Cookie Policy.
      </p>
      <p>
        Payments, when live, are processed by Stripe and Paystack. We do not store full card
        numbers. Hosting is on Vercel. You may request a copy of your data or deletion from your
        account page.
      </p>
      <p>Write to hello@slttradehub.trade for privacy questions.</p>
    </Legal>
  ),
});
