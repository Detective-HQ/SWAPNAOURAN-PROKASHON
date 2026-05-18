const fs = require("fs/promises");
const fsSync = require("fs");
const path = require("path");
const crypto = require("crypto");
const mime = require("mime-types");

const env = require("../config/env");
const { cloudinary, isCloudinaryConfigured } = require("../config/cloudinary");
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");

let s3Client = null;
if (env.r2AccountId && env.r2AccessKeyId && env.r2SecretAccessKey) {
  s3Client = new S3Client({
    region: "auto",
    endpoint: `https://${env.r2AccountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: env.r2AccessKeyId,
      secretAccessKey: env.r2SecretAccessKey,
    },
  });
}

const UPLOADS_ROOT = path.resolve(__dirname, "../../uploads");

const ensureFolder = async (folderPath) => {
  await fs.mkdir(folderPath, { recursive: true });
};

const buildPublicUploadUrl = (folder, filename) => `${env.appBaseUrl}/uploads/${folder}/${filename}`;

const uploadBuffer = async ({ buffer, folder = "misc", filename, mimetype }) => {
  if (!buffer) {
    throw new Error("No file buffer provided");
  }

  if (isCloudinaryConfigured) {
    const base64 = `data:${mimetype || "application/octet-stream"};base64,${buffer.toString("base64")}`;
    const uploaded = await cloudinary.uploader.upload(base64, {
      folder: `book-platform/${folder}`,
      public_id: filename ? filename.replace(/\.[a-z0-9]+$/i, "") : undefined,
      resource_type: "auto"
    });

    return {
      url: uploaded.secure_url,
      publicId: uploaded.public_id,
      storage: "CLOUDINARY"
    };
  }

  const extension = mime.extension(mimetype || "") || "bin";
  const safeName = filename || `${Date.now()}-${crypto.randomUUID()}.${extension}`;
  const folderPath = path.join(UPLOADS_ROOT, folder);
  await ensureFolder(folderPath);

  const finalPath = path.join(folderPath, safeName);
  await fs.writeFile(finalPath, buffer);

  return {
    url: buildPublicUploadUrl(folder, safeName),
    publicId: null,
    storage: "LOCAL"
  };
};

const uploadBase64 = async ({ dataUrl, folder = "misc", filename = null }) => {
  const matches = dataUrl.match(/^data:(.*?);base64,(.*)$/);
  if (!matches) {
    throw new Error("Invalid data URL");
  }

  const [, mimetype, raw] = matches;
  const buffer = Buffer.from(raw, "base64");
  return uploadBuffer({ buffer, folder, filename, mimetype });
};

const deleteFile = async ({ publicId, url }) => {
  if (publicId && isCloudinaryConfigured) {
    await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
    return;
  }

  if (url && s3Client && env.r2PublicUrl && url.startsWith(env.r2PublicUrl)) {
    try {
      const key = url.replace(`${env.r2PublicUrl}/`, "");
      await s3Client.send(new DeleteObjectCommand({
        Bucket: env.r2BucketName,
        Key: key
      }));
    } catch (err) {
      console.error("Failed to delete from R2:", err);
    }
    return;
  }

  if (!url || !url.includes("/uploads/")) {
    return;
  }

  const relativePart = url.split("/uploads/")[1];
  if (!relativePart) {
    return;
  }

  const localPath = path.join(UPLOADS_ROOT, relativePart.replace(/\//g, path.sep));
  if (localPath.startsWith(UPLOADS_ROOT) && fsSync.existsSync(localPath)) {
    await fs.unlink(localPath);
  }
};

const getLocalFilePathFromUrl = (url) => {
  if (!url || !url.includes("/uploads/")) {
    return null;
  }

  const relativePart = url.split("/uploads/")[1];
  if (!relativePart) {
    return null;
  }

  const resolved = path.join(UPLOADS_ROOT, relativePart.replace(/\//g, path.sep));
  return resolved.startsWith(UPLOADS_ROOT) ? resolved : null;
};

// Upload PDFs to Cloudflare R2 if configured, fallback to local storage
const uploadPdf = async ({ buffer, filename }) => {
  if (!buffer) {
    throw new Error("No file buffer provided");
  }

  const safeName = filename || `${Date.now()}-${crypto.randomUUID()}.pdf`;

  if (s3Client && env.r2BucketName && env.r2PublicUrl) {
    try {
      const key = `ebooks/${safeName}`;
      await s3Client.send(new PutObjectCommand({
        Bucket: env.r2BucketName,
        Key: key,
        Body: buffer,
        ContentType: "application/pdf"
      }));

      // Strip trailing slash if present
      const baseUrl = env.r2PublicUrl.endsWith('/') ? env.r2PublicUrl.slice(0, -1) : env.r2PublicUrl;
      
      return {
        url: `${baseUrl}/${key}`,
        publicId: null,
        storage: "CLOUDFLARE_R2"
      };
    } catch (err) {
      console.error("R2 Upload failed, falling back to local:", err);
    }
  }

  const folderPath = path.join(UPLOADS_ROOT, "ebooks");
  await ensureFolder(folderPath);

  const finalPath = path.join(folderPath, safeName);
  await fs.writeFile(finalPath, buffer);

  return {
    url: buildPublicUploadUrl("ebooks", safeName),
    publicId: null,
    storage: "LOCAL"
  };
};

module.exports = {
  uploadBuffer,
  uploadBase64,
  uploadPdf,
  deleteFile,
  getLocalFilePathFromUrl
};
