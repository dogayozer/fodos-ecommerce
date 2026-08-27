import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {
    const updatedCount = await prisma.$executeRaw`
      UPDATE "Product" 
      SET 
        "sale_price" = "sale_price" * 1.35,
        "reference_price" = "reference_price" * 1.35
      WHERE "barcode" >= '7690001162384'
    `;
    
    console.log(`Successfully updated prices for ${updatedCount} products.`);
    
    // Fetch a few to verify
    const sample = await prisma.product.findMany({
      where: { barcode: { gte: '7690001162384' } },
      take: 2,
      select: { barcode: true, title: true, sale_price: true, reference_price: true }
    });
    console.log("Verified sample:", sample);
    
  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
