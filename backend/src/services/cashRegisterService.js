const { Prisma } = require('@prisma/client');
const prisma = require('../prisma/client');
const ApiError = require('../utils/ApiError');
const {
  booleanValue,
  nonNegativeNumber,
  optionalString,
  parseId
} = require('../utils/validators');

async function assertNoOpenCashRegister() {
  const current = await prisma.cashRegister.findFirst({
    where: { status: 'OPEN' }
  });

  if (current) {
    throw new ApiError(409, 'Ya existe una caja abierta');
  }
}

async function openCashRegister(payload) {
  await assertNoOpenCashRegister();
  const initialAmount = nonNegativeNumber(payload.initialAmount, 'monto inicial');

  return prisma.cashRegister.create({
    data: {
      initialAmount,
      totalSales: 0,
      expectedAmount: initialAmount,
      openingNote: optionalString(payload.openingNote)
    }
  });
}

async function getCurrentCashRegister() {
  return prisma.cashRegister.findFirst({
    where: { status: 'OPEN' },
    include: {
      _count: { select: { orders: true } }
    }
  });
}

async function listCashRegisterHistory() {
  return prisma.cashRegister.findMany({
    include: {
      _count: { select: { orders: true } }
    },
    orderBy: { openedAt: 'desc' }
  });
}

async function getCashRegister(idValue) {
  const id = parseId(idValue);
  const cashRegister = await prisma.cashRegister.findUnique({
    where: { id },
    include: {
      orders: {
        where: { status: 'PAID' },
        include: {
          items: { orderBy: { addedOrder: 'asc' } }
        },
        orderBy: { paidAt: 'desc' }
      }
    }
  });

  if (!cashRegister) {
    throw new ApiError(404, 'Caja no encontrada');
  }

  return cashRegister;
}

async function updateCashRegister(idValue, payload) {
  const id = parseId(idValue);
  await getCashRegister(id);
  const data = {};

  if (Object.prototype.hasOwnProperty.call(payload, 'openingNote')) {
    data.openingNote = optionalString(payload.openingNote);
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'closingNote')) {
    data.closingNote = optionalString(payload.closingNote);
  }

  return prisma.cashRegister.update({
    where: { id },
    data
  });
}

async function closeCashRegister(payload = {}) {
  return prisma.$transaction(async (tx) => {
    const cashRegister = await tx.cashRegister.findFirst({
      where: { status: 'OPEN' }
    });

    if (!cashRegister) {
      throw new ApiError(400, 'No hay una caja abierta para cerrar');
    }

    if (payload.requireFourDays !== undefined && booleanValue(payload.requireFourDays, 'requireFourDays')) {
      const fourDays = 4 * 24 * 60 * 60 * 1000;
      const openedAt = new Date(cashRegister.openedAt).getTime();

      if (Date.now() - openedAt < fourDays) {
        throw new ApiError(400, 'La caja aun no cumple 4 dias abierta');
      }
    }

    const paidOrders = await tx.order.aggregate({
      where: {
        status: 'PAID',
        cashRegisterId: cashRegister.id
      },
      _sum: { total: true }
    });

    const totalSales = paidOrders._sum.total || new Prisma.Decimal(0);
    const expectedAmount = new Prisma.Decimal(cashRegister.initialAmount).plus(totalSales);

    return tx.cashRegister.update({
      where: { id: cashRegister.id },
      data: {
        status: 'CLOSED',
        closedAt: new Date(),
        closingNote: optionalString(payload.closingNote),
        totalSales,
        expectedAmount
      }
    });
  });
}

module.exports = {
  openCashRegister,
  getCurrentCashRegister,
  listCashRegisterHistory,
  getCashRegister,
  updateCashRegister,
  closeCashRegister
};
