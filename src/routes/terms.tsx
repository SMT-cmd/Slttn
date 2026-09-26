import { createFileRoute } from "@tanstack/react-router";
import { Legal } from "@/components/layout/legal";

export const Route = createFileRoute("/terms")({
  component: () => (
    <Legal title="Terms of Service">
      <p>
        By creating an account or opening a book you agree to these terms. You must be 18 or
        older. The library is for personal, non-commercial reading. You may not copy, share,
        screenshot for distribution, or resell pages. Every page is watermarked to you.
      </p>
      <p>
        Access is licensed, not sold. Tagged partnership status can be checked against Deriv and
        can be revoked. We may suspend accounts that abuse coupons, share logins, or scrape the
        reader.
      </p>
      <p>
        Downloads are always paid. Online access follows the pricing page. Digital products are
        not refundable once access has been granted.
      </p>
      <p>These terms sit with the Financial Disclaimer and Refund Policy.</p>
    </Legal>
  ),
});
