const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    take: 1,
    include: { images: true },
    orderBy: {
      images: {
        _count: 'desc'
      }
    }
  });
  console.log(products.length > 0 ? products[0].id : 'No products');
}
main().catch(console.error).finally(() => prisma.$disconnect());
