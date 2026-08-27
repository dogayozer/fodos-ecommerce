import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {
    const product = await prisma.product.findUnique({
      where: { barcode: '7690001162404' }
    });
    
    if (product) {
      console.log("Product found!");
      console.log("Barcode:", product.barcode);
      console.log("Title:", product.title);
      console.log("Model Code:", product.model_code);
    } else {
      console.log("Product with barcode 7690001162404 NOT FOUND in the database.");
    }
    
    // Also try checking with findFirst in case findUnique fails for some reason
    const product2 = await prisma.product.findFirst({
      where: { barcode: '7690001162404' }
    });
    console.log("Product via findFirst:", product2 ? product2.model_code : "Not found");
    
  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
