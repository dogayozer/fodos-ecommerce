import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {
    const products = await prisma.product.findMany({
      where: {
        barcode: {
          gte: '7690001162384' // string comparison works well for fixed length EAN barcodes
        }
      },
      select: { barcode: true, title: true, sale_price: true, reference_price: true }
    });
    
    // Check if they are actually purely numeric and filter correctly just in case
    const targetBarcode = BigInt('7690001162384');
    const affectedProducts = products.filter(p => {
      try {
        return BigInt(p.barcode) >= targetBarcode;
      } catch (e) {
        // if barcode is not numeric, use string comparison
        return p.barcode >= '7690001162384';
      }
    });

    console.log(`Total products to be updated: ${affectedProducts.length}`);
    console.log("Sample of products to update:", affectedProducts.slice(0, 5));
    
  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
