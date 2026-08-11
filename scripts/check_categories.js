const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkCategories() {
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: { products: { where: { status: 'active' } } }
      }
    }
  });
  
  console.log(`Total categories: ${categories.length}`);
  const activeCategories = categories.filter(c => c._count.products > 0);
  console.log(`Categories with active products: ${activeCategories.length}`);
  
  console.log("\nCategories with 0 active products (Old/Empty):");
  categories.filter(c => c._count.products === 0).forEach(c => {
    console.log(`- ${c.name} (Slug: ${c.slug})`);
  });

  console.log("\nCategories with active products:");
  activeCategories.forEach(c => {
    console.log(`- ${c.name} (Count: ${c._count.products})`);
  });
}

checkCategories().catch(console.error).finally(() => prisma.$disconnect());
