import Script from "next/script";

export function StructuredData() {
  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Zyad Yasser",
    url: "https://zyadyasser.net",
    image: "https://zyadyasser.net/og-image.png",
    sameAs: [
      "https://github.com/zyad-yasser",
      "https://www.linkedin.com/in/zyad-yasser-developer/",
      "https://twitter.com/zezoozyad",
    ],
    jobTitle: "Software Engineer (Full-Stack / Systems / AI)",
    worksFor: {
      "@type": "Organization",
      name: "Enzo Health",
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: "Cairo",
      addressCountry: "Egypt",
    },
    email: "zyadyasser6@gmail.com",
    description:
      "Software engineer with 7+ years building fast, reliable systems — from AI-powered EHR products to platforms serving 100,000+ users. Specializing in Next.js, event-driven backends, and LLM/RAG systems.",
    knowsAbout: [
      "React",
      "Next.js",
      "Vue",
      "Nuxt",
      "TypeScript",
      "Node.js",
      "FastAPI",
      "Django",
      "Python",
      "LLM Integrations",
      "RAG Pipelines",
      "LangChain",
      "Event-Driven Architecture",
      "GraphQL",
      "tRPC",
      "WebSockets",
      "AWS",
      "Docker",
      "Kubernetes",
      "Terraform",
      "PostgreSQL",
      "Redis",
      "Web Performance",
      "SEO",
      "Accessibility",
    ],
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Zyad Yasser Portfolio",
    url: "https://zyadyasser.net",
    description:
      "Professional portfolio of Zyad Yasser, Full Stack Developer specializing in modern web technologies",
    author: {
      "@type": "Person",
      name: "Zyad Yasser",
    },
    inLanguage: "en-US",
  };

  const professionalServiceSchema = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: "Zyad Yasser - Software Engineering Services",
    image: "https://zyadyasser.net/og-image.png",
    "@id": "https://zyadyasser.net",
    url: "https://zyadyasser.net",
    telephone: "+201111980284",
    email: "zyadyasser6@gmail.com",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Cairo",
      addressRegion: "Cairo",
      addressCountry: "EG",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 30.0444,
      longitude: 31.2357,
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "09:00",
      closes: "18:00",
    },
    sameAs: [
      "https://github.com/zyad-yasser",
      "https://www.linkedin.com/in/zyad-yasser-developer/",
    ],
    priceRange: "$$",
    areaServed: {
      "@type": "Country",
      name: "Worldwide",
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://zyadyasser.net",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Projects",
        item: "https://zyadyasser.net/projects",
      },
    ],
  };

  return (
    <>
      <Script
        id="person-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
      <Script
        id="website-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <Script
        id="professional-service-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(professionalServiceSchema) }}
      />
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </>
  );
}
