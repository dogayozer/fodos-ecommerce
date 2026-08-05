import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { WhatsAppButton } from "./WhatsAppButton";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  title: "Fodos ve Piaks | Orijinal Cep Telefonu Yedek Parçaları",
  description: "Fodos ve Piaks markalı telefon kasası, tuş takımı, şarj aleti ve batarya gibi telefon aksesuarları ve yedek parçalar.",
};

export const revalidate = 60; // 60 saniyede bir önbelleği otomatik yenile

import { getCategoryTree } from "@/lib/data";
import { prisma } from "@/lib/prisma";
import Link from 'next/link';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const tree = await getCategoryTree();
  const settings = await prisma.storeSettings.findUnique({ where: { id: 'default' } });

  return (
    <html
      lang="tr"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-gray-50 text-gray-900 font-display">
        <Header tree={tree} />
        <div className="flex flex-1 max-w-7xl mx-auto w-full">
          <Sidebar tree={tree} />
          <div className="flex-1 min-w-0">
            {children}
          </div>
        </div>
        <footer className="w-full bg-white border-t border-gray-200 py-10 mt-8">
          <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 text-sm">
            <div>
              <h3 className="font-bold text-gray-900 mb-4 text-lg">İletişim</h3>
              {settings?.companyName && <p className="text-gray-600 font-medium mb-2">{settings.companyName}</p>}
              {settings?.phone && <p className="text-gray-600 mb-2"><strong>Tel:</strong> {settings.phone}</p>}
              {settings?.address && <p className="text-gray-600"><strong>Adres:</strong> {settings.address}</p>}
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-4 text-lg">Kurumsal</h3>
              <ul className="space-y-2">
                <li><Link href="/hakkimizda" className="text-gray-600 hover:text-trust-blue-600 transition-colors">Hakkımızda</Link></li>
                <li><Link href="/bilgi-bankasi" className="text-gray-600 hover:text-trust-blue-600 transition-colors">Bilgi Bankası</Link></li>
                <li><Link href="/kargo-takibi" className="text-gray-600 hover:text-trust-blue-600 transition-colors">Kargo Takibi</Link></li>
                <li><Link href="/iletisim" className="text-gray-600 hover:text-trust-blue-600 transition-colors">Bize Ulaşın</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-4 text-lg">Sözleşmeler ve Politikalar</h3>
              <ul className="space-y-2">
                <li><Link href="/mesafeli-satis-sozlesmesi" className="text-gray-600 hover:text-trust-blue-600 transition-colors">Mesafeli Satış Sözleşmesi</Link></li>
                <li><Link href="/gizlilik-ve-guvenlik" className="text-gray-600 hover:text-trust-blue-600 transition-colors">Gizlilik ve Güvenlik Politikası</Link></li>
                <li><Link href="/iptal-iade-kosullari" className="text-gray-600 hover:text-trust-blue-600 transition-colors">İptal ve İade Koşulları</Link></li>
                <li><Link href="/kvkk" className="text-gray-600 hover:text-trust-blue-600 transition-colors">Kişisel Veriler Politikası (KVKK)</Link></li>
              </ul>
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-4 text-center border-t border-gray-100 pt-6">
            <p className="text-sm text-gray-400 font-medium">
              www.KobiKlik Teknoloji ile Tasarlanmıştır
            </p>
          </div>
        </footer>
        <WhatsAppButton />
      </body>
    </html>
  );
}
