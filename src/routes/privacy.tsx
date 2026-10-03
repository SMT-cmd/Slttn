import { createFileRoute } from "@tanstack/react-router";
import { Legal } from "@/components/layout/legal";

export const Route = createFileRoute("/privacy")({
  component: () => (
    <Legal title="Privacy Policy">
      <p>Last updated 26 September 2026. SLT Trade Hub (“we”) runs slttradehub.trade and library.slttradehub.trade.</p>
      <p>
        We collect the name, email, and authentication identifiers needed to create and protect
        your account when you sign in with Google, Deriv, or email and password. When you use
        Deriv sign-in, we read only the nickname and account identifiers needed to create your
        SLT session, show a friendly account label, and check an optional partnership tag. We do
        not use Deriv access to place trades, make payments, view balances, create accounts, or
        manage your Deriv account.
      </p>
      <p>
        If you choose to use library access, we also retain your linked Deriv CR number, coupon
        use, purchases, and reading activity (which book and page, when) to deliver access,
        prevent abuse, and provide your account records. We do not sell authentication or
        reading data.
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
