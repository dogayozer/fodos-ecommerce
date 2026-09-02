import { prisma } from '@/lib/prisma'
import { getMarketplaceClient } from './registry'
import type { MarketplaceAccount } from '@prisma/client'

export interface SyncResult {
  accountId: string
  platform: string
  status: 'success' | 'failed'
  fetched: number
  created: number
  errorMessage?: string
}

/**
 * Tek bir pazaryeri hesabını senkronize eder: siparişleri çeker, (accountId, platformOrderId)
 * benzersiz anahtarıyla upsert eder, hesabın lastSyncAt/lastSyncError alanlarını günceller ve
 * bir MarketplaceSyncLog satırı yazar. Hata durumunda exception FIRLATMAZ — çağıran taraf
 * (cron/sync-now) birden fazla hesabı sırayla işlerken bir hesabın hatası diğerlerini
 * etkilemesin diye burada yutulup SyncResult.status='failed' olarak döner.
 */
export async function syncMarketplaceAccount(account: MarketplaceAccount): Promise<SyncResult> {
  const startedAt = new Date()
  try {
    const client = getMarketplaceClient(account.platform)
    const orders = await client.fetchNewOrders(
      {
        id: account.id,
        platform: account.platform,
        accountLabel: account.accountLabel,
        apiKey: account.apiKey,
        apiSecret: account.apiSecret,
        supplierId: account.supplierId,
      },
      account.lastSyncAt ? account.lastSyncAt.toISOString() : undefined
    )

    let createdCount = 0
    for (const dto of orders) {
      const existing = await prisma.marketplaceOrder.findUnique({
        where: { accountId_platformOrderId: { accountId: account.id, platformOrderId: dto.platformOrderId } },
      })

      if (existing) {
        // Zaten var — durumuna (new/processing/supplied) dokunmuyoruz, sadece bilgi alanlarını tazeliyoruz.
        await prisma.marketplaceOrder.update({
          where: { id: existing.id },
          data: {
            totalAmount: dto.totalAmount,
            rawPayload: dto.raw as any,
          },
        })
        continue
      }

      await prisma.marketplaceOrder.create({
        data: {
          accountId: account.id,
          platformOrderId: dto.platformOrderId,
          orderNumber: dto.orderNumber,
          customerName: dto.customerName,
          customerCity: dto.customerCity,
          customerDistrict: dto.customerDistrict,
          totalAmount: dto.totalAmount,
          currency: dto.currency || 'TRY',
          rawPayload: dto.raw as any,
          platformCreatedAt: dto.platformCreatedAt,
          items: {
            create: dto.items.map((item) => ({
              platformSku: item.platformSku,
              barcode: item.barcode,
              productName: item.productName,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
            })),
          },
        },
      })
      createdCount++
    }

    await prisma.marketplaceAccount.update({
      where: { id: account.id },
      data: { lastSyncAt: new Date(), lastSyncError: null },
    })
    await prisma.marketplaceSyncLog.create({
      data: {
        accountId: account.id,
        platform: account.platform,
        status: 'success',
        fetched: orders.length,
        created: createdCount,
        startedAt,
        completedAt: new Date(),
      },
    })

    return { accountId: account.id, platform: account.platform, status: 'success', fetched: orders.length, created: createdCount }
  } catch (e: any) {
    const errorMessage = e?.message || String(e)
    await prisma.marketplaceAccount.update({
      where: { id: account.id },
      data: { lastSyncError: errorMessage },
    }).catch(() => {})
    await prisma.marketplaceSyncLog.create({
      data: {
        accountId: account.id,
        platform: account.platform,
        status: 'failed',
        errorMessage,
        startedAt,
        completedAt: new Date(),
      },
    }).catch(() => {})

    return { accountId: account.id, platform: account.platform, status: 'failed', fetched: 0, created: 0, errorMessage }
  }
}
