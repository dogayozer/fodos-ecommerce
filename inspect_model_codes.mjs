import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {
    const products = await prisma.product.findMany({
      take: 5,
      select: { model_code: true, barcode: true, title: true }
    });
    console.log(products);
    
    // Also try a raw SQL query just in case Prisma mapping or types are weird
    const rawResult = await prisma.$queryRaw`SELECT model_code, barcode, title FROM "Product" WHERE "model_code" ILIKE 'dgy%' LIMIT 5`;
    console.log("Raw ILIKE 'dgy%':", rawResult);

    const rawResultContains = await prisma.$queryRaw`SELECT COUNT(*) FROM "Product" WHERE "model_code" ILIKE '%dgy%'`;
    console.log("Raw count ILIKE '%dgy%':", rawResultContains);

  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
