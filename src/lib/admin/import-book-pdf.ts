/**
 * Admin-only PDF importer. Convert sequentially so large books do not create
 * a full PDF worth of bitmaps in browser memory.
 */
const PDFJS_BASE = "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build";
const MAX_PDF_BYTES = 100 * 1024 * 1024;
const MAX_PAGES = 250;
const MAX_RENDER_WIDTH = 1800;

type PdfPage = {
  getViewport: (options: { scale: number }) => { width: number; height: number };
  render: (options: { canvasContext: CanvasRenderingContext2D; viewport: { width: number; height: number } }) => { promise: Promise<unknown> };
  cleanup: () => void;
};
type PdfDocument = {
  numPages: number;
  getPage: (number: number) => Promise<PdfPage>;
  destroy: () => Promise<unknown>;
};
type PdfEngine = {
  GlobalWorkerOptions: { workerSrc: string };
  getDocument: (options: { data: Uint8Array; stopAtErrors: boolean }) => { promise: Promise<PdfDocument> };
};
export type PdfImportProgress = {
  total: number;
  completed: number;
  stage: "rendering" | "uploading" | "saving";
};

export function validateBookPdf(file: Pick<File, "name" | "size" | "type">) {
  if (!(file.type === "application/pdf" || /\.pdf$/i.test(file.name))) {
    throw new Error("Select a PDF file, not an image or another document.");
  }
  if (!file.size || file.size > MAX_PDF_BYTES) {
    throw new Error("PDF must be between 1 byte and 100 MB.");
  }
}
async function loadEngine(): Promise<PdfEngine> {
  try {
    const engine = (await import(/* @vite-ignore */ (PDFJS_BASE + "/pdf.min.mjs"))) as PdfEngine;
    engine.GlobalWorkerOptions.workerSrc = PDFJS_BASE + "/pdf.worker.min.mjs";
    return engine;
  } catch {
    throw new Error("PDF renderer could not load. Check your connection or browser, then retry.");
  }
}
function canvasAsJpeg(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => blob ? resolve(blob) : reject(new Error("The PDF page could not be converted to an image.")),
      "image/jpeg",
      0.9,
    );
  });
}

/** Cover and back cover are imported as pages 1 and N, preserving document order. */
export async function importBookPdf(
  file: File,
  onPage: (pageFile: File, pageNumber: number, total: number) => Promise<void>,
  onProgress?: (progress: PdfImportProgress) => void,
  engineLoader: () => Promise<PdfEngine> = loadEngine,
): Promise<number> {
  validateBookPdf(file);
  const engine = await engineLoader();
  const pdf = await engine.getDocument({
    data: new Uint8Array(await file.arrayBuffer()),
    stopAtErrors: true,
  }).promise;
  try {
    if (pdf.numPages < 1 || pdf.numPages > MAX_PAGES) {
      throw new Error("A book PDF must have between 1 and " + MAX_PAGES + " pages.");
    }
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
      onProgress?.({ total: pdf.numPages, completed: pageNumber - 1, stage: "rendering" });
      const page = await pdf.getPage(pageNumber);
      let canvas: HTMLCanvasElement | undefined;
      try {
        const initial = page.getViewport({ scale: 1 });
        if (!initial.width || !initial.height) throw new Error("Page " + pageNumber + " has invalid dimensions.");
        const viewport = page.getViewport({ scale: Math.min(2.25, MAX_RENDER_WIDTH / initial.width) });
        canvas = document.createElement("canvas");
        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);
        const context = canvas.getContext("2d", { alpha: false });
        if (!context) throw new Error("This browser cannot render PDF pages.");
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, canvas.width, canvas.height);
        await page.render({ canvasContext: context, viewport }).promise;
        const blob = await canvasAsJpeg(canvas);
        const imageFile = new File(
          [blob],
          "pdf-page-" + String(pageNumber).padStart(4, "0") + ".jpg",
          { type: "image/jpeg" },
        );
        onProgress?.({ total: pdf.numPages, completed: pageNumber - 1, stage: "uploading" });
        await onPage(imageFile, pageNumber, pdf.numPages);
        onProgress?.({ total: pdf.numPages, completed: pageNumber, stage: "saving" });
      } finally {
        if (canvas) { canvas.width = 0; canvas.height = 0; }
        page.cleanup();
      }
    }
    return pdf.numPages;
  } finally {
    await pdf.destroy();
  }
}
