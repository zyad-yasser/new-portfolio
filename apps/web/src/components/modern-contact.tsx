"use client";

import { containerVariants, itemVariants } from "@/lib/motion";
import { zodResolver } from "@hookform/resolvers/zod";
import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@repo/ui/form";
import { Input } from "@repo/ui/input";
import { Textarea } from "@repo/ui/textarea";
import { Turnstile } from "@repo/ui/turnstile";
import { type ContactFormValues, contactFormSchema } from "@repo/utils/schemas/contact";
import { motion } from "framer-motion";
import { Loader2, Mail, MapPin, Phone, Send } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { SectionHeader } from "./ui/section-header";

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
  const [status, setStatus] = useState<"idle" | "success">("idle");
  const [error, setError] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileKey, setTurnstileKey] = useState(0);

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: { name: "", email: "", subject: "", message: "", company: "" },
  });

  async function onSubmit(values: ContactFormValues) {
    setError(null);

    if (!turnstileToken) {
      setError("Please complete the verification.");
      return;
    }

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, turnstileToken }),
      });
      const data: { ok: boolean; error?: string } = await response.json();
      if (!data.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      setStatus("success");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setTurnstileToken(null);
      setTurnstileKey((key) => key + 1);
    }
  }

  function handleSendAnother() {
    form.reset();
    setStatus("idle");
    setError(null);
  }

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
                  <CardTitle className="text-xl sm:text-2xl font-bold text-card-foreground">
                    Send a Message
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {status === "success" ? (
                    <output className="block text-center py-8">
                      <p className="text-lg font-medium text-card-foreground mb-2">
                        Thanks for reaching out!
                      </p>
                      <p className="text-muted-foreground mb-6">
                        I'll get back to you as soon as possible.
                      </p>
                      <Button variant="outline" onClick={handleSendAnother}>
                        Send another message
                      </Button>
                    </output>
                  ) : (
                    <Form {...form}>
                      <form
                        className="space-y-6"
                        aria-label="Contact form"
                        onSubmit={form.handleSubmit(onSubmit)}
                        noValidate
                      >
                        <div
                          className="sr-only"
                          aria-hidden="true"
                          style={{ position: "absolute", left: "-9999px" }}
                        >
                          <label htmlFor="company">Company</label>
                          <input
                            id="company"
                            tabIndex={-1}
                            autoComplete="off"
                            {...form.register("company")}
                          />
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  Name{" "}
                                  <span className="text-destructive" aria-label="required">
                                    *
                                  </span>
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="text"
                                    placeholder="Your name"
                                    className="h-12"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="subject"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  Subject{" "}
                                  <span className="text-destructive" aria-label="required">
                                    *
                                  </span>
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="text"
                                    placeholder="Project subject"
                                    className="h-12"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Email{" "}
                                <span className="text-destructive" aria-label="required">
                                  *
                                </span>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="email"
                                  placeholder="your.email@example.com"
                                  className="h-12"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="message"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Message{" "}
                                <span className="text-destructive" aria-label="required">
                                  *
                                </span>
                              </FormLabel>
                              <FormControl>
                                <Textarea
                                  rows={6}
                                  placeholder="Tell me about your project..."
                                  className="resize-y"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Turnstile
                          key={turnstileKey}
                          siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? ""}
                          onVerify={setTurnstileToken}
                          onExpire={() => setTurnstileToken(null)}
                        />
                        {error && (
                          <p
                            role="alert"
                            className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                          >
                            {error}
                          </p>
                        )}
                        <Button
                          size="lg"
                          className="w-full text-base sm:text-lg py-5 sm:py-6 btn-glow"
                          type="submit"
                          disabled={form.formState.isSubmitting || !turnstileToken}
                        >
                          {form.formState.isSubmitting ? (
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />
                          ) : (
                            <Send className="mr-2 h-5 w-5" aria-hidden="true" />
                          )}
                          {form.formState.isSubmitting ? "Sending..." : "Send Message"}
                        </Button>
                      </form>
                    </Form>
                  )}
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
              <h3 className="text-xl sm:text-2xl font-bold mb-6">Get In Touch</h3>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-8">
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
