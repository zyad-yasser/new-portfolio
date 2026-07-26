"use client";

import { containerVariantsSlow, itemVariantsX } from "@/lib/motion";
import { experience } from "@/statics";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";
import { SectionHeader } from "./ui/section-header";

export function ModernExperience() {
  return (
    <div className="py-24 px-5 sm:px-6 lg:px-8 bg-muted/15 border-t border-border/60">
      <div className="container mx-auto max-w-5xl">
        <SectionHeader
          id="experience-heading"
          title="Experience"
          subtitle="7+ years building products from early stage through scale, across full-stack, systems, and AI engineering."
          align="left"
        />

        <motion.ol
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={containerVariantsSlow}
          className="relative space-y-8 before:absolute before:left-[11px] before:top-3 before:bottom-3 before:w-px before:bg-border md:before:left-1/2"
          aria-label="Work experience timeline"
        >
          {experience.map((job, index) => (
            <motion.li
              key={job.company}
              variants={itemVariantsX}
              className="relative pl-10 md:pl-0"
            >
              <div
                className="absolute left-0 top-3 h-[9px] w-[9px] rounded-full bg-gradient-brand md:left-1/2 md:-translate-x-1/2"
                style={{ boxShadow: "0 0 12px hsl(var(--primary) / 0.6)" }}
                aria-hidden="true"
              />
              <div className={`md:flex ${index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}>
                <div className="md:w-1/2" />
                <div className={`md:w-1/2 ${index % 2 === 0 ? "md:pl-10" : "md:pr-10"}`}>
                  <Card className="glass p-6 card-hover">
                    <CardContent className="p-0 space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-bold text-card-foreground">{job.role}</h3>
                        {job.current && (
                          <Badge className="bg-primary text-primary-foreground">Current</Badge>
                        )}
                      </div>
                      <div className="text-primary font-semibold">{job.company}</div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        <span>{job.period}</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                          {job.location}
                        </span>
                      </div>
                      <ul className="space-y-2 pt-2">
                        {job.highlights.map((highlight) => (
                          <li
                            key={highlight}
                            className="flex gap-2 text-sm text-muted-foreground leading-relaxed"
                          >
                            <span className="text-primary mt-1.5 shrink-0" aria-hidden="true">
                              &bull;
                            </span>
                            {highlight}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </motion.li>
          ))}
        </motion.ol>
      </div>
    </div>
  );
}
