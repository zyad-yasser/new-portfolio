"use client";

import { motion } from "framer-motion";
import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";

const skills = [
  "React",
  "Next.js",
  "TypeScript",
  "Node.js",
  "Python",
  "PostgreSQL",
  "MongoDB",
  "AWS",
  "Docker",
  "Kubernetes",
  "GraphQL",
  "REST APIs",
  "Tailwind CSS",
  "Framer Motion",
  "Jest",
  "Cypress",
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
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
};

export function ModernAbout() {
  return (
    <section className="py-24 px-4">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="grid lg:grid-cols-2 gap-16 items-center"
        >
          {/* Left side - Text content */}
          <div className="space-y-8">
            <motion.div variants={itemVariants}>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">About Me</h2>
              <div className="w-20 h-1 bg-gradient-to-r from-primary to-secondary mb-8" />
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="space-y-6 text-lg text-muted-foreground leading-relaxed"
            >
              <p>
                I'm a passionate full-stack developer with over 5 years of experience building
                modern web applications. I specialize in creating scalable, user-focused solutions
                using cutting-edge technologies.
              </p>

              <p>
                My expertise spans across frontend frameworks like React and Next.js, backend
                technologies including Node.js and Python, and cloud platforms such as AWS. I'm
                passionate about clean code, performance optimization, and delivering exceptional
                user experiences.
              </p>

              <p>
                When I'm not coding, you'll find me exploring new technologies, contributing to
                open-source projects, or sharing knowledge with the developer community.
              </p>
            </motion.div>
          </div>

          {/* Right side - Skills and stats */}
          <div className="space-y-8">
            <motion.div variants={itemVariants}>
              <Card className="p-8">
                <CardContent className="p-0">
                  <h3 className="text-2xl font-semibold mb-6">Skills & Technologies</h3>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill, index) => (
                      <motion.div
                        key={skill}
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05, duration: 0.3 }}
                        viewport={{ once: true }}
                      >
                        <Badge variant="secondary" className="px-3 py-1 text-sm">
                          {skill}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants} className="grid grid-cols-3 gap-6">
              {[
                { number: "50+", label: "Projects Completed" },
                { number: "5+", label: "Years Experience" },
                { number: "100%", label: "Client Satisfaction" },
              ].map((stat, index) => (
                <Card key={index} className="text-center p-6">
                  <CardContent className="p-0">
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      whileInView={{ scale: 1, opacity: 1 }}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                      viewport={{ once: true }}
                      className="text-3xl font-bold text-primary mb-2"
                    >
                      {stat.number}
                    </motion.div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </CardContent>
                </Card>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
