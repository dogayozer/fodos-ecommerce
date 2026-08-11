import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

async function checkAuth() {
  const cookieStore: any = cookies()
  const store = cookieStore instanceof Promise ? await cookieStore : cookieStore
  const session = store.get('admin_session')
  return session?.value === 'authenticated'
}

export async function POST(req: Request) {
  if (!await checkAuth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const { searchWord, targetCategoryId } = await req.json()
    if (!searchWord || !targetCategoryId) return NextResponse.json({ error: 'Eksik bilgi' }, { status: 400 })

    // Prisma updateMany where title or description_raw contains the word (case-insensitive)
    const result = await prisma.product.updateMany({
      where: {
        OR: [
          { title: { contains: searchWord, mode: 'insensitive' } },
          { description_raw: { contains: searchWord, mode: 'insensitive' } }
        ]
      },
      data: {
        categoryId: targetCategoryId
      }
    })
    
    const { revalidateTag } = await import('next/cache')
    // @ts-ignore
    revalidateTag('category-tree')
    // @ts-ignore
    revalidateTag('products-data')

    return NextResponse.json({ success: true, updatedCount: result.count })
  } catch (error: any) {
    return NextResponse.json({ error: 'Toplu taşıma başarısız oldu' }, { status: 500 })
  }
}
