import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {
    const logs = await prisma.chatLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5
    });
    console.log("Recent chat logs:", logs);
  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
