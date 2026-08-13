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
  metadataBase: new URL('https://fodos.com.tr'),
  title: "Fodos ve Piaks | Orijinal Cep Telefonu Yedek Parçaları",
  description: "Fodos ve Piaks markalı telefon kasası, tuş takımı, şarj aleti ve batarya gibi telefon aksesuarları ve yedek parçalar. Türkiye'nin lider tedarikçisi.",
  keywords: ["telefon yedek parça", "sirkeci telefon parçası", "toptan telefon parçası", "fodos", "piaks", "orijinal batarya", "telefon ekranı", "cep telefonu tamir parçaları"],
  openGraph: {
    title: "Fodos ve Piaks | Orijinal Cep Telefonu Yedek Parçaları",
    description: "Türkiye'nin Cep Telefonu Parça Tedarikçisi. Binlerce Tamir Merkezi, Onbinlerce Memnun Müşteri.",
    url: 'https://fodos.com.tr',
    siteName: 'Fodos',
    locale: 'tr_TR',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const revalidate = 60; // 60 saniyede bir önbelleği otomatik yenile

import { getCategoryTree } from "@/lib/data";
import { prisma } from "@/lib/prisma";
import Link from 'next/link';
import SplashIntro from "@/components/SplashIntro";
import { SmartAssistant } from "@/components/SmartAssistant";

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
        <SplashIntro />
        <Header tree={tree} />
        <div className="flex flex-1 max-w-7xl mx-auto w-full">
          <Sidebar tree={tree} />
          <div className="flex-1 min-w-0">
            {children}
          </div>
        </div>
        <footer className="w-full bg-white border-t border-gray-200 py-6 mt-8 text-center text-sm">
          <div className="max-w-7xl mx-auto px-4 flex flex-col items-center space-y-3">
            
            <div className="text-gray-600 font-medium flex flex-col md:flex-row items-center gap-2 md:gap-4">
              {settings?.companyName && <span>{settings.companyName}</span>}
              {settings?.phone && <span><strong>Tel:</strong> {settings.phone}</span>}
              {settings?.address && <span><strong>Adres:</strong> {settings.address}</span>}
            </div>

            <div className="flex flex-wrap justify-center gap-3 text-xs text-gray-500">
              <Link href="/hakkimizda" className="hover:text-trust-blue-600">Hakkımızda</Link>
              <span>|</span>
              <Link href="/iletisim" className="hover:text-trust-blue-600">İletişim</Link>
              <span>|</span>
              <Link href="/mesafeli-satis-sozlesmesi" className="hover:text-trust-blue-600">Sözleşmeler & Politikalar</Link>
              <span>|</span>
              <Link href="/kargo-takibi" className="hover:text-trust-blue-600">Kargo Takibi</Link>
            </div>
            
            <p className="text-xs text-gray-400 font-medium pt-2">
              www.KobiKlik Teknoloji ile Tasarlanmıştır
            </p>

          </div>
        </footer>
        <WhatsAppButton />
        <SmartAssistant />
      </body>
    </html>
  );
}
