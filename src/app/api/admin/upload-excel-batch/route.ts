import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'

export const maxDuration = 60;

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

function generateSlug(text: string) {
  const trMap: any = {
    'ç': 'c', 'ğ': 'g', 'ı': 'i', 'i': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u',
    'Ç': 'c', 'Ğ': 'g', 'I': 'i', 'İ': 'i', 'Ö': 'o', 'Ş': 's', 'Ü': 'u'
  }
  let slug = text.replace(/[çğıiöşüÇĞIİÖŞÜ]/g, match => trMap[match])
  return slug
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
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
    const body = await req.json()
    const { chunk, isFinalBatch, filename, allProcessedBarcodes } = body
    
    if (!chunk || !Array.isArray(chunk)) {
      return NextResponse.json({ error: 'Geçersiz veri paketi' }, { status: 400 })
    }

    let created = 0
    let updated = 0
    let deactivated = 0

    // Fetch categories and barcodes once for this chunk
    const existingProducts = await prisma.product.findMany({ select: { barcode: true, status: true } })
    const existingBarcodeMap = new Map(existingProducts.map(p => [p.barcode, p.status]))
    
    const existingCategories = await prisma.category.findMany()
    const categoryCache = new Map(existingCategories.map(c => [c.slug, c]))

    await prisma.$transaction(async (tx) => {
      for (const row of chunk) {
        const barcode = String(row['Barkod'] || '').trim()
        if (!barcode) continue

        const categoryName = String(row['kategori_ismi'] || row['Kategori İsmi'] || 'Diğer').trim()
        const templateType = mapCategoryToTemplateType(categoryName)
        const title = String(row['Ürün Adı'] || '').trim()
        
        let category: any = categoryCache.get(categoryName)
        if (!category) {
          const catSlug = generateSlug(categoryName)
          category = await tx.category.findUnique({ where: { slug: catSlug } })
          if (!category) {
            category = await tx.category.create({
              data: {
                name: categoryName,
                slug: catSlug,
                template_type: templateType,
                risk_profile: templateType === 'battery' ? 'Yüksek Risk' : 'Normal',
              }
            })
          }
          categoryCache.set(categoryName, category)
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
        
        let status = parseStatus(row['Durum'] || 'Aktif')
        if (stockQty <= 0) status = 'out_of_stock'

        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + barcode

        const brandName = String(row['urun_markasi'] || row['Marka'] || '').trim()

        const productData = {
          model_code: String(row['urun_modeli'] || row['Model Kodu'] || ''),
          brand: brandName,
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

    // If it's the final batch, perform cleanup of missing barcodes
    if (isFinalBatch && allProcessedBarcodes) {
      const processedSet = new Set(allProcessedBarcodes)
      
      for (const [barcode, status] of existingBarcodeMap.entries()) {
        if (!processedSet.has(barcode) && status === 'active') {
          await prisma.product.update({
            where: { barcode },
            data: { status: 'inactive' }
          })
          deactivated++
        }
      }

      await prisma.trendyolSyncLog.create({
        data: {
          filename: filename || 'batch_upload',
          status: 'success',
          summary: `Toplu yükleme tamamlandı. Bu son pakette C:${created}, U:${updated}. Pasife Çekilen Toplam: ${deactivated}`,
          completedAt: new Date()
        }
      })

      revalidatePath('/', 'layout')
      const { revalidateTag } = await import('next/cache')
      // @ts-ignore
      revalidateTag('category-tree')
      // @ts-ignore
      revalidateTag('products-data')
    }

    return NextResponse.json({ 
      success: true, 
      summary: { created, updated, deactivated } 
    })

  } catch (error: any) {
    console.error('Batch upload error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
