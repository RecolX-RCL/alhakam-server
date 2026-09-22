import type { Metadata, Viewport } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/providers";
import { ManifestSwitcher } from "@/components/workshop/manifest-switcher";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "المنصوري الهكام | إدارة الفواتير والزبائن",
  description: "نظام إدارة فواتير ودفعات ورشة المنصوري الهكام. للمدير: متابعة كل الزبائن. للزبون: متابعة فاتورته ودفعاته.",
  keywords: ["ألمنيوم", "فواتير", "دفعات", "ورشة", "زبائن", "المنصوري الهكام"],
  authors: [{ name: "المنصوري الهكام" }],
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/apple-touch-icon.png",
  },
  openGraph: {
    title: "المنصوري الهكام · مطابع ألمنيوم",
    description: "نظام إدارة فواتير ودفعات ورشة المنصوري الهكام",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#1A2530",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body
        className={`${cairo.variable} font-sans antialiased bg-background text-foreground min-h-screen`}
      >
        <Providers>
          <ManifestSwitcher />
          {children}
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}
