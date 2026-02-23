"use client";

import { motion } from "framer-motion";
import { Github, Heart, Linkedin, Mail } from "lucide-react";
import { Button } from "./ui/button";

const socialLinks = [
  {
    icon: Github,
    href: "https://github.com/zyad-yasser",
    label: "GitHub",
  },
  {
    icon: Linkedin,
    href: "https://www.linkedin.com/in/zyad-yasser-developer/",
    label: "LinkedIn",
  },
  {
    icon: Mail,
    href: "mailto:zyadyasser6@gmail.com",
    label: "Email",
  },
];

const quickLinks = [
  { name: "About", href: "#about" },
  { name: "Services", href: "#services" },
  { name: "Projects", href: "#projects" },
  { name: "Contact", href: "#contact" },
];

export function ModernFooter() {
  return (
    <footer className="bg-background border-t border-border" role="contentinfo">
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          {/* Brand section */}
          <div className="md:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Zyad Yasser
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md leading-relaxed">
                Full-stack developer passionate about creating modern, scalable web applications
                that solve real-world problems and deliver exceptional user experiences.
              </p>
              <div className="flex space-x-2" role="list" aria-label="Social media links">
                {socialLinks.map((link, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                    viewport={{ once: true }}
                    role="listitem"
                  >
                    <Button variant="ghost" size="icon" asChild>
                      <a
                        href={link.href}
                        target={link.href.startsWith("mailto:") ? undefined : "_blank"}
                        rel={link.href.startsWith("mailto:") ? undefined : "noopener noreferrer"}
                        aria-label={link.label}
                        className="hover:text-primary transition-colors"
                      >
                        <link.icon className="h-5 w-5" aria-hidden="true" />
                      </a>
                    </Button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Quick Links */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <nav className="space-y-3" aria-label="Footer navigation">
                {quickLinks.map((link, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                    viewport={{ once: true }}
                  >
                    <a
                      href={link.href}
                      className="block text-muted-foreground hover:text-primary transition-colors focus:outline-none focus:text-primary focus:underline"
                    >
                      {link.name}
                    </a>
                  </motion.div>
                ))}
              </nav>
            </motion.div>
          </div>

          {/* Contact Info */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <h4 className="font-semibold mb-4">Get In Touch</h4>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>zyadyasser6@gmail.com</p>
                <p>+201111980284</p>
                <p>Port-Said, Egypt</p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Bottom section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground"
        >
          <p className="mb-4 md:mb-0">
            © {new Date().getFullYear()} Zyad Yasser. All rights reserved.
          </p>
          <p className="flex items-center">
            Made with <Heart className="w-4 h-4 mx-1 text-red-500 fill-current" />
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
