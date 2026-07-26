"use client";

import { experience } from "@/statics";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

export function ModernExperience() {
  return (
    <div className="py-24 px-4 bg-muted/20 border-t border-border">
      <div className="container mx-auto max-w-5xl">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="text-center mb-16"
        >
          <motion.h2
            id="experience-heading"
            variants={itemVariants}
            className="text-4xl md:text-5xl font-bold mb-6"
          >
            Experience
          </motion.h2>
          <motion.div
            variants={itemVariants}
            className="w-20 h-1 bg-gradient-to-r from-primary to-secondary mx-auto mb-8"
          />
          <motion.p
            variants={itemVariants}
            className="text-xl text-muted-foreground max-w-3xl mx-auto"
          >
            7+ years building products from early stage through scale, across full-stack, systems,
            and AI engineering.
          </motion.p>
        </motion.div>

        <motion.ol
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={containerVariants}
          className="relative space-y-8 before:absolute before:left-[11px] before:top-3 before:bottom-3 before:w-px before:bg-border md:before:left-1/2"
          aria-label="Work experience timeline"
        >
          {experience.map((job, index) => (
            <motion.li key={job.company} variants={itemVariants} className="relative pl-10 md:pl-0">
              <div
                className="absolute left-0 top-3 h-[9px] w-[9px] rounded-full bg-primary md:left-1/2 md:-translate-x-1/2"
                style={{ boxShadow: "0 0 12px hsl(var(--color-primary) / 0.6)" }}
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
