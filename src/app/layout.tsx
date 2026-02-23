import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "../components/theme-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Zyad Yasser | Full Stack Developer",
  description:
    "Modern portfolio showcasing expertise in React, Next.js, and full-stack development. Accessible, performant, and user-friendly web applications.",
  keywords: ["portfolio", "full-stack", "developer", "react", "nextjs", "typescript", "accessibility", "web development"],
  authors: [{ name: "Zyad Yasser" }],
  viewport: "width=device-width, initial-scale=1",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFC832" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://zyadyasser.com",
    title: "Zyad Yasser | Full Stack Developer",
    description: "Modern portfolio showcasing expertise in React, Next.js, and full-stack development",
    siteName: "Zyad Yasser Portfolio",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <link href="/static/css/lineicons.min.css" rel="stylesheet" />
      </head>
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
