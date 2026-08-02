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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-gray-50 text-gray-900 font-display">
        <Header />
        <div className="flex flex-1 max-w-7xl mx-auto w-full">
          <Sidebar />
          <div className="flex-1 min-w-0">
            {children}
          </div>
        </div>
        <WhatsAppButton />
      </body>
    </html>
  );
}
