const fs = require("fs/promises");
const fsSync = require("fs");
const path = require("path");
const crypto = require("crypto");
const mime = require("mime-types");

const env = require("../config/env");
const { cloudinary, isCloudinaryConfigured } = require("../config/cloudinary");

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

module.exports = {
  uploadBuffer,
  uploadBase64,
  deleteFile,
  getLocalFilePathFromUrl
};
