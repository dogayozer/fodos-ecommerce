import { Metadata } from "next";
import { prisma } from '@/lib/prisma'

export const metadata: Metadata = {
  title: "İptal ve İade Koşulları | Fodos ve Piaks",
  description: "Fodos ve Piaks İptal ve İade Koşulları",
};

export const revalidate = 60;

export default async function IadePage() {
  const settings = await prisma.storeSettings.findUnique({ where: { id: 'default' } })
  const htmlContent = settings?.iptalIadeHtml

  return (
    <main className="max-w-4xl mx-auto px-4 py-12 w-full">
      <h1 className="text-3xl font-bold mb-8 text-trust-blue-600">İptal ve İade Koşulları</h1>
      
      <div className="prose prose-slate max-w-none bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        {htmlContent ? (
          <div dangerouslySetInnerHTML={{ __html: htmlContent.replace(/\n/g, '<br/>') }} />
        ) : (
          <p>İptal ve İade Koşulları henüz eklenmemiştir.</p>
        )}
      </div>
    </main>
  );
}
