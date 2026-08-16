import { EmailVerificationBanner } from "@/components/email-verification-banner";
import { PublicTRPCReactProvider } from "@repo/trpc/public/react";
import { ThemeProvider } from "@repo/ui/theme-provider";
import { TooltipProvider } from "@repo/ui/tooltip";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://blog.zyadyasser.net"),
  title: {
    default: "Blog — Zyad Yasser",
    template: "%s | Blog — Zyad Yasser",
  },
  description: "Writing from Zyad Yasser.",
  alternates: {
    types: { "application/rss+xml": "/feed.xml" },
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <PublicTRPCReactProvider>
            <TooltipProvider>
              <EmailVerificationBanner />
              {children}
            </TooltipProvider>
          </PublicTRPCReactProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
