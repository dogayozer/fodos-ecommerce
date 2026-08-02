import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
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
  if (s === 'pasif' || s === '0' || s === 'false' || s === 'inactive') return 'inactive'
  return 'active'
}

export async function POST(req: Request) {
  const cookieStore: any = cookies()
  const store = cookieStore instanceof Promise ? await cookieStore : cookieStore
  const session = store.get('admin_session')
  if (session?.value !== 'authenticated') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const priceIncreasePercent = parseFloat(formData.get('priceIncreasePercent') as string) || 0
    const discountPercent = parseFloat(formData.get('discountPercent') as string) || 0
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    const buffer = await file.arrayBuffer()
    const workbook = xlsx.read(buffer, { type: 'buffer' })
    const sheetName = workbook.SheetNames[0]
    const sheet = workbook.Sheets[sheetName]
    
    const rows = xlsx.utils.sheet_to_json(sheet) as any[]

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

          const trendyolPriceStr = String(row["Trendyol'da Satılacak Fiyat"] || row["Satış Fiyatı"] || row["Trendyol'da Satılacak Fiyat (KDV Dahil)"] || row["Satış Fiyatı (KDV Dahil)"] || row["Fiyat"] || '0')
          const trendyolPrice = parseFloat(trendyolPriceStr.replace(',', '.')) || 0
          
          let salePrice = trendyolPrice
          let refPrice = trendyolPrice

          if (trendyolPrice > 0) {
            let netPrice = trendyolPrice
            if (trendyolPrice <= 199.99) {
              netPrice = trendyolPrice - 41
            } else if (trendyolPrice <= 349.99) {
              netPrice = trendyolPrice - 79
            } else {
              netPrice = trendyolPrice - 93
            }
            
            salePrice = netPrice * 0.80 // %20 iskonto
            refPrice = trendyolPrice // Eski fiyat olarak Trendyol fiyatını göster

            if (salePrice < 0) salePrice = 0
            if (refPrice < 0) refPrice = 0
          }

          const stockQtyStr = String(row['Ürün Stok Adedi'] || row['Stok'] || row['Stok Adedi'] || '0')
          const stockQty = parseInt(stockQtyStr) || 0
          
          // Determine status
          let status = parseStatus(row['Durum'] || 'Aktif')
          if (stockQty <= 0) status = 'out_of_stock'

          const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + barcode

          // MÜŞTERİ İSTEĞİ: "Marka (I) sütunu yerine, Ürün Adı (L) sütunundaki ilk kelimeyi Marka yap"
          let firstWordBrand = title.trim().split(' ')[0]
          if (!firstWordBrand) firstWordBrand = String(row['Marka'] || '')

          const productData = {
            model_code: String(row['Model Kodu'] || ''),
            brand: firstWordBrand,
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

          let currentProductId = ''
          if (existingBarcodeMap.has(barcode)) {
            const updatedProd = await tx.product.update({
              where: { barcode },
              data: productData,
            })
            currentProductId = updatedProd.id
            updated++
          } else {
            const createdProd = await tx.product.create({
              data: {
                barcode,
                ...productData
              },
            })
            currentProductId = createdProd.id
            created++
          }

          if (currentProductId) {
            await tx.productImage.deleteMany({ where: { productId: currentProductId } })
            const imagesToCreate = []
            for (let idx = 1; idx <= 8; idx++) {
              const imgUrl = String(row[`Görsel ${idx}`] || row[`Gorsel ${idx}`] || '').trim()
              if (imgUrl && imgUrl.startsWith('http')) {
                imagesToCreate.push({
                  productId: currentProductId,
                  url: imgUrl,
                  originalUrl: imgUrl,
                  order: idx - 1
                })
              }
            }
            if (imagesToCreate.length > 0) {
              await tx.productImage.createMany({ data: imagesToCreate })
            }
          }
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

    // Sitenin önbelleğini temizle, yeni ürünler anında görünsün
    revalidatePath('/', 'layout')

    return NextResponse.json({ 
      success: true, 
      summary: { total: rows.length, created, updated, deactivated } 
    })

  } catch (error: any) {
    console.error('Excel upload error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
