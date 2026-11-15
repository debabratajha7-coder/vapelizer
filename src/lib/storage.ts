import { v2 as cloudinary } from "cloudinary";

export function storageConfigured() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET,
  );
}

function client() {
  if (!storageConfigured()) {
    throw new Error(
      "Cloudinary is not configured. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to .env.local.",
    );
  }

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  return cloudinary;
}

export async function uploadImage(file: File, folder = "vapelizer") {
  if (!file.type.startsWith("image/")) throw new Error("Upload an image file.");
  if (file.size > 8 * 1024 * 1024) throw new Error("Images must be 8MB or smaller.");

  const buffer = Buffer.from(await file.arrayBuffer());
  const uploaded = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
    const stream = client().uploader.upload_stream({ folder, resource_type: "image" }, (error, result) => {
      if (error || !result) reject(error ?? new Error("Upload failed"));
      else resolve(result);
    });
    stream.end(buffer);
  });

  return { url: uploaded.secure_url, publicId: uploaded.public_id };
}

export async function destroyImage(publicId?: string | null) {
  if (!publicId || !storageConfigured()) return;
  await client().uploader.destroy(publicId);
}
