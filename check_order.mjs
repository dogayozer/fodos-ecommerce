import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const orderNumber = 'ORD1787773616712225';
  
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { items: true }
  });
  
  console.log("ORDER DETAILS:");
  console.log(JSON.stringify(order, null, 2));
}

main().finally(() => prisma.$disconnect());
