import { createFileRoute } from "@tanstack/react-router";
import { Legal } from "@/components/layout/legal";

export const Route = createFileRoute("/cookies")({
  component: () => (
    <Legal title="Cookie Policy">
      <p>
        Strictly necessary cookies keep you signed in and remember light/dark theme and age
        confirmation. They do not require extra consent.
      </p>
      <p>
        If you accept extra cookies, Google AdSense and related Google tags may set advertising
        and measurement cookies. We implement Google Consent Mode: ad_storage, ad_user_data,
        ad_personalization, and analytics_storage default to denied until you accept.
      </p>
      <p>
        You can reject extra cookies on the banner. To change your mind later, clear this site’s
        cookies in your browser and reload. See also the Privacy Policy.
      </p>
    </Legal>
  ),
});
