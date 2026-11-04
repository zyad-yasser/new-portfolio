import { EmailVerificationBanner } from "@/components/email-verification-banner";
import { FeedCacheInvalidator } from "@/components/feed-cache-invalidator";
import { PersistedTRPCProvider } from "@/components/persisted-trpc-provider";
import { Toaster } from "@repo/ui/sonner";
import { ThemeProvider } from "@repo/ui/theme-provider";
import { TooltipProvider } from "@repo/ui/tooltip";
import { MotionConfig } from "framer-motion";
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
          <MotionConfig reducedMotion="user">
            <PersistedTRPCProvider>
              <TooltipProvider>
                <FeedCacheInvalidator />
                <EmailVerificationBanner />
                {children}
                <Toaster />
              </TooltipProvider>
            </PersistedTRPCProvider>
          </MotionConfig>
        </ThemeProvider>
      </body>
    </html>
  );
}
