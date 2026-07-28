"use client";

import { getFirebaseStorageUrl } from "@/constants";
import { containerVariants, itemVariants } from "@/lib/motion";
import { productionProjects } from "@/statics";
import { motion } from "framer-motion";
import { ExternalLink, ImageOff } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { SectionHeader } from "./ui/section-header";

const featuredProjects = productionProjects.slice(0, 4);

export function ModernProjects() {
  return (
    <div className="py-24 px-5 sm:px-6 lg:px-8 bg-muted/15 border-t border-border/60">
      <div className="container mx-auto max-w-7xl">
        <SectionHeader
          id="projects-heading"
          title="Featured Projects"
          subtitle="A showcase of my recent work, featuring modern web applications built with cutting-edge technologies."
          align="left"
        />

        <motion.ul
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={containerVariants}
          className="grid lg:grid-cols-2 gap-8"
          aria-label="Featured projects"
        >
          {featuredProjects.map((project, index) => (
            <motion.li key={index} variants={itemVariants}>
              <Card className="glass h-full flex flex-col group card-hover overflow-hidden">
                <div className="relative overflow-hidden h-48 bg-gradient-to-br from-primary/10 to-warning/10 border-b border-border">
                  <div className="absolute inset-0 bg-gradient-to-t from-card/90 to-transparent" />
                  <div className="absolute top-4 left-4">
                    <Badge className="border-transparent bg-gradient-brand text-primary-foreground shadow-lg shadow-primary/20">
                      Production
                    </Badge>
                  </div>
                  <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    {project.link && (
                      <Button
                        size="icon"
                        variant="secondary"
                        className="h-8 w-8 bg-card/80 border-border hover:bg-accent"
                        asChild
                      >
                        <a
                          href={project.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Go to ${project.name}`}
                        >
                          <ExternalLink className="h-4 w-4" aria-hidden="true" />
                        </a>
                      </Button>
                    )}
                  </div>
                  {project.image ? (
                    <Image
                      src={getFirebaseStorageUrl(project.image)}
                      alt={`Screenshot of ${project.name} project`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div
                      className="absolute inset-4 rounded bg-muted/20 flex items-center justify-center"
                      role="img"
                      aria-label="Project placeholder image"
                    >
                      <ImageOff
                        className="h-12 w-12 text-muted-foreground opacity-50"
                        aria-hidden="true"
                      />
                    </div>
                  )}
                </div>

                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl font-bold text-card-foreground group-hover:text-primary transition-colors duration-300">
                    {project.name}
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-base leading-relaxed text-muted-foreground">
                    {project.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4 flex flex-col flex-1">
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech, techIndex) => (
                      <Badge
                        key={techIndex}
                        variant="outline"
                        className="text-xs border-border text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
                      >
                        {tech}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex gap-3 pt-4 mt-auto">
                    {project.link && (
                      <Button size="sm" className="flex-1 btn-glow" asChild>
                        <a
                          href={project.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Go to ${project.name}`}
                        >
                          <ExternalLink className="mr-2 h-4 w-4" aria-hidden="true" />
                          Go to Site
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.li>
          ))}
        </motion.ul>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={itemVariants}
          className="text-center mt-16"
        >
          <Button
            variant="outline"
            size="lg"
            className="text-base sm:text-lg px-6 py-5 sm:px-8 sm:py-6"
            asChild
          >
            <Link href="/projects">View All Projects</Link>
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
