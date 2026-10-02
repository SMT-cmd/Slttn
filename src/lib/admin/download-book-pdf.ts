/**
 * Admin-only: build a multi-page PDF from cover + ordered page images in the browser.
 * Images are scaled down for mobile memory safety, encoded as JPEG, one PDF page each.
 */

const MAX_EDGE = 1600;

function assertBytes(value: Uint8Array | undefined, label: string): Uint8Array {
  if (!value || typeof value.length !== "number") {
    throw new Error(`Missing binary data for ${label}.`);
  }
  return value;
}

async function loadImageFromUrl(url: string): Promise<HTMLImageElement> {
  if (!url || typeof url !== "string") {
    throw new Error("Missing image URL.");
  }

  // Prefer blob fetch so we control CORS; fall back to direct Image load.
  try {
    const response = await fetch(url, { mode: "cors", credentials: "omit", cache: "no-store" });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const blob = await response.blob();
    if (!blob || blob.size < 32) {
      throw new Error("Empty image response.");
    }
    const objectUrl = URL.createObjectURL(blob);
    try {
      return await decodeImage(objectUrl);
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  } catch {
    // Cross-origin or blocked fetch — try element load (may still work with CORS headers)
    return decodeImage(url);
  }
}

function decodeImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const el = new Image();
    el.crossOrigin = "anonymous";
    el.onload = () => resolve(el);
    el.onerror = () => reject(new Error("Could not decode image."));
    el.src = src;
  });
}

async function imageToJpeg(
  img: HTMLImageElement,
  quality = 0.85,
): Promise<{ bytes: Uint8Array; width: number; height: number }> {
  const naturalW = img.naturalWidth || img.width || 0;
  const naturalH = img.naturalHeight || img.height || 0;
  if (!naturalW || !naturalH) {
    throw new Error("Image has no dimensions.");
  }

  const scale = Math.min(1, MAX_EDGE / Math.max(naturalW, naturalH));
  const width = Math.max(1, Math.round(naturalW * scale));
  const height = Math.max(1, Math.round(naturalH * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) throw new Error("Canvas is not available in this browser.");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(img, 0, 0, width, height);

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((result) => resolve(result), "image/jpeg", quality);
  });
  if (!blob || blob.size < 32) {
    throw new Error("JPEG encode failed (image may be too large for this device).");
  }

  const buffer = await blob.arrayBuffer();
  return {
    bytes: new Uint8Array(buffer),
    width,
    height,
  };
}

