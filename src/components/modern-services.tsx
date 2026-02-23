"use client";

import { motion } from "framer-motion";
import { Code2, Smartphone, Globe, Database, Cloud, Palette } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

const services = [
  {
    icon: Code2,
    title: "Frontend Development",
    description:
      "Modern, responsive web applications using React, Next.js, and TypeScript with pixel-perfect designs.",
    features: ["React & Next.js", "TypeScript", "Responsive Design", "Performance Optimization"],
  },
  {
    icon: Database,
    title: "Backend Development",
    description:
      "Scalable server-side solutions with Node.js, Python, and robust database architectures.",
    features: ["API Development", "Database Design", "Authentication", "Real-time Features"],
  },
  {
    icon: Smartphone,
    title: "Mobile Development",
    description:
      "Cross-platform mobile applications using React Native and modern mobile technologies.",
    features: ["React Native", "iOS & Android", "Push Notifications", "App Store Deployment"],
  },
  {
    icon: Cloud,
    title: "Cloud & DevOps",
    description:
      "Cloud infrastructure, deployment automation, and CI/CD pipeline setup for scalable applications.",
    features: ["AWS/Azure", "Docker", "CI/CD", "Monitoring"],
  },
  {
    icon: Globe,
    title: "Full-Stack Solutions",
    description:
      "End-to-end web application development from concept to deployment with modern best practices.",
    features: ["MEAN/MERN Stack", "Microservices", "API Integration", "Testing"],
  },
  {
    icon: Palette,
    title: "UI/UX Design",
    description:
      "User-centered design approach creating intuitive interfaces with modern design systems.",
    features: ["Design Systems", "Prototyping", "User Research", "Accessibility"],
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
          <motion.h2 id="services-heading" variants={itemVariants} className="text-4xl md:text-5xl font-bold mb-6">
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

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={containerVariants}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          role="list"
          aria-label="Services offered"
        >
          {services.map((service, index) => (
            <motion.div key={index} variants={itemVariants} role="listitem">
              <Card className="h-full group card-hover bg-card">
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
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
