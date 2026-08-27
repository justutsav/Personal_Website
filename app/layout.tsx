import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Syne, Inter, Geist_Mono } from "next/font/google";
import { Footer } from "@/components/Footer";
import { SmoothScroll } from "@/components/SmoothScroll";
import { Cursor } from "@/components/Cursor";
import { Preloader } from "@/components/Preloader";
import { MusicProvider } from "@/components/MusicProvider";
import "./globals.css";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://justutsav.com"),
  title: {
    default: "Utsav (justutsav) — Independent Developer",
    template: "%s — Utsav",
  },
  description:
    "Independent developer building web apps, dashboards, mobile apps and automation. Work in production managing ₹75L+ for real businesses.",
  keywords: [
    "justutsav",
    "Utsav",
    "independent developer",
    "full-stack developer",
    "web apps",
    "dashboards",
    "mobile apps",
    "automation",
  ],
  authors: [{ name: "Utsav", url: "https://justutsav.com" }],
  creator: "Utsav",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "https://justutsav.com",
    siteName: "Utsav — justutsav",
    title: "Utsav (justutsav) — Independent Developer",
    description:
      "Independent developer building web apps, dashboards, mobile apps and automation. Work in production managing ₹75L+ for real businesses.",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Utsav (justutsav) — Independent Developer",
    description:
      "Web apps, dashboards, mobile apps and automation — in production for real businesses.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

/** Person schema so Google connects "justutsav" the handle to this site and
 * the profiles it already knows (GitHub etc.) — key for name-query ranking. */
const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Utsav",
  alternateName: "justutsav",
  url: "https://justutsav.com",
  email: "mailto:justutsav.05@gmail.com",
  jobTitle: "Independent Software Developer",
  description:
    "Independent developer building web apps, dashboards, mobile apps and automation for real businesses.",
  sameAs: [
    "https://github.com/justutsav",
    "https://www.linkedin.com/in/justutsav",
    "https://x.com/punctualbeing",
    "https://www.youtube.com/@Blaze_Age",
    "https://monkeytype.com/profile/justutsav",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${syne.variable} ${inter.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col grain">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        <MusicProvider>
          <SmoothScroll>
            <Preloader />
            <Cursor />
            {children}
            <Footer />
          </SmoothScroll>
        </MusicProvider>
        <Analytics />
      </body>
    </html>
  );
}
