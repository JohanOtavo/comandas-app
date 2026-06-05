const prisma = require('../prisma/client');
const ApiError = require('../utils/ApiError');
const {
  booleanValue,
  optionalBoolean,
  optionalString,
  parseId,
  requiredString
} = require('../utils/validators');

async function listCategories(query = {}) {
  const where = {};
  const isActive = optionalBoolean(query.isActive);

  if (isActive !== undefined) {
    where.isActive = isActive;
  }

  if (query.search) {
    where.name = {
      contains: String(query.search).trim(),
      mode: 'insensitive'
    };
  }

  return prisma.category.findMany({
    where,
    include: {
      _count: { select: { products: true } }
    },
    orderBy: { createdAt: 'desc' }
  });
}

async function getCategory(idValue) {
  const id = parseId(idValue);
  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      products: { orderBy: { name: 'asc' } },
      _count: { select: { products: true } }
    }
  });

  if (!category) {
    throw new ApiError(404, 'Categoria no encontrada');
  }

  return category;
}

async function createCategory(payload) {
  const name = requiredString(payload.name, 'nombre');
  const description = optionalString(payload.description);

  return prisma.category.create({
    data: { name, description }
  });
}

async function updateCategory(idValue, payload) {
  const id = parseId(idValue);
  await getCategory(id);

  return prisma.category.update({
    where: { id },
    data: {
      name: requiredString(payload.name, 'nombre'),
      description: optionalString(payload.description)
    }
  });
}

async function setCategoryStatus(idValue, payload) {
  const id = parseId(idValue);
  await getCategory(id);
  const isActive = booleanValue(payload.isActive, 'isActive');

  return prisma.category.update({
    where: { id },
    data: { isActive }
  });
}

async function deleteCategory(idValue) {
  const id = parseId(idValue);
  await getCategory(id);

  const productsCount = await prisma.product.count({ where: { categoryId: id } });

  if (productsCount > 0) {
    return prisma.category.update({
      where: { id },
      data: { isActive: false }
    });
  }

  return prisma.category.delete({ where: { id } });
}

module.exports = {
  listCategories,
  getCategory,
  createCategory,
  updateCategory,
  setCategoryStatus,
  deleteCategory
};
