import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {
    const product = await prisma.product.findUnique({
      where: { barcode: '7690001162404' }
    });
    console.log(product);
  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
