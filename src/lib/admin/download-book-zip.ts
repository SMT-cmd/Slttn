/**
 * Admin-only helper: pack cover + page images into an uncompressed ZIP in the browser.
 * Store method only (no compression) — image bytes are already compressed.
 */

function crc32(buf: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function u16(n: number) {
  const b = new Uint8Array(2);
  new DataView(b.buffer).setUint16(0, n, true);
  return b;
}

function u32(n: number) {
  const b = new Uint8Array(4);
  new DataView(b.buffer).setUint32(0, n, true);
  return b;
}

function concat(parts: Uint8Array[]) {
  const total = parts.reduce((sum, p) => sum + p.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
}

function encodeName(name: string) {
  return new TextEncoder().encode(name);
}

function localFileHeader(nameBytes: Uint8Array, size: number, crc: number) {
  return concat([
    u32(0x04034b50),
    u16(20),
    u16(0),
    u16(0),
    u16(0),
    u16(0),
    u32(crc),
    u32(size),
    u32(size),
    u16(nameBytes.length),
    u16(0),
    nameBytes,
  ]);
}

function centralDirectoryHeader(nameBytes: Uint8Array, size: number, crc: number, offset: number) {
  return concat([
    u32(0x02014b50),
    u16(20),
    u16(20),
    u16(0),
    u16(0),
    u16(0),
    u16(0),
    u32(crc),
    u32(size),
    u32(size),
    u16(nameBytes.length),
    u16(0),
    u16(0),
    u16(0),
    u16(0),
    u32(0),
    u32(offset),
    nameBytes,
  ]);
}

function endOfCentralDirectory(count: number, size: number, offset: number) {
  return concat([
    u32(0x06054b50),
    u16(0),
    u16(0),
    u16(count),
    u16(count),
    u32(size),
    u32(offset),
    u16(0),
  ]);
}

export async function buildUncompressedZip(
  files: Array<{ name: string; data: Uint8Array }>,
): Promise<Blob> {
  const localParts: Uint8Array[] = [];
  const centralParts: Uint8Array[] = [];
  let offset = 0;

  for (const file of files) {
    const nameBytes = encodeName(file.name);
    const crc = crc32(file.data);
    const local = localFileHeader(nameBytes, file.data.length, crc);
    localParts.push(local, file.data);
    centralParts.push(centralDirectoryHeader(nameBytes, file.data.length, crc, offset));
    offset += local.length + file.data.length;
  }

  const central = concat(centralParts);
  const end = endOfCentralDirectory(files.length, central.length, offset);
  const zipBytes = concat([...localParts, central, end]);
  return new Blob([zipBytes], { type: "application/zip" });
}

function extensionFromUrl(url: string, fallback = "png") {
  try {
    const path = new URL(url).pathname;
    const match = path.match(/\.([a-zA-Z0-9]+)(?:$|\?)/);
    if (match?.[1]) return match[1].toLowerCase();
  } catch {
    /* ignore */
  }
  return fallback;
}

function padPage(n: number) {
  return String(n).padStart(3, "0");
}

export async function downloadAdminBookZip(bundle: {
  title: string;
  slug: string;
  cover_url: string;
  pages: Array<{ page_number: number; image_url: string }>;
}) {
  const files: Array<{ name: string; data: Uint8Array }> = [];
  const folder = (bundle.slug || "book").replace(/[^\w.-]+/g, "-");

  async function fetchBytes(url: string) {
    const response = await fetch(url, { mode: "cors", credentials: "omit" });
    if (!response.ok) throw new Error(`Could not fetch ${url} (${response.status})`);
    return new Uint8Array(await response.arrayBuffer());
  }

  if (bundle.cover_url) {
    try {
      const data = await fetchBytes(bundle.cover_url);
      files.push({
        name: `${folder}/00-cover.${extensionFromUrl(bundle.cover_url)}`,
        data,
      });
    } catch {
      /* cover may be same-origin path; try absolute later from caller */
    }
  }

  for (const page of bundle.pages) {
    const data = await fetchBytes(page.image_url);
    files.push({
      name: `${folder}/page-${padPage(page.page_number)}.${extensionFromUrl(page.image_url)}`,
      data,
    });
  }

  if (files.length === 0) throw new Error("No downloadable images found for this book.");

  const blob = await buildUncompressedZip(files);
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = `${folder}-admin.zip`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(objectUrl);
}
