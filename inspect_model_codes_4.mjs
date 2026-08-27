import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {
    const count = await prisma.product.count({
      where: {
        OR: [
          { model_code: { contains: 'deji', mode: 'insensitive' } },
          { title: { contains: 'deji', mode: 'insensitive' } },
          { brand: { contains: 'deji', mode: 'insensitive' } }
        ]
      }
    });
    console.log("Total matching DEJI anywhere:", count);
  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
