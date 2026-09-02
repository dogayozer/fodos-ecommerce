import { generateText, tool, stepCountIs } from 'ai'
import { google } from '@ai-sdk/google'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

export async function POST(req: Request) {
  try {
    const body = await req.json()
    console.log("API /api/chat received body:", JSON.stringify(body, null, 2))
    // Token maliyetini düşürmek için sadece son birkaç mesajı gönderiyoruz (uzun sohbetlerde
    // tüm geçmişi tekrar tekrar modele yollamak gereksiz token tüketimine yol açar).
    const messages = (body.messages || []).slice(-8)

    const result = await generateText({
      model: google('gemini-3.6-flash'),
      maxRetries: 2,
      maxOutputTokens: 350,
      // Araç çağrısından sonra modelin sonucu yorumlayıp gerçek bir metin cevabı üretmesi
      // için en az 2 adıma izin veriyoruz (aksi halde sadece boş text + tool call döner).
      stopWhen: stepCountIs(3),
      // "Thinking" (uzun düşünme) bütçesi minimuma çekildi — bu model tamamen kapatmayı
      // reddediyor (400 hatası), ama düşük bütçe yanıt süresini 30-40sn'den ~5-10sn'ye indiriyor.
      providerOptions: { google: { thinkingConfig: { thinkingBudget: 128 } } },
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
          execute: async (args: any) => {
            // Model bazen şemayı görmezden gelip farklı bir anahtar adıyla (örn. "query")
            // ya da dizi yerine tek bir metinle çağırabiliyor — her ihtimale karşı normalize et.
            // (Önceki halde args.query bir string geldiğinde keywords.map() string üzerinde
            // çalışmaya çalışıp hataya düşüyordu; artık string her zaman kelimelere bölünüyor.)
            const raw = args.keywords ?? args.query ?? args.query_keywords ?? args.keyword ?? null;
            let keywords: string[] = [];
            if (Array.isArray(raw)) {
              keywords = raw.filter((k: any) => typeof k === 'string' && k.trim());
            } else if (typeof raw === 'string' && raw.trim()) {
              keywords = raw.trim().split(/\s+/).filter(Boolean);
            } else if (raw == null && Object.keys(args).length > 0) {
              const val = Object.values(args)[0];
              if (Array.isArray(val)) keywords = (val as any[]).filter((k) => typeof k === 'string');
              else if (typeof val === 'string') keywords = val.trim().split(/\s+/).filter(Boolean);
            }

            if (keywords.length === 0) return { success: false, message: "Anahtar kelime bulunamadı." };

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
              orderBy: [{ has_real_photo: 'desc' }, { stock_qty: 'desc' }],
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

    try {
      const lastUserMessage = messages.slice().reverse().find((m: any) => m.role === 'user');
      const userText = lastUserMessage?.content || "Bilinmiyor";
      
      let isFound = false;
      if (result.toolResults && result.toolResults.length > 0) {
        const tr = result.toolResults[0] as any;
        if (tr.result && tr.result.success && tr.result.products && tr.result.products.length > 0) {
          isFound = true;
        }
      }

      await prisma.chatLog.create({
        data: {
          message: userText,
          response: result.text || "",
          isFound: isFound
        }
      });
    } catch (logErr) {
      console.error("ChatLog kayit hatasi:", logErr);
    }

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
