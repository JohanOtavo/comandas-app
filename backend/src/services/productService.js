const prisma = require('../prisma/client');
const ApiError = require('../utils/ApiError');
const {
  booleanValue,
  optionalBoolean,
  optionalString,
  parseId,
  positiveNumber,
  requiredString
} = require('../utils/validators');

async function listProducts(query = {}) {
  const where = {};
  const isActive = optionalBoolean(query.isActive);

  if (isActive !== undefined) {
    where.isActive = isActive;
  }

  if (query.categoryId) {
    where.categoryId = parseId(query.categoryId, 'categoryId');
  }

  if (query.search) {
    where.name = {
      contains: String(query.search).trim(),
      mode: 'insensitive'
    };
  }

  return prisma.product.findMany({
    where,
    include: { category: true },
    orderBy: [{ isActive: 'desc' }, { name: 'asc' }]
  });
}

async function getProduct(idValue) {
  const id = parseId(idValue);
  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: true }
  });

  if (!product) {
    throw new ApiError(404, 'Producto no encontrado');
  }

  return product;
}

async function assertCategoryExists(categoryId) {
  const category = await prisma.category.findUnique({ where: { id: categoryId } });

  if (!category) {
    throw new ApiError(400, 'No se pueden crear productos sin categoria');
  }

  return category;
}

async function createProduct(payload) {
  const categoryId = parseId(payload.categoryId, 'categoryId');
  await assertCategoryExists(categoryId);

  return prisma.product.create({
    data: {
      categoryId,
      name: requiredString(payload.name, 'nombre'),
      description: optionalString(payload.description),
      price: positiveNumber(payload.price, 'precio')
    },
    include: { category: true }
  });
}

async function updateProduct(idValue, payload) {
  const id = parseId(idValue);
  await getProduct(id);
  const categoryId = parseId(payload.categoryId, 'categoryId');
  await assertCategoryExists(categoryId);

  return prisma.product.update({
    where: { id },
    data: {
      categoryId,
      name: requiredString(payload.name, 'nombre'),
      description: optionalString(payload.description),
      price: positiveNumber(payload.price, 'precio')
    },
    include: { category: true }
  });
}

async function setProductStatus(idValue, payload) {
  const id = parseId(idValue);
  await getProduct(id);
  const isActive = booleanValue(payload.isActive, 'isActive');

  return prisma.product.update({
    where: { id },
    data: { isActive },
    include: { category: true }
  });
}

async function deleteProduct(idValue) {
  const id = parseId(idValue);
  await getProduct(id);
  const orderItemsCount = await prisma.orderItem.count({ where: { productId: id } });

  if (orderItemsCount > 0) {
    return prisma.product.update({
      where: { id },
      data: { isActive: false },
      include: { category: true }
    });
  }

  return prisma.product.delete({ where: { id } });
}

module.exports = {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  setProductStatus,
  deleteProduct
};
