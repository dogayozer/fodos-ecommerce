const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  try {
    await prisma.$executeRawUnsafe('CREATE EXTENSION IF NOT EXISTS unaccent;')
    console.log('Unaccent extension created successfully.')
  } catch (e) {
    console.error('Error creating unaccent extension:', e)
  } finally {
    await prisma.$disconnect()
  }
}

main()
