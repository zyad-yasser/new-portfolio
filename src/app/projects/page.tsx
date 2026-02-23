import { ModernProjectsPage } from "@/components/modern-projects-page";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Explore my portfolio of production-ready web applications and projects. From enterprise solutions to innovative startups, showcasing expertise in React, Next.js, Node.js, and modern web technologies.",
  keywords: [
    "projects",
    "portfolio",
    "web applications",
    "React projects",
    "Next.js applications",
    "full stack projects",
    "software portfolio",
  ],
  openGraph: {
    title: "Projects | Zyad Yasser",
    description:
      "Explore my portfolio of production-ready web applications and projects built with React, Next.js, and modern technologies.",
    url: "https://zyadyasser.com/projects",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Zyad Yasser Projects Portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Projects | Zyad Yasser",
    description:
      "Explore my portfolio of production-ready web applications and projects built with React, Next.js, and modern technologies.",
  },
  alternates: {
    canonical: "https://zyadyasser.com/projects",
  },
};

export default function ProjectsPage() {
  return <ModernProjectsPage />;
}