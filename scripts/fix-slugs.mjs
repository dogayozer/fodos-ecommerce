import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function generateSlug(text) {
  const trMap = {
    'ç': 'c', 'ğ': 'g', 'ı': 'i', 'i': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u',
    'Ç': 'c', 'Ğ': 'g', 'I': 'i', 'İ': 'i', 'Ö': 'o', 'Ş': 's', 'Ü': 'u'
  }
  let slug = text.replace(/[çğıiöşüÇĞIİÖŞÜ]/g, match => trMap[match])
  return slug
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function main() {
  const categories = await prisma.category.findMany()
  
  for (const cat of categories) {
    const newSlug = generateSlug(cat.name)
    if (newSlug !== cat.slug) {
      console.log(`Updating category slug: "${cat.slug}" -> "${newSlug}"`)
      try {
        await prisma.category.update({
          where: { id: cat.id },
          data: { slug: newSlug }
        })
      } catch(err) {
        console.error(`Failed to update ${cat.name}:`, err.message)
      }
    }
  }
  
  console.log('Done fixing category slugs.')
}

main().catch(console.error).finally(() => prisma.$disconnect())
