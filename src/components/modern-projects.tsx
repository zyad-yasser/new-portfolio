"use client";

import { getFirebaseStorageUrl } from "@/constants";
import { productionProjects } from "@/statics";
import { motion } from "framer-motion";
import { ExternalLink, Github } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

const featuredProjects = productionProjects.slice(0, 4);

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
};

export function ModernProjects() {
  return (
    <div className="py-24 px-4">
      <div className="container mx-auto max-w-7xl">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="text-center mb-16"
        >
          <motion.h2 id="projects-heading" variants={itemVariants} className="text-4xl md:text-5xl font-bold mb-6">
            Featured Projects
          </motion.h2>
          <motion.div
            variants={itemVariants}
            className="w-20 h-1 bg-gradient-to-r from-primary to-secondary mx-auto mb-8"
          />
          <motion.p
            variants={itemVariants}
            className="text-xl text-muted-foreground max-w-3xl mx-auto"
          >
            A showcase of my recent work, featuring modern web applications built with cutting-edge
            technologies.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={containerVariants}
          className="grid lg:grid-cols-2 gap-8"
          role="list"
          aria-label="Featured projects"
        >
          {featuredProjects.map((project, index) => (
            <motion.div key={index} variants={itemVariants} role="listitem">
              <Card className="h-full group card-hover bg-card overflow-hidden">
                {/* Project Image */}
                <div className="relative overflow-hidden h-48 bg-gradient-to-br from-primary/10 to-warning/10 border-b border-border">
                  <div className="absolute inset-0 bg-gradient-to-t from-card/90 to-transparent" />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                      Production
                    </Badge>
                  </div>
                  <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-8 w-8 bg-card/80 border-border hover:bg-accent"
                      aria-label={`View ${project.name} source code`}
                    >
                      <Github className="h-4 w-4" aria-hidden="true" />
                    </Button>
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
                          aria-label={`View ${project.name} live demo`}
                        >
                          <ExternalLink className="h-4 w-4" aria-hidden="true" />
                        </a>
                      </Button>
                    )}
                  </div>
                  {/* Project image */}
                  {project.image ? (
                    <Image
                      src={getFirebaseStorageUrl(project.image)}
                      alt={`Screenshot of ${project.name} project`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="absolute inset-4 rounded bg-muted/20 flex items-center justify-center" role="img" aria-label="Project placeholder image">
                      <div className="text-muted-foreground text-6xl opacity-50" aria-hidden="true">📱</div>
                    </div>
                  )}
                </div>

                <CardHeader>
                  <CardTitle className="text-xl font-bold text-card-foreground group-hover:text-primary transition-colors duration-300">
                    {project.name}
                  </CardTitle>
                  <CardDescription className="text-base leading-relaxed text-muted-foreground">
                    {project.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Technologies */}
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

                  {/* Action buttons */}
                  <div className="flex gap-3 pt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 border-border hover:border-primary/50"
                      aria-label={`View ${project.name} source code`}
                    >
                      <Github className="mr-2 h-4 w-4" aria-hidden="true" />
                      Code
                    </Button>
                    {project.link && (
                      <Button size="sm" className="flex-1 btn-glow" asChild>
                        <a
                          href={project.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`View ${project.name} live demo`}
                        >
                          <ExternalLink className="mr-2 h-4 w-4" aria-hidden="true" />
                          Live Demo
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={itemVariants}
          className="text-center mt-16"
        >
          <Button variant="outline" size="lg" className="text-lg px-8 py-6" asChild>
            <Link href="/projects">View All Projects</Link>
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
