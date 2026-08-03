import { PublicTRPCReactProvider } from "@repo/trpc/public/react";
import { ThemeProvider } from "@repo/ui/theme-provider";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Blog — Zyad Yasser",
  description: "Writing from Zyad Yasser.",
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
          <PublicTRPCReactProvider>{children}</PublicTRPCReactProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
