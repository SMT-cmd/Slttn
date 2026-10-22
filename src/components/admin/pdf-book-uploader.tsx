import { useState, type ChangeEvent } from "react";
import { toast } from "sonner";
import { importBookPdf } from "@/lib/admin/import-book-pdf";
import {
  adminCreateBookPages,
  adminSaveBookCover,
  adminSignCloudinaryUpload,
  type BookPageRow,
} from "@/lib/server/platform";

type Props = {
  bookId: string;
  bookSlug: string;
  coverUrl?: string | null;
  existingPages: number;
  disabled?: boolean;
  onImported: (pages: BookPageRow[], coverUrl?: string) => Promise<void>;
};

async function uploadPdfImage(file: File, slug: string) {
  const signed = await adminSignCloudinaryUpload({
    data: { kind: "page", bookSlug: slug, fileName: file.name },
  });
  const form = new FormData();
  form.set("file", file);
  form.set("api_key", signed.apiKey);
  form.set("folder", signed.folder);
  form.set("public_id", signed.publicId);
  form.set("resource_type", signed.resourceType);
  form.set("signature", signed.signature);
  form.set("tags", signed.tags);
  form.set("timestamp", String(signed.timestamp));
  const response = await fetch(signed.uploadUrl, { method: "POST", body: form });
  if (!response.ok) throw new Error("Cloudinary rejected page upload (" + response.status + ").");
  const data = (await response.json()) as { secure_url?: string };
  if (!data.secure_url) throw new Error("Cloudinary did not return an image URL.");
  return data.secure_url;
}

export function PdfBookUploader({ bookId, bookSlug, coverUrl, existingPages, disabled, onImported }: Props) {
  const [working, setWorking] = useState(false);
  const [status, setStatus] = useState("");
  const [progress, setProgress] = useState({ completed: 0, total: 0 });
  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || working) return;
    // A full-PDF import must never silently append a second book to the first.
    if (existingPages > 0) {
      toast.error("This book already has pages. Import a complete PDF into a new book, or clear the old pages first.");
      event.target.value = "";
      return;
    }
    setWorking(true);
    setProgress({ completed: 0, total: 0 });
    let savedCount = 0;
    let firstUrl: string | undefined;
    let pending: string[] = [];
    let savedPages: BookPageRow[] = [];
    try {
      const importedCount = await importBookPdf(
        file,
        async (image, pageNumber, total) => {
          const url = await uploadPdfImage(image, bookSlug);
          if (pageNumber === 1) firstUrl = url;
          pending.push(url);
          if (pending.length >= 5 || pageNumber === total) {
            setStatus("Saving pages " + (savedCount + 1) + "–" + pageNumber + " to the library…");
            const pages = await adminCreateBookPages({
              data: { bookId, imageUrls: pending },
            });
            savedPages = (pages ?? []).filter((p): p is BookPageRow => Boolean(p?.id && p.image_url));
            savedCount = pageNumber;
            pending = [];
          }
          setProgress({ completed: pageNumber, total });
        },
        (state) => {
          setStatus(state.stage === "rendering"
            ? "Rendering page " + (state.completed + 1) + " of " + state.total + "…"
            : state.stage === "uploading"
              ? "Uploading page " + (state.completed + 1) + " of " + state.total + "…"
              : "Saving pages…");
          setProgress({ completed: state.completed, total: state.total });
        },
      );
      let nextCover = coverUrl || undefined;
      // Replace the default branding placeholder with page 1 of the imported book.
      if (firstUrl && (!nextCover || /\/brand\/trading-library-powered\.png(?:\?.*)?$/i.test(nextCover))) {
        await adminSaveBookCover({ data: { id: bookId, coverUrl: firstUrl } });
        nextCover = firstUrl;
      }
      await onImported(savedPages, nextCover);
      setStatus("Finished: " + importedCount + " PDF pages added in order.");
      toast.success("Imported " + importedCount + " pages from one PDF.");
    } catch (error) {
      setStatus("Import interrupted after " + savedCount + " saved pages. Review before retrying.");
      toast.error(error instanceof Error ? error.message : "PDF import failed.");
      if (savedCount > 0) await onImported(savedPages).catch(() => undefined);
    } finally {
      event.target.value = "";
      setWorking(false);
    }
  }
  return (
    <div className="min-w-0 rounded-lg border border-emerald-200 bg-emerald-50/40 p-4 text-sm dark:border-emerald-900 dark:bg-emerald-950/20">
      <label className="block font-semibold">Upload complete book (PDF)</label>
      <p className="mt-1 text-muted-foreground">
        Select one PDF. All pages, including the front and back covers, are extracted automatically and saved in order.
        {existingPages ? " This book already has pages; full-book import is disabled to prevent accidental duplication." : ""}
      </p>
      <input
        aria-label="Upload complete book PDF"
        type="file"
        accept=".pdf,application/pdf"
        disabled={disabled || working || existingPages > 0}
        onChange={(event) => { void handleFile(event); }}
        className="mt-3 block w-full max-w-full"
      />
      {status && <p role="status" className="mt-3 font-medium">{status}</p>}
      {working && progress.total > 0 && (
        <progress aria-label="PDF import progress" className="mt-2 block w-full" max={progress.total} value={progress.completed} />
      )}
      {working && <p className="mt-2 text-xs text-muted-foreground">Keep this tab open until the import completes.</p>}
    </div>
  );
}
