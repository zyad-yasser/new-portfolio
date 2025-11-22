import { ModernHero } from "@/components/modern-hero";
import { ModernAbout } from "@/components/modern-about";
import { ModernServices } from "@/components/modern-services";
import { ModernProjects } from "@/components/modern-projects";
import { ModernContact } from "@/components/modern-contact";
import { ModernFooter } from "@/components/modern-footer";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <ModernHero />
      <ModernAbout />
      <ModernServices />
      <ModernProjects />
      <ModernContact />
      <ModernFooter />
    </main>
  );
}
