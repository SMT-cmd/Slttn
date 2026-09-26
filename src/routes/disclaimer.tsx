import { createFileRoute } from "@tanstack/react-router";
import { Legal } from "@/components/layout/legal";

export const Route = createFileRoute("/disclaimer")({
  component: () => (
    <Legal title="Financial Disclaimer">
      <p>
        Everything on SLT Trade Hub and in The Trading Library is educational. It is not
        financial advice, not a recommendation to buy or sell any product, and not an invitation
        to deposit with any broker.
      </p>
      <p>
        Trading synthetic indices and other leveraged products involves a significant risk of
        loss. You can lose more than you expect, including money you cannot afford to lose.
        Past examples in the books are illustrations, not results you should expect.
      </p>
      <p>
        We are not a financial services firm. Decisions you make at the platform are yours.
        If you need personal advice, speak to a licensed adviser in your country.
      </p>
    </Legal>
  ),
});
