const prisma = require("../prisma/client");
const ApiError = require("../utils/ApiError");
const { sendSuccess } = require("../utils/response");

const getAddresses = async (req, res) => {
  const addresses = await prisma.address.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: "desc" }
  });

  sendSuccess(res, 200, "Addresses fetched successfully", addresses);
};

const createAddress = async (req, res) => {
  const { isDefault, ...data } = req.body;

  if (isDefault) {
    // Unset current default
    await prisma.address.updateMany({
      where: { userId: req.user.id, isDefault: true },
      data: { isDefault: false }
    });
  }

  const count = await prisma.address.count({ where: { userId: req.user.id } });
  
  const address = await prisma.address.create({
    data: {
      ...data,
      userId: req.user.id,
      isDefault: isDefault || count === 0 // Make default if it's the first one
    }
  });

  sendSuccess(res, 201, "Address created successfully", address);
};

const updateAddress = async (req, res) => {
  const { id } = req.params;
  const { isDefault, ...data } = req.body;

  const existing = await prisma.address.findFirst({
    where: { id, userId: req.user.id }
  });

  if (!existing) {
    throw new ApiError(404, "Address not found");
  }

  if (isDefault && !existing.isDefault) {
    await prisma.address.updateMany({
      where: { userId: req.user.id, isDefault: true },
      data: { isDefault: false }
    });
  }

  const updated = await prisma.address.update({
    where: { id },
    data: { ...data, isDefault: isDefault ?? existing.isDefault }
  });

  sendSuccess(res, 200, "Address updated successfully", updated);
};

const deleteAddress = async (req, res) => {
  const { id } = req.params;

  const existing = await prisma.address.findFirst({
    where: { id, userId: req.user.id }
  });

  if (!existing) {
    throw new ApiError(404, "Address not found");
  }

  await prisma.address.delete({ where: { id } });

  // If deleted the default, set another one as default
  if (existing.isDefault) {
    const nextAddress = await prisma.address.findFirst({
      where: { userId: req.user.id }
    });
    if (nextAddress) {
      await prisma.address.update({
        where: { id: nextAddress.id },
        data: { isDefault: true }
      });
    }
  }

  sendSuccess(res, 200, "Address deleted successfully", null);
};

module.exports = {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress
};
