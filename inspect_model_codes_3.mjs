import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { model_code: { contains: 'dgy', mode: 'insensitive' } },
          { barcode: { contains: 'dgy', mode: 'insensitive' } },
          { title: { contains: 'dgy', mode: 'insensitive' } },
          { slug: { contains: 'dgy', mode: 'insensitive' } }
        ]
      },
      select: { model_code: true, barcode: true, title: true }
    });
    console.log("Total matching DGY anywhere:", products.length);
    console.log(products.slice(0, 5));
  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
