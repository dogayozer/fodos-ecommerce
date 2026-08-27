import { PrismaClient } from '@prisma/client'; const prisma = new PrismaClient(); await prisma.storeSettings.findUnique({where: {id: 'default'}}).then(console.log); await prisma.();  
