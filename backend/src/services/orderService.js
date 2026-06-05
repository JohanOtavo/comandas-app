const { Prisma } = require('@prisma/client');
const prisma = require('../prisma/client');
const ApiError = require('../utils/ApiError');
const {
  optionalString,
  parseId,
  positiveInteger,
  requiredString
} = require('../utils/validators');

const orderInclude = {
  cashRegister: true,
  items: {
    orderBy: { addedOrder: 'asc' }
  }
};

async function listOrdersByStatus(status, query = {}) {
  const where = { status };

  if (query.search) {
    where.name = {
      contains: String(query.search).trim(),
      mode: 'insensitive'
    };
  }

  return prisma.order.findMany({
    where,
    include: {
      cashRegister: true,
      _count: { select: { items: true } }
    },
    orderBy: status === 'OPEN' ? { createdAt: 'desc' } : { updatedAt: 'desc' }
  });
}

async function getOrder(idValue) {
  const id = parseId(idValue);
  const order = await prisma.order.findUnique({
    where: { id },
    include: orderInclude
  });

  if (!order) {
    throw new ApiError(404, 'Comanda no encontrada');
  }

  return order;
}

function assertOrderIsOpen(order) {
  if (order.status === 'PAID') {
    throw new ApiError(409, 'Una comanda pagada no se puede editar');
  }

  if (order.status === 'DELETED') {
    throw new ApiError(409, 'Una comanda eliminada no se puede editar');
  }
}

async function getOpenOrder(tx, idValue) {
  const id = parseId(idValue);
  const order = await tx.order.findUnique({
    where: { id },
    include: { items: true }
  });

  if (!order) {
    throw new ApiError(404, 'Comanda no encontrada');
  }

  assertOrderIsOpen(order);
  return order;
}

async function recalculateOrderTotal(tx, orderId) {
  const totals = await tx.orderItem.aggregate({
    where: { orderId },
    _sum: { subtotal: true }
  });

  const total = totals._sum.subtotal || new Prisma.Decimal(0);

  return tx.order.update({
    where: { id: orderId },
    data: { total },
    include: orderInclude
  });
}

async function createOrder(payload) {
  const name = requiredString(payload.name, 'nombre de la comanda');

  return prisma.order.create({
    data: { name, total: 0 },
    include: orderInclude
  });
}

async function updateOrder(idValue, payload) {
  const id = parseId(idValue);
  const order = await getOrder(id);
  assertOrderIsOpen(order);

  return prisma.order.update({
    where: { id },
    data: {
      name: requiredString(payload.name, 'nombre de la comanda')
    },
    include: orderInclude
  });
}

async function payOrder(idValue) {
  const id = parseId(idValue);

  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id },
      include: { items: true }
    });

    if (!order) {
      throw new ApiError(404, 'Comanda no encontrada');
    }

    if (order.status === 'PAID') {
      throw new ApiError(409, 'No se puede pagar una comanda que ya fue pagada');
    }

    if (order.status === 'DELETED') {
      throw new ApiError(409, 'No se puede pagar una comanda eliminada');
    }

    const cashRegister = await tx.cashRegister.findFirst({
      where: { status: 'OPEN' }
    });

    if (!cashRegister) {
      throw new ApiError(400, 'No se puede pagar una comanda si no hay caja abierta');
    }

    const paidOrder = await tx.order.update({
      where: { id },
      data: {
        status: 'PAID',
        paidAt: new Date(),
        cashRegisterId: cashRegister.id
      },
      include: orderInclude
    });

    await tx.cashRegister.update({
      where: { id: cashRegister.id },
      data: {
        totalSales: { increment: order.total },
        expectedAmount: { increment: order.total }
      }
    });

    return paidOrder;
  });
}

async function deleteOrder(idValue, payload = {}) {
  const id = parseId(idValue);
  const order = await getOrder(id);
  assertOrderIsOpen(order);

  return prisma.order.update({
    where: { id },
    data: {
      status: 'DELETED',
      deletedAt: new Date(),
      deleteNote: optionalString(payload.deleteNote)
    },
    include: orderInclude
  });
}

