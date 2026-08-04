import { Metadata } from "next";
import { prisma } from '@/lib/prisma'

export const metadata: Metadata = {
  title: "Kargo Takibi | Fodos ve Piaks",
  description: "Fodos ve Piaks Kargo Takibi ve Süreçleri",
};

export const revalidate = 60;

export default async function KargoPage() {
  const settings = await prisma.storeSettings.findUnique({ where: { id: 'default' } })
  const htmlContent = settings?.kargoTakipHtml

  return (
    <main className="max-w-4xl mx-auto px-4 py-12 w-full">
      <h1 className="text-3xl font-bold mb-8 text-trust-blue-600">Kargo Takibi ve Süreçleri</h1>
      
      <div className="prose prose-slate max-w-none bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        {htmlContent ? (
          <div dangerouslySetInnerHTML={{ __html: htmlContent.replace(/\n/g, '<br/>') }} />
        ) : (
          <p>Kargo bilgileri henüz eklenmemiştir.</p>
        )}
      </div>
    </main>
  );
}
