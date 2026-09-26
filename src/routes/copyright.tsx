import { createFileRoute } from "@tanstack/react-router";
import { Legal } from "@/components/layout/legal";

export const Route = createFileRoute("/copyright")({
  component: () => (
    <Legal title="Copyright / DMCA">
      <p>
        The books, covers, reader, and SLT Trade Hub / Trading Library marks are owned by SLT
        Trade Hub. Unauthorised copying, uploading, or resale is infringement and can lead to
        account closure and a trace via watermarks.
      </p>
      <p>
        If you believe your work appears here without permission, send a DMCA notice to
        hello@slttradehub.online with: your contact details, the work, the URL, a statement of
        good faith, and your signature. We will look at complete notices promptly.
      </p>
    </Legal>
  ),
});
