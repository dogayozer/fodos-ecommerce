import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {
    const count = await prisma.product.count({
      where: {
        model_code: {
          contains: 'dgy',
          mode: 'insensitive'
        }
      }
    });
    console.log(`Total products with 'dgy' in model_code: ${count}`);
  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