function encodeUtf8(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

function concatBytes(parts: Uint8Array[]): Uint8Array {
  let total = 0;
  for (const part of parts) {
    if (!part || typeof part.length !== "number") {
      throw new Error("PDF builder received invalid binary chunk.");
    }
    total += part.length;
  }
  const out = new Uint8Array(total);
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
}

/** Minimal PDF 1.4: one DCTDecode (JPEG) image per page. */
function buildJpegPdf(
  pages: Array<{ jpeg: Uint8Array; width: number; height: number }>,
): Blob {
  if (!pages.length) {
    throw new Error("No pages to put in the PDF.");
  }

  const parts: Uint8Array[] = [];
  const offsets: number[] = [0]; // index 0 unused
  let pos = 0;

  const write = (data: string | Uint8Array) => {
    const bytes = typeof data === "string" ? encodeUtf8(data) : data;
    if (!bytes || typeof bytes.length !== "number") {
      throw new Error("PDF write failed: empty chunk.");
    }
    parts.push(bytes);
    pos += bytes.length;
  };

  write("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n");

  // 1 Catalog
  offsets[1] = pos;
  write("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");

  const pageCount = pages.length;
  const kidRefs = pages.map((_, i) => `${3 + i * 3} 0 R`).join(" ");
  // 2 Pages
  offsets[2] = pos;
  write(`2 0 obj\n<< /Type /Pages /Count ${pageCount} /Kids [${kidRefs}] >>\nendobj\n`);

  for (let i = 0; i < pageCount; i++) {
    const page = pages[i];
    const jpeg = assertBytes(page?.jpeg, `page ${i + 1}`);
    const w = page.width;
    const h = page.height;
    if (!w || !h) throw new Error(`Page ${i + 1} has invalid size.`);

    const pageObj = 3 + i * 3;
    const contentObj = 4 + i * 3;
    const imageObj = 5 + i * 3;

    const content = `q\n${w} 0 0 ${h} 0 0 cm\n/Im${i} Do\nQ\n`;
    const contentBytes = encodeUtf8(content);

    offsets[pageObj] = pos;
    write(
      `${pageObj} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${w} ${h}] /Resources << /XObject << /Im${i} ${imageObj} 0 R >> >> /Contents ${contentObj} 0 R >>\nendobj\n`,
    );

    offsets[contentObj] = pos;
    write(`${contentObj} 0 obj\n<< /Length ${contentBytes.length} >>\nstream\n`);
    write(contentBytes);
    write("\nendstream\nendobj\n");

    offsets[imageObj] = pos;
    write(
      `${imageObj} 0 obj\n<< /Type /XObject /Subtype /Image /Width ${w} /Height ${h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n`,
    );
    write(jpeg);
    write("\nendstream\nendobj\n");
  }

  const xrefStart = pos;
  const maxObj = 2 + pageCount * 3;
  write(`xref\n0 ${maxObj + 1}\n`);
  write("0000000000 65535 f \n");
  for (let i = 1; i <= maxObj; i++) {
    const off = offsets[i];
    if (typeof off !== "number") {
      throw new Error(`PDF xref missing object ${i}.`);
    }
    write(`${String(off).padStart(10, "0")} 00000 n \n`);
  }
  write(`trailer\n<< /Size ${maxObj + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`);

  const pdfBytes = concatBytes(parts);
  // Copy into a plain ArrayBuffer slice for maximum Blob compatibility
  const copy = new Uint8Array(pdfBytes.byteLength);
  copy.set(pdfBytes);
  return new Blob([copy.buffer], { type: "application/pdf" });
}

function toAbsoluteUrl(url: string, origin: string) {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const path = url.startsWith("/") ? url : `/${url}`;
  return `${origin}${path}`;
}

export async function downloadAdminBookPdf(bundle: {
  title: string;
  slug: string;
  cover_url: string;
  pages: Array<{ page_number: number; image_url: string }>;
  onProgress?: (message: string) => void;
}) {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const folder = (bundle.slug || "book").replace(/[^\w.-]+/g, "-") || "book";

  const queue: Array<{ label: string; url: string }> = [];
  const cover = toAbsoluteUrl(bundle.cover_url, origin);
  if (cover) queue.push({ label: "cover", url: cover });

  const orderedPages = Array.isArray(bundle.pages) ? [...bundle.pages] : [];
  orderedPages.sort((a, b) => (a.page_number ?? 0) - (b.page_number ?? 0));
  for (const page of orderedPages) {
    const url = toAbsoluteUrl(page?.image_url ?? "", origin);
    if (!url) continue;
    queue.push({ label: `page ${page.page_number}`, url });
  }

  if (queue.length === 0) {
    throw new Error("No images found for this book.");
  }

  const jpegPages: Array<{ jpeg: Uint8Array; width: number; height: number }> = [];
  const failures: string[] = [];

  for (let i = 0; i < queue.length; i++) {
    const item = queue[i];
    bundle.onProgress?.(`Preparing PDF… ${item.label} (${i + 1}/${queue.length})`);
    try {
      const img = await loadImageFromUrl(item.url);
      const jpeg = await imageToJpeg(img);
      jpegPages.push(jpeg);
    } catch (error) {
      const reason = error instanceof Error ? error.message : "unknown error";
      failures.push(`${item.label}: ${reason}`);
      // Cover is optional; page failures are collected and only abort if nothing succeeds
      if (item.label !== "cover" && jpegPages.length === 0 && i === queue.length - 1) {
        // keep going; checked below
      }
    }
  }

  if (jpegPages.length === 0) {
    throw new Error(
      `Could not load any book images for PDF. ${failures.slice(0, 3).join(" · ")}`,
    );
  }

  bundle.onProgress?.(`Building PDF (${jpegPages.length} pages)…`);
  const blob = buildJpegPdf(jpegPages);
  if (!blob || blob.size < 100) {
    throw new Error("PDF file came out empty.");
  }

  const objectUrl = URL.createObjectURL(blob);
  try {
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = `${folder}-admin.pdf`;
    anchor.rel = "noopener";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  } finally {
    setTimeout(() => URL.revokeObjectURL(objectUrl), 2_000);
  }

  return {
    pageCount: jpegPages.length,
    skipped: failures.length,
    failures,
  };
}
