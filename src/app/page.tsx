import { ModernHero } from "@/components/modern-hero";
import { ModernAbout } from "@/components/modern-about";
import { ModernServices } from "@/components/modern-services";
import { ModernProjects } from "@/components/modern-projects";
import { ModernTestimonials } from "@/components/modern-testimonials";
import { ModernContact } from "@/components/modern-contact";
import { ModernFooter } from "@/components/modern-footer";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <ModernHero />
      <div id="about">
        <ModernAbout />
      </div>
      <div id="services">
        <ModernServices />
      </div>
      <div id="projects">
        <ModernProjects />
      </div>
      <ModernTestimonials />
      <div id="contact">
        <ModernContact />
      </div>
      <ModernFooter />
    </main>
  );
}
