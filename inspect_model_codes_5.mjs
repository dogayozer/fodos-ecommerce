import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {
    const products = await prisma.product.findMany({
      take: 20,
      where: {
        model_code: { not: null }
      },
      select: { model_code: true, title: true }
    });
    console.log("Sample Model Codes:", products);
  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
