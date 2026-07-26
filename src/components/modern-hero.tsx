"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowDown, Github, Linkedin, Mail } from "lucide-react";
import { AmbientGradient } from "./ambient-gradient";
import { Button } from "./ui/button";

export function ModernHero() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section
      className="min-h-dvh flex items-center justify-center relative overflow-hidden"
      aria-label="Hero section"
    >
      <div className="absolute inset-0 bg-background" />
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, hsl(var(--border)) 1px, transparent 0)",
          backgroundSize: "24px 24px",
        }}
      />
      <AmbientGradient variant="hero" />

      <div className="container mx-auto px-5 sm:px-6 lg:px-8 z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl mx-auto"
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="inline-flex items-center gap-2 mb-8 px-4 py-1.5 rounded-full border border-border/60 glass text-sm text-muted-foreground"
          >
            <span className="relative flex h-2 w-2" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
            </span>
            Available for new opportunities
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-foreground tracking-tight"
          >
            Zyad Yasser
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-lg md:text-xl text-muted-foreground mb-8 font-medium"
          >
            Software Engineer — Full-Stack, Systems &amp; AI
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed"
          >
            Building fast, reliable systems — from AI-powered products to platforms serving 100,000+
            users. Focused on performance, scale, and user experience.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12"
          >
            <Button
              size="lg"
              className="text-lg px-8 py-6 btn-glow"
              onClick={() =>
                document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })
              }
              aria-label="Scroll to contact section"
            >
              <Mail className="mr-2 h-5 w-5" aria-hidden="true" />
              Get In Touch
            </Button>
            <button
              type="button"
              className="text-lg font-medium text-foreground underline decoration-primary/40 underline-offset-4 transition-colors duration-200 hover:decoration-primary"
              onClick={() =>
                document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" })
              }
              aria-label="Scroll to projects section"
            >
              View My Work
            </button>
          </motion.div>

          <motion.ul
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="flex justify-center gap-4 mb-16"
            aria-label="Social media links"
          >
            <li>
              <Button variant="ghost" size="icon" className="h-12 w-12" asChild>
                <a
                  href="https://github.com/zyad-yasser"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Visit my GitHub profile"
                >
                  <Github className="h-6 w-6" aria-hidden="true" />
                </a>
              </Button>
            </li>
            <li>
              <Button variant="ghost" size="icon" className="h-12 w-12" asChild>
                <a
                  href="https://www.linkedin.com/in/zyad-yasser-developer/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Visit my LinkedIn profile"
                >
                  <Linkedin className="h-6 w-6" aria-hidden="true" />
                </a>
              </Button>
            </li>
            <li>
              <Button variant="ghost" size="icon" className="h-12 w-12" asChild>
                <a href="mailto:zyadyasser6@gmail.com" aria-label="Send me an email">
                  <Mail className="h-6 w-6" aria-hidden="true" />
                </a>
              </Button>
            </li>
          </motion.ul>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
            aria-label="Scroll indicator"
          >
            <motion.div
              animate={shouldReduceMotion ? {} : { y: [0, 10, 0] }}
              transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
              className="flex flex-col items-center text-muted-foreground"
            >
              <span className="text-sm mb-2">Scroll to explore</span>
              <ArrowDown className="h-5 w-5" aria-hidden="true" />
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
