import { generateText, tool } from 'ai'
import { google } from '@ai-sdk/google'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

export async function POST(req: Request) {
  try {
    const body = await req.json()
    console.log("API /api/chat received body:", JSON.stringify(body, null, 2))
    const messages = body.messages || []

    const result = await generateText({
      model: google('gemini-flash-latest'),
      messages,
      system: `Sen Fodos ve Piaks markalarının resmi akıllı alışveriş asistanısın. 
      Müşteriler yedek parça, telefon aksesuarı veya elektronik ürünler hakkında sorular soracak.
      Görevlerin:
      1. Müşterilere çok kibar, samimi ve KISA cevaplar ver.
      2. Müşteri bir ürün aradığında KESİNLİKLE 'searchProducts' aracını (tool) kullanarak veritabanından ürünü sorgula.
      3. Veritabanından gelen sonuçları müşteriye sun. Ürün adını, fiyatını (TL) ve kısa açıklamasını belirt.
      4. Bulduğumuz ürünler için müşteriyi her zaman satın almaya veya sepetine eklemeye teşvik et.
      5. Asla stokta olmayan veya veritabanından dönmeyen bir ürünü varmış gibi uydurma.
      `,
      tools: {
        searchProducts: tool({
          description: 'Müşteri bir ürün aradığında veya "elinizde X var mı" diye sorduğunda veritabanında arama yapmak için kullanılır.',
          parameters: z.object({
            query: z.string().describe('Aranacak anahtar kelime, marka veya model (örn: iPhone 13 batarya, şarj aleti, ekran)'),
          }),
          // @ts-ignore - Vercel AI SDK strict type workaround
          execute: async ({ query }) => {
            // Veritabanını yormamak için take: 3 kullanıyoruz ve çok basit bir contains sorgusu yapıyoruz
            const products = await prisma.product.findMany({
              where: {
                OR: [
                  { title: { contains: query, mode: 'insensitive' } },
                  { brand: { contains: query, mode: 'insensitive' } }
                ]
              },
              select: {
                id: true,
                title: true,
                sale_price: true,
                reference_price: true,
                slug: true
              },
              take: 3
            })
            
            if (products.length === 0) {
              return { success: false, message: "Aranan kriterlere uygun ürün bulunamadı." }
            }
            return { success: true, products }
          },
        }),
      }
    })

    return new Response(JSON.stringify({
      text: result.text || "",
      toolCalls: result.toolCalls || [],
      toolResults: result.toolResults || []
    }), {
      headers: {
        'Content-Type': 'application/json',
      }
    })
  } catch (error: any) {
    console.error('Chat API Error:', error)
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
}
