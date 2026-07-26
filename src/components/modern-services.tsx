"use client";

import { containerVariants, itemVariants } from "@/lib/motion";
import { motion } from "framer-motion";
import { Boxes, Brain, Cloud, Gauge, Search, Smartphone } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { SectionHeader } from "./ui/section-header";

const services = [
  {
    icon: Gauge,
    title: "Frontend Performance",
    description:
      "Next.js, React, and Vue/Nuxt applications engineered for speed — Core Web Vitals, sub-1s load times, Lighthouse 95+.",
    features: [
      "Next.js & React",
      "Core Web Vitals",
      "SSR & Predictive Prefetching",
      "Lighthouse 95+",
    ],
  },
  {
    icon: Boxes,
    title: "Backend & Systems",
    description:
      "Event-driven architecture and real-time systems with Node.js, FastAPI, and Django at production scale.",
    features: ["Node.js & FastAPI", "Event-Driven Architecture", "GraphQL & tRPC", "WebSockets"],
  },
  {
    icon: Brain,
    title: "AI & LLM Systems",
    description:
      "LLM integrations and RAG pipelines that ship — from ambient documentation to AI pipeline optimization.",
    features: [
      "LLM Integrations",
      "RAG Pipelines (LangChain)",
      "AI Pipeline Optimization",
      "Evaluation",
    ],
  },
  {
    icon: Cloud,
    title: "Cloud & DevOps",
    description:
      "Infrastructure and deployment automation for distributed systems that need to stay up.",
    features: ["AWS & Terraform", "Docker & Kubernetes", "CI/CD Pipelines", "Observability"],
  },
  {
    icon: Search,
    title: "SEO & Technical Growth",
    description:
      "Structured data, sitemaps, and rendering strategy that turn performance work into organic growth.",
    features: [
      "JSON-LD & Structured Data",
      "Sitemaps & Robots",
      "Server-Side Rendering",
      "Caching Strategy",
    ],
  },
  {
    icon: Smartphone,
    title: "Cross-Platform Apps",
    description:
      "Shared-codebase mobile and web applications built for smooth scrolling and low-latency interactions.",
    features: ["Ionic", "iOS & Android", "Shared Codebase", "Low-Latency UI"],
  },
];

export function ModernServices() {
  return (
    <div className="py-24 px-5 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-7xl">
        <SectionHeader
          id="services-heading"
          title="Services"
          subtitle="Comprehensive development services to bring your ideas to life with modern technologies and best practices."
          align="left"
        />

        <motion.ul
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={containerVariants}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          aria-label="Services offered"
        >
          {services.map((service, index) => (
            <motion.li key={index} variants={itemVariants}>
              <Card className="glass h-full group card-hover">
                <CardHeader className="text-center pb-6">
                  <motion.div
                    className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-brand p-[1.5px] transition-transform duration-300"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                    aria-hidden="true"
                  >
                    <div className="w-full h-full rounded-2xl bg-card flex items-center justify-center group-hover:bg-card/70 transition-colors duration-300">
                      <service.icon className="w-8 h-8 text-primary" />
                    </div>
                  </motion.div>
                  <CardTitle className="text-xl font-bold text-card-foreground">
                    {service.title}
                  </CardTitle>
                  <CardDescription className="text-base leading-relaxed text-muted-foreground">
                    {service.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {service.features.map((feature, featureIndex) => (
                      <li
                        key={featureIndex}
                        className="flex items-center text-sm text-muted-foreground"
                      >
                        <div className="w-2 h-2 bg-primary rounded-full mr-3 shadow-sm shadow-primary/50" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </div>
  );
}
