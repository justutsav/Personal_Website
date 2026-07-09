import type { Metadata } from "next";
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
  title: "Utsav",
  description:
    "Independent developer building web apps, dashboards, mobile apps and automation. Work in production managing ₹75L+ for real businesses.",
  metadataBase: new URL("https://justutsav.com"),
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
        <MusicProvider>
          <SmoothScroll>
            <Preloader />
            <Cursor />
            {children}
            <Footer />
          </SmoothScroll>
        </MusicProvider>
      </body>
    </html>
  );
}
