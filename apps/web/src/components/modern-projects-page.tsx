"use client";

import { getFirebaseStorageUrl } from "@/constants";
import { containerVariants, itemVariants } from "@/lib/motion";
import { otherProjects, productionProjects } from "@/statics";
import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { motion } from "framer-motion";
import { ExternalLink, Github } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

type Tab = "production" | "other";

const MAX_VISIBLE_SUBPROJECTS = 3;

export function ModernProjectsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("production");

  const currentProjects = activeTab === "production" ? productionProjects : otherProjects;

  return (
    <main className="min-h-dvh bg-background py-20">
      <div className="container mx-auto px-5 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gradient-brand">All Projects</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A comprehensive showcase of my work across various technologies and industries
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex justify-center mb-12"
        >
          <div className="inline-flex glass rounded-lg p-1">
            <Button
              variant={activeTab === "production" ? "default" : "ghost"}
              onClick={() => setActiveTab("production")}
              className="px-6 py-2"
            >
              Production ({productionProjects.length})
            </Button>
            <Button
              variant={activeTab === "other" ? "default" : "ghost"}
              onClick={() => setActiveTab("other")}
              className="px-6 py-2"
            >
              Other ({otherProjects.length})
            </Button>
          </div>
        </motion.div>

        <motion.div
          key={activeTab}
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {currentProjects.map((project, index) => (
            <motion.div key={`${activeTab}-${index}`} variants={itemVariants}>
              <Card
                className={`glass h-full flex flex-col hover:border-primary/50 transition-all duration-300 group overflow-hidden ${
                  project.discontinued ? "opacity-60 grayscale-[40%] hover:opacity-80" : ""
                }`}
              >
                {project.image && (
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={getFirebaseStorageUrl(project.image)}
                      alt={project.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                  </div>
                )}

                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <CardTitle className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                      {project.name}
                    </CardTitle>
                    {project.discontinued && (
                      <Badge variant="outline" className="text-xs text-muted-foreground">
                        Discontinued
                      </Badge>
                    )}
                    {project.private && (
                      <Badge variant="outline" className="text-xs text-muted-foreground">
                        Private
                      </Badge>
                    )}
                    {project.note && (
                      <Badge
                        variant="secondary"
                        className="text-xs bg-primary/10 text-primary border-primary/20"
                      >
                        {project.note}
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="text-muted-foreground line-clamp-3">
                    {project.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-0 flex flex-col flex-1">
                  <div className="flex flex-wrap gap-2 mb-6">
                    {project.technologies.map((tech, techIndex) => (
                      <Badge
                        key={techIndex}
                        variant="secondary"
                        className="text-xs font-medium bg-primary/10 text-primary border-primary/20"
                      >
                        {tech}
                      </Badge>
                    ))}
                  </div>

                  {project.subProjects && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold mb-2 text-foreground">Sub-projects:</h4>
                      <div className="space-y-1">
                        {project.subProjects
                          .slice(0, MAX_VISIBLE_SUBPROJECTS)
                          .map((subProject, subIndex) => (
                            <div key={subIndex} className="text-sm">
                              {subProject.link ? (
                                <a
                                  href={subProject.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline"
                                >
                                  {subProject.name}
                                </a>
                              ) : (
                                <span className="text-muted-foreground">{subProject.name}</span>
                              )}
                              {subProject.description && (
                                <span className="text-muted-foreground">
                                  {" "}
                                  - {subProject.description}
                                </span>
                              )}
                            </div>
                          ))}
                        {project.subProjects.length > MAX_VISIBLE_SUBPROJECTS && (
                          <p className="text-sm text-muted-foreground">
                            +{project.subProjects.length - MAX_VISIBLE_SUBPROJECTS} more
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 mt-auto">
                    {project.link &&
                      (project.link.startsWith("/") ? (
                        <Button size="sm" asChild className="flex-1">
                          <Link
                            href={project.link}
                            className="flex items-center justify-center gap-2"
                          >
                            <ExternalLink className="h-4 w-4" />
                            Preview
                          </Link>
                        </Button>
                      ) : (
                        <Button size="sm" asChild className="flex-1">
                          <a
                            href={project.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2"
                          >
                            <ExternalLink className="h-4 w-4" />
                            {activeTab === "production" ? "Go to Site" : "Live Demo"}
                          </a>
                        </Button>
                      ))}
                    {project.codeLink && (
                      <Button variant="outline" size="sm" asChild className="flex-1">
                        <a
                          href={project.codeLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2"
                        >
                          <Github className="h-4 w-4" />
                          Code
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </main>
  );
}