async function getOrderItems(orderIdValue, query = {}) {
  const orderId = parseId(orderIdValue, 'orderId');
  await getOrder(orderId);

  const items = await prisma.orderItem.findMany({
    where: { orderId },
    orderBy: { addedOrder: 'asc' }
  });

  if (query.view !== 'grouped') {
    return items;
  }

  const grouped = new Map();

  for (const item of items) {
    const key = String(item.productId);
    const current = grouped.get(key);

    if (!current) {
      grouped.set(key, {
        productId: item.productId,
        productNameSnapshot: item.productNameSnapshot,
        productPriceSnapshot: item.productPriceSnapshot,
        quantity: item.quantity,
        subtotal: item.subtotal,
        firstAddedOrder: item.addedOrder
      });
      continue;
    }

    current.quantity += item.quantity;
    current.subtotal = new Prisma.Decimal(current.subtotal).plus(item.subtotal);
  }

  return Array.from(grouped.values()).sort((a, b) => a.firstAddedOrder - b.firstAddedOrder);
}

async function getOrderItem(orderIdValue, itemIdValue) {
  const orderId = parseId(orderIdValue, 'orderId');
  const itemId = parseId(itemIdValue, 'itemId');
  const item = await prisma.orderItem.findFirst({
    where: { id: itemId, orderId }
  });

  if (!item) {
    throw new ApiError(404, 'Producto de comanda no encontrado');
  }

  return item;
}

async function addOrderItem(orderIdValue, payload) {
  const orderId = parseId(orderIdValue, 'orderId');
  const productId = parseId(payload.productId, 'productId');
  const quantity = positiveInteger(payload.quantity, 'cantidad');

  return prisma.$transaction(async (tx) => {
    await getOpenOrder(tx, orderId);

    const product = await tx.product.findUnique({
      where: { id: productId },
      include: { category: true }
    });

    if (!product || !product.isActive || !product.category.isActive) {
      throw new ApiError(400, 'Solo se pueden agregar productos activos de categorias activas');
    }

    const lastItem = await tx.orderItem.aggregate({
      where: { orderId },
      _max: { addedOrder: true }
    });

    const addedOrder = (lastItem._max.addedOrder || 0) + 1;
    const subtotal = new Prisma.Decimal(product.price).mul(quantity);

    await tx.orderItem.create({
      data: {
        orderId,
        productId,
        productNameSnapshot: product.name,
        productPriceSnapshot: product.price,
        quantity,
        subtotal,
        addedOrder
      }
    });

    return recalculateOrderTotal(tx, orderId);
  });
}

async function updateOrderItem(orderIdValue, itemIdValue, payload) {
  const orderId = parseId(orderIdValue, 'orderId');
  const itemId = parseId(itemIdValue, 'itemId');
  const quantity = positiveInteger(payload.quantity, 'cantidad');

  return prisma.$transaction(async (tx) => {
    await getOpenOrder(tx, orderId);

    const item = await tx.orderItem.findFirst({
      where: { id: itemId, orderId }
    });

    if (!item) {
      throw new ApiError(404, 'Producto de comanda no encontrado');
    }

    const subtotal = new Prisma.Decimal(item.productPriceSnapshot).mul(quantity);

    await tx.orderItem.update({
      where: { id: itemId },
      data: { quantity, subtotal }
    });

    return recalculateOrderTotal(tx, orderId);
  });
}

async function deleteOrderItem(orderIdValue, itemIdValue) {
  const orderId = parseId(orderIdValue, 'orderId');
  const itemId = parseId(itemIdValue, 'itemId');

  return prisma.$transaction(async (tx) => {
    await getOpenOrder(tx, orderId);

    const item = await tx.orderItem.findFirst({
      where: { id: itemId, orderId }
    });

    if (!item) {
      throw new ApiError(404, 'Producto de comanda no encontrado');
    }

    await tx.orderItem.delete({ where: { id: itemId } });
    return recalculateOrderTotal(tx, orderId);
  });
}

module.exports = {
  listOrdersByStatus,
  getOrder,
  createOrder,
  updateOrder,
  payOrder,
  deleteOrder,
  getOrderItems,
  getOrderItem,
  addOrderItem,
  updateOrderItem,
  deleteOrderItem
};
