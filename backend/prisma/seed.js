const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const bebidas = await prisma.category.upsert({
    where: { name: 'Bebidas' },
    update: {},
    create: {
      name: 'Bebidas',
      description: 'Jugos, gaseosas y bebidas calientes'
    }
  });

  const comidas = await prisma.category.upsert({
    where: { name: 'Comidas' },
    update: {},
    create: {
      name: 'Comidas',
      description: 'Platos principales y comidas rapidas'
    }
  });

  const products = [
    {
      name: 'Jugo natural',
      description: 'Jugo del dia',
      price: 5000,
      categoryId: bebidas.id
    },
    {
      name: 'Cafe',
      description: 'Cafe tinto caliente',
      price: 2500,
      categoryId: bebidas.id
    },
    {
      name: 'Hamburguesa',
      description: 'Hamburguesa de la casa',
      price: 18000,
      categoryId: comidas.id
    }
  ];

  for (const product of products) {
    const existing = await prisma.product.findFirst({
      where: { name: product.name, categoryId: product.categoryId }
    });

    if (!existing) {
      await prisma.product.create({ data: product });
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
