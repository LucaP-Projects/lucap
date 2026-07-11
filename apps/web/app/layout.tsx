import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Providers } from "./providers";

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "LucaP",
  description: "LucaP is your personal Accounting CRM for LucaPacioli and Andersen Clients' Tax & Legal. It helps you manage your clients, track your time, and generate invoices.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", spaceGrotesk.variable)} suppressHydrationWarning>
      <body className={`${geistMono.variable}`} suppressHydrationWarning>
        <Providers lng="en">{children}</Providers>
      </body>
    </html>
  );
}
