const prisma = require("../prisma/client");
const ApiError = require("../utils/ApiError");
const { sendSuccess } = require("../utils/response");
const { uploadBuffer, deleteFile } = require("../services/storageService");

const getGallery = async (_req, res) => {
  const items = await prisma.gallery.findMany({
    orderBy: { createdAt: "desc" }
  });

  sendSuccess(res, 200, "Gallery fetched", items);
};

const createGalleryItem = async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "Image file is required");
  }

  const uploaded = await uploadBuffer({
    buffer: req.file.buffer,
    mimetype: req.file.mimetype,
    folder: "gallery"
  });

  const gallery = await prisma.gallery.create({
    data: {
      title: req.body.title,
      imageUrl: uploaded.url,
      publicId: uploaded.publicId,
      uploadedById: req.user.id
    }
  });

  sendSuccess(res, 201, "Gallery image uploaded", gallery);
};

const deleteGalleryItem = async (req, res) => {
  const gallery = await prisma.gallery.findUnique({
    where: { id: req.params.id }
  });

  if (!gallery) {
    throw new ApiError(404, "Gallery item not found");
  }

  await deleteFile({
    publicId: gallery.publicId,
    url: gallery.imageUrl
  });

  await prisma.gallery.delete({
    where: { id: gallery.id }
  });

  sendSuccess(res, 200, "Gallery item deleted");
};

module.exports = {
  getGallery,
  createGalleryItem,
  deleteGalleryItem
};
