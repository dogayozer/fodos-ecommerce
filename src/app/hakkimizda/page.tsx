import { Metadata } from "next";
import { prisma } from '@/lib/prisma'

export const metadata: Metadata = {
  title: "Hakkımızda | Fodos ve Piaks",
  description: "Fodos ve Piaks hakkında kurumsal bilgiler ve firma detaylarımız.",
};

export const revalidate = 60;

export default async function HakkimizdaPage() {
  const settings = await prisma.storeSettings.findUnique({ where: { id: 'default' } })

  return (
    <main className="max-w-4xl mx-auto px-4 py-12 w-full">
      <h1 className="text-3xl font-bold mb-8 text-trust-blue-600">Hakkımızda - Firma Bilgilerimiz</h1>
      
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 mb-8">
        <div className="prose prose-slate max-w-none mb-8">
          {settings?.aboutUs ? (
            <div dangerouslySetInnerHTML={{ __html: settings.aboutUs.replace(/\n/g, '<br/>') }} />
          ) : (
            <p>Hakkımızda bilgisi henüz eklenmemiştir.</p>
          )}
        </div>

        <div className="border-t pt-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">İletişim Bilgileri</h2>
          <div className="space-y-3 text-gray-600">
            {settings?.companyName && (
              <p><strong className="text-gray-900">Firma Adı:</strong> {settings.companyName}</p>
            )}
            {settings?.phone && (
              <p><strong className="text-gray-900">Telefon:</strong> {settings.phone}</p>
            )}
            {settings?.address && (
              <p><strong className="text-gray-900">Adres:</strong> {settings.address}</p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
