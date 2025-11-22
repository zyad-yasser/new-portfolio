import About from "@/components/about/about.component";
import Contacts from "@/components/contacts/contacts.component";
import Introduction from "@/components/introduction/introduction.component";
import Layout from "@/components/layout/layout.component";
import Projects from "@/components/projects/projects.component";
import Services from "@/components/services/services.component";
import Skills from "@/components/skills/skills.component";
import Testimonials from "@/components/testimonials/testimonials.component";
import UiAdditions from "@/components/ui-additions/ui-additions.component";

export default function HomePage() {
  return (
    <Layout>
      <Introduction />
      <About />
      <Skills />
      <Projects />
      <Testimonials />
      <Services />
      <Contacts />
      <UiAdditions />
    </Layout>
  );
}