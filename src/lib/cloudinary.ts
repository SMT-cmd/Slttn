import { createHash } from "node:crypto";

export type CloudinaryUploadKind = "cover" | "page";

export type SignedCloudinaryUpload = {
  apiKey: string;
  cloudName: string;
  folder: string;
  publicId: string;
  resourceType: "image";
  signature: string;
  tags: string;
  timestamp: number;
  uploadUrl: string;
};

type UploadSignatureInput = {
  kind: CloudinaryUploadKind;
  bookSlug: string;
  fileName?: string;
};

type UploadResponse = {
  public_id: string;
  secure_url: string;
  bytes: number;
  width: number;
  height: number;
};

function readServerEnv(name: "CLOUDINARY_CLOUD_NAME" | "CLOUDINARY_API_KEY" | "CLOUDINARY_API_SECRET") {
  const value = typeof process !== "undefined" ? process.env[name]?.trim() : undefined;
  if (!value) {
    throw new Error(`${name} is not configured.`);
  }
  return value;
}

function slugifySegment(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function createSignedCloudinaryUpload(input: UploadSignatureInput): SignedCloudinaryUpload {
  if (typeof window !== "undefined") {
    throw new Error("createSignedCloudinaryUpload() is server-only.");
  }

  const cloudName = readServerEnv("CLOUDINARY_CLOUD_NAME");
  const apiKey = readServerEnv("CLOUDINARY_API_KEY");
  const apiSecret = readServerEnv("CLOUDINARY_API_SECRET");
  const safeSlug = slugifySegment(input.bookSlug);
  const safeFile = slugifySegment(input.fileName ?? `${input.kind}-${Date.now()}`);
  const folder = `slt-trade-hub/${input.kind === "cover" ? "covers" : "pages"}/${safeSlug}`;
  const publicId = `${safeSlug}-${safeFile}-${Date.now()}`;
  const tags = [`slt-trade-hub`, input.kind, safeSlug].join(",");
  const timestamp = Math.floor(Date.now() / 1000);
  const payload = `folder=${folder}&public_id=${publicId}&tags=${tags}&timestamp=${timestamp}${apiSecret}`;
  const signature = createHash("sha1").update(payload).digest("hex");

  return {
    apiKey,
    cloudName,
    folder,
    publicId,
    resourceType: "image",
    signature,
    tags,
    timestamp,
    uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
  };
}

export async function uploadFileToCloudinary(file: File, signed: SignedCloudinaryUpload) {
  const body = new FormData();
  body.set("file", file);
  body.set("api_key", signed.apiKey);
  body.set("folder", signed.folder);
  body.set("public_id", signed.publicId);
  body.set("resource_type", signed.resourceType);
  body.set("signature", signed.signature);
  body.set("tags", signed.tags);
  body.set("timestamp", String(signed.timestamp));

  const response = await fetch(signed.uploadUrl, {
    method: "POST",
    body,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Cloudinary upload failed.");
  }

  return (await response.json()) as UploadResponse;
}
