"use client";

import { getFirebaseStorageUrl } from "@/constants";
import { containerVariantsSlow, itemVariants } from "@/lib/motion";
import { testimonials } from "@/statics";
import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import Image from "next/image";
import { Card, CardContent } from "./ui/card";
import { SectionHeader } from "./ui/section-header";

export function ModernTestimonials() {
  return (
    <div className="py-24 px-5 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-7xl">
        <SectionHeader
          id="testimonials-heading"
          title="Client Testimonials"
          subtitle="What clients and colleagues say about working with me"
          align="center"
        />

        <motion.ul
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={containerVariantsSlow}
          className="grid md:grid-cols-2 gap-8"
          aria-label="Client testimonials"
        >
          {testimonials.map((testimonial, index) => (
            <motion.li key={index} variants={itemVariants}>
              <Card className="glass h-full card-hover">
                <CardContent className="p-8">
                  <div className="flex items-start space-x-1 mb-6" aria-hidden="true">
                    <Quote className="h-8 w-8 text-primary flex-shrink-0" />
                    <Quote className="h-8 w-8 text-primary/30 flex-shrink-0 -ml-4" />
                  </div>

                  <blockquote className="text-lg leading-relaxed text-muted-foreground mb-8">
                    "{testimonial.body}"
                  </blockquote>

                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-full bg-gradient-brand p-[1.5px] shrink-0">
                      <div className="relative h-full w-full rounded-full overflow-hidden bg-card">
                        <Image
                          src={getFirebaseStorageUrl(testimonial.photo)}
                          alt={`${testimonial.writer}, ${testimonial.title}`}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      </div>
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">{testimonial.writer}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.title}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </div>
  );
}
