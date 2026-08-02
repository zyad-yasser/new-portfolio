"use client";

import { containerVariants, itemVariants } from "@/lib/motion";
import { openSourceContributions } from "@/statics";
import { motion } from "framer-motion";
import { ExternalLink, Package } from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { SectionHeader } from "./ui/section-header";

export function ModernOpenSource() {
  return (
    <div className="py-24 px-5 sm:px-6 lg:px-8 border-t border-border/60">
      <div className="container mx-auto max-w-7xl">
        <SectionHeader
          id="open-source-heading"
          title="Open Source"
          subtitle="Packages and tools I maintain and share with the community."
          align="left"
        />

        <motion.ul
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={containerVariants}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          aria-label="Open source contributions"
        >
          {openSourceContributions.map((contribution, index) => (
            <motion.li key={index} variants={itemVariants}>
              <div className="animated-border rounded-xl h-full">
                <Card className="bg-card h-full flex flex-col card-hover">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-xl bg-gradient-brand p-[1.5px] mb-4">
                      <div className="w-full h-full rounded-xl bg-card flex items-center justify-center">
                        <Package className="w-5 h-5 text-primary" aria-hidden="true" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <CardTitle className="text-lg sm:text-xl font-bold text-card-foreground break-all">
                        {contribution.name}
                      </CardTitle>
                    </div>
                    <Badge
                      variant="outline"
                      className="w-fit text-xs text-muted-foreground border-border"
                    >
                      {contribution.type}
                    </Badge>
                    <CardDescription className="text-sm sm:text-base leading-relaxed text-muted-foreground">
                      {contribution.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="flex flex-col flex-1">
                    {contribution.technologies && (
                      <div className="flex flex-wrap gap-2 mb-6">
                        {contribution.technologies.map((tech, techIndex) => (
                          <Badge
                            key={techIndex}
                            variant="outline"
                            className="text-xs border-border text-muted-foreground"
                          >
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <Button size="sm" className="mt-auto w-full btn-glow" asChild>
                      <a
                        href={contribution.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`View ${contribution.name}`}
                      >
                        <ExternalLink className="mr-2 h-4 w-4" aria-hidden="true" />
                        View
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </div>
  );
}
