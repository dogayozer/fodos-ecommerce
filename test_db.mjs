import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log("Testing database connection...");
  try {
    const start = Date.now();
    const result = await prisma.product.findFirst();
    const end = Date.now();
    console.log("Connection successful. Query took", end - start, "ms.");
    console.log("Result:", result ? `Found product ${result.id}` : "No products found");
  } catch (error) {
    console.error("Database connection failed!");
    console.error(error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
