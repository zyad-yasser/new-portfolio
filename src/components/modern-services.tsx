"use client";

import { motion } from "framer-motion";
import { Boxes, Brain, Cloud, Gauge, Search, Smartphone } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

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

export function ModernServices() {
  return (
    <div className="py-24 px-4 bg-muted/20 border-t border-border">
      <div className="container mx-auto max-w-7xl">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="text-center mb-16"
        >
          <motion.h2
            id="services-heading"
            variants={itemVariants}
            className="text-4xl md:text-5xl font-bold mb-6"
          >
            Services
          </motion.h2>
          <motion.div
            variants={itemVariants}
            className="w-20 h-1 bg-gradient-to-r from-primary to-secondary mx-auto mb-8"
          />
          <motion.p
            variants={itemVariants}
            className="text-xl text-muted-foreground max-w-3xl mx-auto"
          >
            Comprehensive development services to bring your ideas to life with modern technologies
            and best practices.
          </motion.p>
        </motion.div>

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
                    className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:bg-primary/20 transition-all duration-300 border border-primary/20"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                    aria-hidden="true"
                  >
                    <service.icon className="w-8 h-8 text-primary" />
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
