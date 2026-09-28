import { createFileRoute } from "@tanstack/react-router";
import { Legal } from "@/components/layout/legal";

export const Route = createFileRoute("/refund")({
  component: () => (
    <Legal title="Refund Policy">
      <p>
        Digital products are not refundable once access has been granted — that includes online
        reading, downloads, coupons that have been generated, and subscription time already
        opened.
      </p>
      <p>
        If a payment was taken twice by mistake, write to hello@slttradehub.trade within seven
        days with the receipt. Duplicate charges are the only case we reverse.
      </p>
    </Legal>
  ),
});
