import { ModernAbout } from "@/components/modern-about";
import { ModernContact } from "@/components/modern-contact";
import { ModernExperience } from "@/components/modern-experience";
import { ModernFooter } from "@/components/modern-footer";
import { ModernHero } from "@/components/modern-hero";
import { ModernOpenSource } from "@/components/modern-open-source";
import { ModernProjects } from "@/components/modern-projects";
import { ModernServices } from "@/components/modern-services";
import { ModernTestimonials } from "@/components/modern-testimonials";
import { SkipLinks } from "@/components/skip-links";

export default function HomePage() {
  return (
    <>
      <SkipLinks />
      <main id="main-content" className="min-h-dvh">
        <ModernHero />
        <section id="about" aria-labelledby="about-heading">
          <ModernAbout />
        </section>
        <section id="experience" aria-labelledby="experience-heading">
          <ModernExperience />
        </section>
        <section id="services" aria-labelledby="services-heading">
          <ModernServices />
        </section>
        <section id="projects" aria-labelledby="projects-heading">
          <ModernProjects />
        </section>
        <section id="open-source" aria-labelledby="open-source-heading">
          <ModernOpenSource />
        </section>
        <section id="testimonials" aria-labelledby="testimonials-heading">
          <ModernTestimonials />
        </section>
        <section id="contact" aria-labelledby="contact-heading">
          <ModernContact />
        </section>
      </main>
      <ModernFooter />
    </>
  );
}
