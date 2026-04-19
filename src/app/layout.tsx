import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import NavbarWrapper from "@/components/provider/NavbarWrapper";
import SessionProviderWrapper from "@/components/provider/sessionProviderWraper";
import QueryProvider from "@/components/provider/Query-provider";
import { ThemeProvider } from "next-themes";
import RouteProgress from "@/components/provider/RoutePregress";
import ScrollToTopButton from "@/components/reusable/scrol-top-button";
import PageTracker from "@/app/service/page-tracer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || "https://news-hub-iota-silk.vercel.app",
  ),
  title: {
    template: "%s | NewsHub",
    default: "NewsHub - Berita Terkini Indonesia",
  },
  description:
    "Portal berita terpercaya untuk berita terkini, trending, dan breaking news Indonesia.",
  openGraph: {
    title: "NewsHub - Berita Terkini Indonesia",
    description:
      "Portal berita terpercaya untuk berita terkini, trending, dan breaking news Indonesia.",
    url: "/",
    siteName: "NewsHub",
    images: [
      {
        url: "/newshub.png",
        width: 1200,
        height: 630,
        alt: "NewsHub",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NewsHub - Berita Terkini Indonesia",
    description:
      "Portal berita terpercaya untuk berita terkini, trending, dan breaking news Indonesia.",
    images: ["/newshub.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
        >
          <QueryProvider>
            <SessionProviderWrapper>
              <NavbarWrapper />
              <RouteProgress />
              <ScrollToTopButton threshold={600} />
              <PageTracker />
              {children}
              <Toaster />
            </SessionProviderWrapper>
          </QueryProvider>
        </ThemeProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "NewsHub",
              alternateName: "NewsHub Indonesia",
              url: "https://news-hub-iota-silk.vercel.app",
              potentialAction: {
                "@type": "SearchAction",
                target: {
                  "@type": "EntryPoint",
                  urlTemplate:
                    "https://news-hub-iota-silk.vercel.app/search-news?q={search_term_string}",
                },
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
      </body>
    </html>
  );
}
