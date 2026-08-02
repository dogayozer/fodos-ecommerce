import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import * as xlsx from 'xlsx'
import { prisma } from '@/lib/prisma'

function mapCategoryToTemplateType(categoryName: string): string {
  const cat = categoryName.toLowerCase()
  if (cat.includes('kasa') || cat.includes('kılıf') || cat.includes('kapak')) return 'case'
  if (cat.includes('tuş takımı')) return 'keypad'
  if (cat.includes('şarj aleti') || cat.includes('adaptör')) return 'charger'
  if (cat.includes('şarj kablosu') || cat.includes('data kablosu')) return 'cable'
  if (cat.includes('batarya')) return 'battery'
  if (cat.includes('koruyucu')) return 'protector'
  return 'generic'
}

function parseStatus(status: any): string {
  const s = String(status).toLowerCase().trim()
  if (s === '1' || s === '1001') return 'active'
  return 'inactive'
}

export async function POST(req: Request) {
  const cookieStore = await cookies()
  const session = cookieStore.get('admin_session')
  if (session?.value !== 'authenticated') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const buffer = await file.arrayBuffer()
    const workbook = xlsx.read(buffer, { type: 'buffer' })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    
    const rows = xlsx.utils.sheet_to_json(worksheet) as any[]

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Excel file is empty' }, { status: 400 })
    }

    let created = 0
    let updated = 0
    let deactivated = 0

    // Fetch existing barcodes to calculate deactivated items
    const existingProducts = await prisma.product.findMany({ select: { barcode: true, status: true } })
    const existingBarcodeMap = new Map(existingProducts.map(p => [p.barcode, p.status]))
    const processedBarcodes = new Set<string>()

    // Chunk size for sqlite
    const CHUNK_SIZE = 100
    for (let i = 0; i < rows.length; i += CHUNK_SIZE) {
      const chunk = rows.slice(i, i + CHUNK_SIZE)
      
      await prisma.$transaction(async (tx) => {
        for (const row of chunk) {
          const barcode = String(row['Barkod'] || '').trim()
          if (!barcode) continue

          processedBarcodes.add(barcode)

          const categoryName = String(row['Kategori İsmi'] || 'Diğer').trim()
          const templateType = mapCategoryToTemplateType(categoryName)
          const title = String(row['Ürün Adı'] || '').trim()
          
          let category = await tx.category.findUnique({ where: { slug: categoryName } })
          if (!category) {
            category = await tx.category.create({
              data: {
                name: categoryName,
                slug: categoryName,
                template_type: templateType,
                risk_profile: templateType === 'battery' ? 'Yüksek Risk' : 'Normal',
              }
            })
          }

          const salePrice = parseFloat(String(row["Trendyol'da Satılacak Fiyat"]).replace(',', '.')) || 0
          const refPrice = parseFloat(String(row["Piyasa Satış Fiyatı (KDV Dahil)"]).replace(',', '.')) || salePrice
          const stockQty = parseInt(String(row['Ürün Stok Adedi'])) || 0
          
          // Determine status
          let status = parseStatus(row['Durum'])
          if (stockQty <= 0) status = 'out_of_stock'

          const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + barcode

          const productData = {
            model_code: String(row['Model Kodu'] || ''),
            brand: String(row['Marka'] || ''),
            categoryId: category.id,
            title: title,
            slug: slug,
            description_raw: String(row['Ürün Açıklaması'] || ''),
            reference_price: refPrice,
            sale_price: salePrice,
            stock_qty: stockQty,
            status: status,
            trendyol_url: String(row['Trendyol.com Linki'] || ''),
            last_synced_at: new Date(),
          }

          if (existingBarcodeMap.has(barcode)) {
            await tx.product.update({
              where: { barcode },
              data: productData,
            })
            updated++
          } else {
            await tx.product.create({
              data: {
                barcode,
                ...productData
              },
            })
            created++
          }

          // In a production app, we would download images from 'Görsel 1'...'Görsel 8' and save to local CDN here.
        }
      })
    }

    // Mark missing items as inactive if they were active
    for (const [barcode, status] of existingBarcodeMap.entries()) {
      if (!processedBarcodes.has(barcode) && status === 'active') {
        await prisma.product.update({
          where: { barcode },
          data: { status: 'inactive' }
        })
        deactivated++
      }
    }

    await prisma.trendyolSyncLog.create({
      data: {
        filename: file.name,
        status: 'success',
        summary: `Created: ${created}, Updated: ${updated}, Deactivated: ${deactivated}`,
        completedAt: new Date()
      }
    })

    return NextResponse.json({ 
      success: true, 
      summary: { total: rows.length, created, updated, deactivated } 
    })

  } catch (error: any) {
    console.error('Excel upload error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
