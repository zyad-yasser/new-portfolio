"use client";

import { containerVariants, itemVariants } from "@/lib/motion";
import { motion } from "framer-motion";
import { Mail, MapPin, Phone, Send } from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { SectionHeader } from "./ui/section-header";
import { Textarea } from "./ui/textarea";

const contactInfo = [
  {
    icon: Phone,
    label: "Phone",
    value: "+201111980284",
    href: "tel:+201111980284",
  },
  {
    icon: Mail,
    label: "Email",
    value: "zyadyasser6@gmail.com",
    href: "mailto:zyadyasser6@gmail.com",
  },
  {
    icon: MapPin,
    label: "Location",
    value: "Cairo, Egypt — Open to Remote",
    href: "#",
  },
];

export function ModernContact() {
  return (
    <div className="py-24 px-5 sm:px-6 lg:px-8 bg-muted/15 border-t border-border/60">
      <div className="container mx-auto max-w-6xl">
        <SectionHeader
          id="contact-heading"
          title="Let's Work Together"
          subtitle="Ready to bring your ideas to life? Get in touch and let's discuss how we can create something amazing together."
          align="center"
        />

        <div className="grid lg:grid-cols-2 gap-16">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={containerVariants}
          >
            <motion.div variants={itemVariants}>
              <Card className="glass-strong p-8">
                <CardHeader className="p-0 mb-8">
                  <CardTitle className="text-2xl font-bold text-card-foreground">
                    Send a Message
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <form className="space-y-6" aria-label="Contact form">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name" className="mb-2 block">
                          Name{" "}
                          <span className="text-destructive" aria-label="required">
                            *
                          </span>
                        </Label>
                        <Input
                          id="name"
                          name="name"
                          type="text"
                          placeholder="Your name"
                          className="h-12"
                          required
                          aria-required="true"
                        />
                      </div>
                      <div>
                        <Label htmlFor="subject" className="mb-2 block">
                          Subject{" "}
                          <span className="text-destructive" aria-label="required">
                            *
                          </span>
                        </Label>
                        <Input
                          id="subject"
                          name="subject"
                          type="text"
                          placeholder="Project subject"
                          className="h-12"
                          required
                          aria-required="true"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="email" className="mb-2 block">
                        Email{" "}
                        <span className="text-destructive" aria-label="required">
                          *
                        </span>
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="your.email@example.com"
                        className="h-12"
                        required
                        aria-required="true"
                        aria-describedby="email-description"
                      />
                      <p id="email-description" className="sr-only">
                        Enter a valid email address
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="message" className="mb-2 block">
                        Message{" "}
                        <span className="text-destructive" aria-label="required">
                          *
                        </span>
                      </Label>
                      <Textarea
                        id="message"
                        name="message"
                        rows={6}
                        placeholder="Tell me about your project..."
                        className="resize-y"
                        required
                        aria-required="true"
                      />
                    </div>
                    <Button size="lg" className="w-full text-lg py-6 btn-glow" type="submit">
                      <Send className="mr-2 h-5 w-5" aria-hidden="true" />
                      Send Message
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={containerVariants}
            className="space-y-8"
          >
            <motion.div variants={itemVariants}>
              <h3 className="text-2xl font-bold mb-6">Get In Touch</h3>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                I'm always interested in new opportunities and exciting projects. Whether you have a
                question or just want to say hello, feel free to reach out!
              </p>
            </motion.div>

            <motion.ul
              variants={itemVariants}
              className="space-y-4"
              aria-label="Contact information"
            >
              {contactInfo.map((info, index) => (
                <li key={index}>
                  <Card className="glass p-6 card-hover">
                    <CardContent className="p-0 flex items-center space-x-4">
                      <div
                        className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20"
                        aria-hidden="true"
                      >
                        <info.icon className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-card-foreground">{info.label}</p>
                        <a
                          href={info.href}
                          className="text-muted-foreground hover:text-primary transition-colors"
                          aria-label={`${info.label}: ${info.value}`}
                        >
                          {info.value}
                        </a>
                      </div>
                    </CardContent>
                  </Card>
                </li>
              ))}
            </motion.ul>

            <motion.div variants={itemVariants} className="pt-8">
              <h4 className="font-semibold mb-4">Current Availability</h4>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-3 h-3 bg-success rounded-full animate-pulse" aria-hidden="true" />
                <output>
                  <Badge variant="outline" className="text-success border-success/30">
                    Available for new projects
                  </Badge>
                </output>
              </div>
              <p className="text-sm text-muted-foreground">
                I'm currently accepting new freelance projects and full-time opportunities.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
