import { getFirebaseStorageUrl } from "@/constants";
import { otherProjects, productionProjects } from "@/statics";
import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

const PREVIEW_PREFIX = "/projects/preview/";

function findProjectBySlug(slug: string) {
  const allProjects = [...productionProjects, ...otherProjects];
  return allProjects.find((project) => project.link === `${PREVIEW_PREFIX}${slug}`);
}

export function generateStaticParams() {
  const allProjects = [...productionProjects, ...otherProjects];
  return allProjects
    .filter((project) => project.link?.startsWith(PREVIEW_PREFIX))
    .map((project) => ({ slug: project.link!.slice(PREVIEW_PREFIX.length) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = findProjectBySlug(slug);

  if (!project) {
    return { title: "Project Preview" };
  }

  return {
    title: `${project.name} Preview`,
    description: project.description,
    robots: { index: false, follow: true },
  };
}

export default async function ProjectPreviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = findProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  return (
    <main className="min-h-dvh bg-background py-20">
      <div className="container mx-auto px-5 sm:px-6 lg:px-8 max-w-3xl">
        <Link
          href="/projects"
          className="text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          ← Back to all projects
        </Link>

        <div className="mt-8 rounded-xl border border-border overflow-hidden">
          {project.image && (
            <div className="relative h-56 sm:h-72">
              <Image
                src={getFirebaseStorageUrl(project.image)}
                alt={project.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 768px"
              />
              <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" />
            </div>
          )}

          <div className="p-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">{project.name}</h1>
            <p className="text-muted-foreground leading-relaxed mb-6">{project.description}</p>

            <div className="flex flex-wrap gap-2 mb-8">
              {project.technologies.map((tech) => (
                <Badge
                  key={tech}
                  variant="secondary"
                  className="text-xs bg-primary/10 text-primary border-primary/20"
                >
                  {tech}
                </Badge>
              ))}
            </div>

            <div className="rounded-lg border border-dashed border-border bg-muted/20 p-6 text-center mb-6">
              <p className="text-sm text-muted-foreground">
                This project predates the current site and isn't hosted live anymore. A restored
                preview is on the way — check back soon.
              </p>
            </div>

            {project.codeLink && (
              <Button variant="outline" asChild>
                <a href={project.codeLink} target="_blank" rel="noopener noreferrer">
                  View Source Code
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
