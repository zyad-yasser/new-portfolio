import { ModernHero } from "@/components/modern-hero";
import { ModernAbout } from "@/components/modern-about";
import { ModernServices } from "@/components/modern-services";
import { ModernProjects } from "@/components/modern-projects";
import { ModernTestimonials } from "@/components/modern-testimonials";
import { ModernContact } from "@/components/modern-contact";
import { ModernFooter } from "@/components/modern-footer";
import { SkipLinks } from "@/components/skip-links";

export default function HomePage() {
  return (
    <>
      <SkipLinks />
      <main id="main-content" className="min-h-screen">
        <ModernHero />
        <section id="about" aria-labelledby="about-heading">
          <ModernAbout />
        </section>
        <section id="services" aria-labelledby="services-heading">
          <ModernServices />
        </section>
        <section id="projects" aria-labelledby="projects-heading">
          <ModernProjects />
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
