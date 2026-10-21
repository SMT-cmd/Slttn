import assert from "node:assert/strict";
import { test } from "node:test";
import { File } from "node:buffer";
import { importBookPdf, validateBookPdf } from "../src/lib/admin/import-book-pdf.ts";

test("PDF importer rejects wrong file type and oversized documents", () => {
  assert.throws(() => validateBookPdf({ name: "notes.txt", type: "text/plain", size: 100 }), /Select a PDF/);
  assert.throws(() => validateBookPdf({ name: "large.pdf", type: "application/pdf", size: 101 * 1024 * 1024 }), /100 MB/);
  assert.doesNotThrow(() => validateBookPdf({ name: "notes.pdf", type: "", size: 1024 }));
});

test("PDF importer rejects zero-page files and always destroys the document", async () => {
  let destroyed = false;
  const engine = async () => ({
    GlobalWorkerOptions: { workerSrc: "" },
    getDocument: () => ({
      promise: Promise.resolve({
        numPages: 0,
        getPage: async () => { throw new Error("unexpected"); },
        destroy: async () => { destroyed = true; },
      }),
    }),
  });
  const fakeFile = {
    name: "empty.pdf", type: "application/pdf", size: 10,
    arrayBuffer: async () => new ArrayBuffer(10),
  };
  await assert.rejects(importBookPdf(fakeFile, async () => {}, undefined, engine), /between 1 and 250 pages/);
  assert.equal(destroyed, true);
});

test("PDF importer emits and awaits numbered images in document order", async () => {
  const originalDocument = globalThis.document;
  const originalFile = globalThis.File;
  globalThis.File = File;
  const emitted = [];
  const cleaned = [];
  let destroyed = false;
  globalThis.document = {
    createElement: () => ({
      width: 0, height: 0,
      getContext() {
        return { fillStyle: "", fillRect() {} };
      },
      toBlob(cb) { cb(new Blob([new Uint8Array([1, 2, 3])], { type: "image/jpeg" })); },
    }),
  };
  const engine = async () => ({
    GlobalWorkerOptions: { workerSrc: "" },
    getDocument: () => ({
      promise: Promise.resolve({
        numPages: 3,
        getPage: async (i) => ({
          getViewport: ({ scale }) => ({ width: 100 * scale, height: 150 * scale }),
          render: () => ({ promise: Promise.resolve() }),
          cleanup: () => cleaned.push(i),
        }),
        destroy: async () => { destroyed = true; },
      }),
    }),
  });
  try {
    const fakeFile = {
      name: "book.pdf", type: "application/pdf", size: 10,
      arrayBuffer: async () => new ArrayBuffer(10),
    };
    const count = await importBookPdf(fakeFile, async (pageFile, pageNumber) => {
      emitted.push({ page: pageNumber, name: pageFile.name, type: pageFile.type });
    }, undefined, engine);
    assert.equal(count, 3);
    assert.deepEqual(emitted.map(x => x.page), [1, 2, 3]);
    assert.deepEqual(emitted.map(x => x.name), ["pdf-page-0001.jpg", "pdf-page-0002.jpg", "pdf-page-0003.jpg"]);
    assert.deepEqual(cleaned, [1, 2, 3]);
    assert.ok(destroyed);
  } finally {
    globalThis.File = originalFile;
    globalThis.document = originalDocument;
  }
});
