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
          description: 'Müşteri bir ürün aradığında veritabanında arama yapmak için kullanılır. Müşteri kelimeleri yanlış/eksik yazmış olsa bile (örn: "adaptr" -> "adaptör", "kilif" -> "kılıf") sen bunları DÜZELTEREK ve EN YALIN haline getirerek arama yapmalısın. Sadece anahtar kelimeleri dizi (array) olarak gönder.',
          parameters: z.object({
            keywords: z.array(z.string()).describe('Aranacak düzeltilmiş anahtar kelimeler listesi (örn: ["65w", "adaptör"] veya ["iphone", "13", "ekran"])'),
          }),
          // @ts-ignore
          execute: async ({ keywords }) => {
            if (!keywords || keywords.length === 0) return { success: false, message: "Anahtar kelime bulunamadı." };
            
            // Her bir anahtar kelime için, o kelimenin title veya brand içinde geçme şartını (AND) oluşturuyoruz.
            // Bu sayede "65w adaptör" aramasında kelimelerin sırası veya aralarındaki kelimeler önemsiz olur.
            const andConditions = keywords.map((keyword: string) => ({
              OR: [
                { title: { contains: keyword, mode: 'insensitive' as any } },
                { brand: { contains: keyword, mode: 'insensitive' as any } },
                { compatible_models: { contains: keyword, mode: 'insensitive' as any } }
              ]
            }))

            const products = await prisma.product.findMany({
              where: {
                AND: andConditions
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
