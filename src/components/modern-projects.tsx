"use client";

import { motion } from "framer-motion";
import { ExternalLink, Github } from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

const projects = [
  {
    title: "E-Commerce Platform",
    description:
      "A full-featured e-commerce platform with advanced product filtering, real-time inventory, and secure payment integration.",
    image: "/static/images/project-1.jpg",
    technologies: ["Next.js", "TypeScript", "PostgreSQL", "Stripe", "Tailwind CSS"],
    github: "https://github.com",
    demo: "https://example.com",
    featured: true,
  },
  {
    title: "Task Management App",
    description:
      "Collaborative task management application with real-time updates, team collaboration, and advanced project tracking.",
    image: "/static/images/project-2.jpg",
    technologies: ["React", "Node.js", "Socket.io", "MongoDB", "Material-UI"],
    github: "https://github.com",
    demo: "https://example.com",
    featured: true,
  },
  {
    title: "AI-Powered Analytics",
    description:
      "Business intelligence dashboard with machine learning insights and real-time data visualization capabilities.",
    image: "/static/images/project-3.jpg",
    technologies: ["Python", "FastAPI", "React", "D3.js", "TensorFlow"],
    github: "https://github.com",
    demo: "https://example.com",
    featured: false,
  },
  {
    title: "Social Media Platform",
    description:
      "Modern social networking platform with real-time messaging, content sharing, and advanced privacy controls.",
    image: "/static/images/project-4.jpg",
    technologies: ["React Native", "GraphQL", "Apollo", "AWS", "Redis"],
    github: "https://github.com",
    demo: "https://example.com",
    featured: false,
  },
  {
    title: "Learning Management System",
    description:
      "Comprehensive LMS with video streaming, interactive quizzes, progress tracking, and certification management.",
    image: "/static/images/project-5.jpg",
    technologies: ["Next.js", "Prisma", "PostgreSQL", "AWS S3", "Stripe"],
    github: "https://github.com",
    demo: "https://example.com",
    featured: false,
  },
  {
    title: "IoT Dashboard",
    description:
      "Real-time IoT device monitoring dashboard with data visualization and automated alert systems.",
    image: "/static/images/project-6.jpg",
    technologies: ["Vue.js", "Node.js", "InfluxDB", "MQTT", "Chart.js"],
    github: "https://github.com",
    demo: "https://example.com",
    featured: false,
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

export function ModernProjects() {
  return (
    <section className="py-24 px-4">
      <div className="container mx-auto max-w-7xl">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="text-center mb-16"
        >
          <motion.h2 variants={itemVariants} className="text-4xl md:text-5xl font-bold mb-6">
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
        >
          {projects.map((project, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card className="h-full group card-hover bg-card overflow-hidden">
                {/* Project Image */}
                <div className="relative overflow-hidden h-48 bg-gradient-to-br from-primary/10 to-warning/10 border-b border-border">
                  <div className="absolute inset-0 bg-gradient-to-t from-card/90 to-transparent" />
                  <div className="absolute top-4 left-4">
                    {project.featured && (
                      <Badge className="bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                        Featured
                      </Badge>
                    )}
                  </div>
                  <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-8 w-8 bg-card/80 border-border hover:bg-accent"
                    >
                      <Github className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-8 w-8 bg-card/80 border-border hover:bg-accent"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                  {/* Placeholder for project image */}
                  <div className="absolute inset-4 rounded bg-muted/20 flex items-center justify-center">
                    <div className="text-muted-foreground text-6xl opacity-50">📱</div>
                  </div>
                </div>

                <CardHeader>
                  <CardTitle className="text-xl font-bold text-card-foreground group-hover:text-primary transition-colors duration-300">
                    {project.title}
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
                    >
                      <Github className="mr-2 h-4 w-4" />
                      Code
                    </Button>
                    <Button size="sm" className="flex-1 btn-glow">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Live Demo
                    </Button>
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
          <Button variant="outline" size="lg" className="text-lg px-8 py-6">
            View All Projects
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
