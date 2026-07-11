import type { Metadata } from "next";
<<<<<<< HEAD
import { Geist } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { NextIntlClientProvider } from "next-intl";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { MessageScrollerProvider } from "@/components/ui/message-scroller";
import { Providers } from "./providers";

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
=======
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

>>>>>>> feat/concierge-service-platform
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
<<<<<<< HEAD
    <html lang="en" className={cn("font-sans", geist.variable)} suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
=======
    <html lang="en" className={cn("font-sans", spaceGrotesk.variable)} suppressHydrationWarning>
      <body className={`${geistMono.variable}`} suppressHydrationWarning>
>>>>>>> feat/concierge-service-platform
        <Providers lng="en">{children}</Providers>
      </body>
    </html>
  );
}
