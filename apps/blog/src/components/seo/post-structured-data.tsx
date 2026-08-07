import Script from "next/script";

export function PostStructuredData({
  post,
  slug,
}: {
  post: {
    title: string;
    excerptText: string;
    coverImageUrl: string | null;
    canonicalUrl: string | null;
    createdAt: Date;
    updatedAt: Date;
    author: { name: string };
  };
  slug: string;
}) {
  const url = post.canonicalUrl ?? `https://blog.zyadyasser.net/post/${slug}`;

  const schema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerptText,
    image: post.coverImageUrl ?? undefined,
    datePublished: post.createdAt.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: {
      "@type": "Person",
      name: post.author.name,
    },
    mainEntityOfPage: url,
  };

  return (
    <Script
      id="post-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }}
    />
  );
}
