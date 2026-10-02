/**
 * Admin-only: build a multi-page PDF from cover + ordered page images in the browser.
 * Each image is drawn to a canvas, encoded as JPEG, and embedded as one PDF page.
 */

function padPage(n: number) {
  return String(n).padStart(3, "0");
}

async function fetchImageElement(url: string): Promise<HTMLImageElement> {
  const response = await fetch(url, { mode: "cors", credentials: "omit" });
  if (!response.ok) throw new Error(`Could not fetch image (${response.status})`);
  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("Could not decode image for PDF."));
      el.src = objectUrl;
    });
    return img;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

async function imageToJpegBytes(img: HTMLImageElement, quality = 0.92): Promise<{
  bytes: Uint8Array;
  width: number;
  height: number;
}> {
  const width = img.naturalWidth || img.width;
  const height = img.naturalHeight || img.height;
  if (!width || !height) throw new Error("Image has no dimensions.");

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not available in this browser.");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(img, 0, 0);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => (result ? resolve(result) : reject(new Error("JPEG encode failed."))),
      "image/jpeg",
      quality,
    );
  });
  return {
    bytes: new Uint8Array(await blob.arrayBuffer()),
    width,
    height,
  };
}

function utf8(str: string) {
  return new TextEncoder().encode(str);
}

function concat(parts: Uint8Array[]) {
  const total = parts.reduce((n, p) => n + p.length, 0);
  const out = new Uint8Array(total);
  let o = 0;
  for (const part of parts) {
    out.set(part, o);
    o += part.length;
  }
  return out;
}

/**
 * Minimal PDF 1.4 writer: one JPEG image per page, page size matches image pixels
 * (1 unit = 1 pt ≈ image pixel so pages stay sharp in readers).
 */
function buildJpegPdf(
  pages: Array<{ jpeg: Uint8Array; width: number; height: number }>,
): Blob {
  const encoder = new TextEncoder();
  const chunks: Uint8Array[] = [];
  const offsets: number[] = [];
  let position = 0;

  const push = (part: Uint8Array | string) => {
    const bytes = typeof part === "string" ? encoder.encode(part) : part;
    chunks.push(bytes);
    position += bytes.length;
  };

  push("%PDF-1.4\n");

  // Object 1: Catalog
  offsets[1] = position;
  push("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");

  // Object 2: Pages (kids filled after we know page object numbers)
  // Page objects start at 3; each page uses 3 objects: Page, Content, Image
  // Layout per page i (0-based):
  //   pageObj = 3 + i*3
  //   contentObj = 4 + i*3
  //   imageObj = 5 + i*3

  const pageCount = pages.length;
  const kids = pages.map((_, i) => `${3 + i * 3} 0 R`).join(" ");
  offsets[2] = position;
  push(`2 0 obj\n<< /Type /Pages /Kids [${kids}] /Count ${pageCount} >>\nendobj\n`);

  for (let i = 0; i < pageCount; i++) {
    const page = pages[i];
    const pageObj = 3 + i * 3;
    const contentObj = 4 + i * 3;
    const imageObj = 5 + i * 3;
    const w = page.width;
    const h = page.height;

    const contentStream = `q\n${w} 0 0 ${h} 0 0 cm\n/Im${i} Do\nQ\n`;
    const contentBytes = utf8(contentStream);

    offsets[pageObj] = position;
    push(
      `${pageObj} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${w} ${h}] /Resources << /XObject << /Im${i} ${imageObj} 0 R >> >> /Contents ${contentObj} 0 R >>\nendobj\n`,
    );

    offsets[contentObj] = position;
    push(
      `${contentObj} 0 obj\n<< /Length ${contentBytes.length} >>\nstream\n`,
    );
    push(contentBytes);
    push("\nendstream\nendobj\n");

    offsets[imageObj] = position;
    push(
      `${imageObj} 0 obj\n<< /Type /XObject /Subtype /Image /Width ${w} /Height ${h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${page.jpeg.length} >>\nstream\n`,
    );
    push(page.jpeg);
    push("\nendstream\nendobj\n");
  }

  const xrefStart = position;
  const objectCount = 3 + pageCount * 3; // 1 catalog + 1 pages + 3 per page; next free id = objectCount
  // objects used: 1, 2, and 3..(2+pageCount*3) = up to 2+pageCount*3
  const maxObj = 2 + pageCount * 3;
  push(`xref\n0 ${maxObj + 1}\n`);
  push("0000000000 65535 f \n");
  for (let i = 1; i <= maxObj; i++) {
    const off = offsets[i] ?? 0;
    push(`${String(off).padStart(10, "0")} 00000 n \n`);
  }
  push(`trailer\n<< /Size ${maxObj + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`);

  return new Blob(chunks, { type: "application/pdf" });
}

export async function downloadAdminBookPdf(bundle: {
  title: string;
  slug: string;
  cover_url: string;
  pages: Array<{ page_number: number; image_url: string }>;
  onProgress?: (message: string) => void;
}) {
  const folder = (bundle.slug || "book").replace(/[^\w.-]+/g, "-");
  const jpegPages: Array<{ jpeg: Uint8Array; width: number; height: number }> = [];

  const urls: Array<{ label: string; url: string }> = [];
  if (bundle.cover_url) {
    urls.push({ label: "cover", url: bundle.cover_url });
  }
  for (const page of bundle.pages) {
    urls.push({ label: `page ${page.page_number}`, url: page.image_url });
  }
  if (urls.length === 0) throw new Error("No images found for this book.");

  for (let i = 0; i < urls.length; i++) {
    const item = urls[i];
    bundle.onProgress?.(`Preparing PDF… ${item.label} (${i + 1}/${urls.length})`);
    try {
      const img = await fetchImageElement(item.url);
      jpegPages.push(await imageToJpegBytes(img));
    } catch (error) {
      // Cover can be a relative path that fails CORS; skip cover rather than abort
      if (item.label === "cover") continue;
      throw error instanceof Error
        ? error
        : new Error(`Could not add ${item.label} to the PDF.`);
    }
  }

  if (jpegPages.length === 0) {
    throw new Error("No downloadable page images found for this book.");
  }

  bundle.onProgress?.("Building PDF file…");
  const blob = buildJpegPdf(jpegPages);
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = `${folder}-admin.pdf`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(objectUrl);
}

// Keep name used by older references if any
export async function downloadAdminBookZip(
  bundle: Parameters<typeof downloadAdminBookPdf>[0],
) {
  return downloadAdminBookPdf(bundle);
}
