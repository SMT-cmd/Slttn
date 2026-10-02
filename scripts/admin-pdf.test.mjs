import assert from "node:assert/strict";
import { test } from "node:test";
import { buildJpegPdf } from "../src/lib/admin/download-book-pdf.ts";

// 1x1 JPEG (SOI + APP0 + SOF0 + SOS + EOI-style tiny payload)
const TINY_JPEG = Uint8Array.from(
  Buffer.from(
    "/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDAREAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAn/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIQAxAAAAf/2Q==",
    "base64",
  ),
);

test("buildJpegPdf writes a PDF with JPEG streams for each page", async () => {
  const blob = buildJpegPdf([
    { jpeg: TINY_JPEG, width: 1, height: 1 },
    { jpeg: TINY_JPEG, width: 2, height: 3 },
  ]);
  assert.ok(blob.size > 100);
  const bytes = new Uint8Array(await blob.arrayBuffer());
  const text = Buffer.from(bytes).toString("latin1");
  assert.match(text, /^%PDF-1.4/);
  assert.match(text, /\/Count 2/);
  assert.match(text, /\/Filter \/DCTDecode/);
  assert.match(text, /%%EOF/);
});

test("buildJpegPdf rejects missing jpeg bytes instead of throwing length", () => {
  assert.throws(
    () => buildJpegPdf([{ jpeg: undefined, width: 10, height: 10 }]),
    /Missing binary data for page 1/,
  );
});
