"use client";

import { getFirebaseStorageUrl } from "@/constants";
import { motion } from "framer-motion";
import Image from "next/image";
import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";
import { SectionHeader } from "./ui/section-header";

const skills = [
  "TypeScript",
  "React",
  "Next.js",
  "Vue / Nuxt",
  "Node.js",
  "FastAPI",
  "Django",
  "Python",
  "GraphQL",
  "tRPC",
  "WebSockets",
  "LangChain / RAG",
  "PostgreSQL",
  "Redis",
  "AWS",
  "Docker",
  "Kubernetes",
  "Terraform",
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
    <div className="py-24 px-4">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="grid lg:grid-cols-2 gap-16 items-center"
        >
          <div className="space-y-8">
            <motion.div
              variants={itemVariants}
              className="w-24 h-24 rounded-2xl bg-gradient-brand p-[2px]"
            >
              <div className="w-full h-full rounded-2xl overflow-hidden relative bg-card">
                <Image
                  src={getFirebaseStorageUrl("/avatars/zyad.jpg")}
                  alt="Zyad Yasser"
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              </div>
            </motion.div>

            <SectionHeader id="about-heading" title="About Me" align="left" className="mb-0" />

            <motion.div
              variants={itemVariants}
              className="space-y-6 text-lg text-muted-foreground leading-relaxed"
            >
              <p>
                I'm a full-stack software engineer with 7+ years of experience across frontend
                performance, backend systems, and AI-driven applications. I've worked on products
                from early stages through scale — including platforms serving 100,000+ users,
                30,000+ businesses, and 40,000+ daily transactions.
              </p>

              <p>
                Currently building AI-powered EHR systems at Enzo Health, including ambient scribe
                workflows for real-time medical documentation. Previously led performance and
                delivery-systems work at Beyond Menu, and built CharacterHub from scratch to
                100,000+ users at Commaful.
              </p>

              <p>
                My focus is on building fast, reliable systems — obsessing over Core Web Vitals and
                sub-1s load times as much as event-driven backend architecture and AI pipeline
                design.
              </p>
            </motion.div>
          </div>

          <div className="space-y-8">
            <motion.div variants={itemVariants}>
              <Card className="glass p-8">
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
                        <Badge
                          variant="outline"
                          className="px-3 py-1 text-sm border-border/60 transition-colors duration-200 hover:border-primary/50 hover:bg-primary/10 hover:text-primary"
                        >
                          {skill}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.ul
              variants={itemVariants}
              className="grid grid-cols-3 gap-6"
              aria-label="Professional statistics"
            >
              {[
                { number: "100K+", label: "Users Scaled" },
                { number: "$1M+", label: "Cost Savings Delivered" },
                { number: "40K+", label: "Daily Transactions Powered" },
              ].map((stat, index) => (
                <li key={index}>
                  <Card className="glass card-hover text-center p-6">
                    <CardContent className="p-0">
                      <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                        viewport={{ once: true }}
                        className="text-3xl font-bold text-gradient-brand mb-2"
                        aria-label={`${stat.number} ${stat.label}`}
                      >
                        {stat.number}
                      </motion.div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </CardContent>
                  </Card>
                </li>
              ))}
            </motion.ul>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
