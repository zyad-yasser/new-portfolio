import Script from "next/script";

export function StructuredData() {
  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Zyad Yasser",
    url: "https://zyadyasser.com",
    image: "https://zyadyasser.com/og-image.png",
    sameAs: [
      "https://github.com/zyad-yasser",
      "https://www.linkedin.com/in/zyad-yasser-developer/",
      "https://twitter.com/zezoozyad",
    ],
    jobTitle: "Full Stack Developer",
    worksFor: {
      "@type": "Organization",
      name: "Freelance",
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: "Port-Said",
      addressCountry: "Egypt",
    },
    email: "zyadyasser6@gmail.com",
    description:
      "Experienced Full Stack Developer specializing in React, Next.js, Node.js, and modern web technologies. Building scalable, accessible, and high-performance web applications.",
    knowsAbout: [
      "React",
      "Next.js",
      "TypeScript",
      "Node.js",
      "Python",
      "JavaScript",
      "Full Stack Development",
      "Web Development",
      "Software Engineering",
      "Cloud Computing",
      "AWS",
      "Docker",
      "Kubernetes",
      "PostgreSQL",
      "MongoDB",
      "GraphQL",
      "REST API",
      "Mobile Development",
      "UI/UX Design",
      "Accessibility",
    ],
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Zyad Yasser Portfolio",
    url: "https://zyadyasser.com",
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
    name: "Zyad Yasser - Full Stack Development Services",
    image: "https://zyadyasser.com/og-image.png",
    "@id": "https://zyadyasser.com",
    url: "https://zyadyasser.com",
    telephone: "+201111980284",
    email: "zyadyasser6@gmail.com",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Port-Said",
      addressRegion: "Port-Said",
      addressCountry: "EG",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 31.2653,
      longitude: 32.3019,
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
        item: "https://zyadyasser.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Projects",
        item: "https://zyadyasser.com/projects",
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
