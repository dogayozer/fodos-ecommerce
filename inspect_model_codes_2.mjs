import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {
    const products = await prisma.product.findMany({
      take: 10,
      where: {
        model_code: { not: null }
      },
      select: { model_code: true, title: true }
    });
    console.log("Products with model code:", products);

    const productsBarcode = await prisma.product.findMany({
      take: 5,
      where: {
        barcode: { contains: 'dgy', mode: 'insensitive' }
      },
      select: { barcode: true, title: true }
    });
    console.log("Products with dgy in barcode:", productsBarcode);
    
    const countBarcode = await prisma.product.count({
      where: { barcode: { contains: 'dgy', mode: 'insensitive' } }
    });
    console.log("Count with dgy in barcode:", countBarcode);

  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
