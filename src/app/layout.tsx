import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { StructuredData } from "../components/seo/structured-data";
import { ThemeProvider } from "../components/theme-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://zyadyasser.com"),
  title: {
    default: "Zyad Yasser | Full Stack Developer & Software Engineer",
    template: "%s | Zyad Yasser",
  },
  description:
    "Experienced Full Stack Developer specializing in React, Next.js, Node.js, and modern web technologies. Building scalable, accessible, and high-performance web applications. Based in Port-Said, Egypt.",
  keywords: [
    "Zyad Yasser",
    "Full Stack Developer",
    "Software Engineer",
    "React Developer",
    "Next.js Expert",
    "TypeScript",
    "Node.js",
    "Web Development",
    "Frontend Developer",
    "Backend Developer",
    "JavaScript",
    "Portfolio",
    "Egypt Developer",
    "AWS",
    "Docker",
    "Kubernetes",
    "PostgreSQL",
    "MongoDB",
    "GraphQL",
    "REST API",
    "Mobile Development",
    "UI/UX",
    "Accessibility",
    "Performance Optimization",
  ],
  authors: [{ name: "Zyad Yasser", url: "https://zyadyasser.com" }],
  creator: "Zyad Yasser",
  publisher: "Zyad Yasser",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
  },
  manifest: "/site.webmanifest",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://zyadyasser.com",
    title: "Zyad Yasser | Full Stack Developer & Software Engineer",
    description:
      "Experienced Full Stack Developer specializing in React, Next.js, Node.js, and modern web technologies. Building scalable, accessible, and high-performance web applications.",
    siteName: "Zyad Yasser Portfolio",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Zyad Yasser - Full Stack Developer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Zyad Yasser | Full Stack Developer & Software Engineer",
    description:
      "Experienced Full Stack Developer specializing in React, Next.js, Node.js, and modern web technologies.",
    creator: "@zezoozyad",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: "https://zyadyasser.com",
  },
  category: "technology",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <StructuredData />
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
