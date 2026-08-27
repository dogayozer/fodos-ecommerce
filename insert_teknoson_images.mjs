import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const prod1 = await prisma.product.findUnique({ where: { barcode: 'TEKNOSON-KARGO-01' } });
  if (prod1) {
    await prisma.productImage.createMany({
      data: [
        { productId: prod1.id, url: 'https://teknoson.com/paketlemetakip/teknosonlogo.png', order: 0 },
        { productId: prod1.id, url: 'https://teknoson.com/paketlemetakip/tanitim1.jfif', order: 1 },
      ],
      skipDuplicates: true
    });
  }

  const prod2 = await prisma.product.findUnique({ where: { barcode: 'TEKNOSON-KARGO-02' } });
  if (prod2) {
    await prisma.productImage.createMany({
      data: [
        { productId: prod2.id, url: 'https://teknoson.com/paketlemetakip/teknosonlogo.png', order: 0 },
        { productId: prod2.id, url: 'https://teknoson.com/paketlemetakip/tanitim2.jfif', order: 1 },
      ],
      skipDuplicates: true
    });
  }

  console.log('Images added successfully!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
