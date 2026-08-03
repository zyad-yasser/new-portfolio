import { Experience, OpenSourceContribution, Project, Testimonial } from "../models";

const productionProjects: Project[] = [
  {
    name: "Enzo Health",
    description:
      "AI-native platform unifying EHR, intake, scheduling, and QA for home health agencies, including Enzo Scribe — an ambient AI scribe that turns patient visits into OASIS-ready clinical documentation in real time.",
    image: "/projects/enzo-health.png",
    technologies: [
      "typescript",
      "AI",
      "next",
      "react",
      "node",
      "python",
      "fastapi",
      "hono",
      "AWS",
      "terraform",
      "k8s",
      "vitest",
      "playwright",
    ],
    link: "https://www.enzo.health/",
    colors: ["#00272A", "#DCFF9F"],
  },
  {
    name: "Beyond Menu",
    description:
      "Online ordering and POS platform for independent restaurants, serving 30,000+ restaurants and 40,000+ daily orders with a hybrid delivery system and server-driven UI.",
    image: "/projects/beyond-menu.png",
    technologies: ["react", "typescript", "next", "node", "AWS", "c#", "vitest", "playwright"],
    link: "https://get.beyondmenu.com/",
    colors: ["#EB4700", "#FFF"],
  },
  {
    name: "Listo Global",
    description:
      "Global workforce platform for finding, hiring, and paying international talent, including multi-currency contractor payments in 90+ countries.",
    image: "/projects/listo-global.png",
    technologies: ["typescript", "react", "next", "node", "AWS", "vitest", "playwright"],
    link: "https://listoglobal.com/",
    colors: ["#4F46E5", "#FFF"],
  },
  {
    name: "CharacterHub",
    description:
      "Social platform for sharing and creating original characters, built from scratch and scaled to 100,000+ users with feeds, profiles, customization, gamification, and AI-powered story generation.",
    image: "/projects/characterhub.png",
    technologies: ["nuxt", "vue", "AWS", "python", "django"],
    link: "https://characterhub.com/",
    colors: ["#4a288a", "#FFF"],
  },
  {
    name: "Shasha.io platform",
    description:
      "Ads management platform, connected to real time players for click, pay, and advertise.",
    image: "/projects/shasha.png",
    technologies: ["vue", "typescript", "firebase", "node"],
    link: "https://shasha.io/",
    colors: ["#a5189e", "#54aff3"],
  },
  {
    name: "Commaful app",
    description: "Mobile stories social media application.",
    image: "/projects/commaful.jpg",
    technologies: ["vue", "ionic", "capacitor"],
    link: "https://commaful.com/",
    colors: ["#FFF", "#00c4c3"],
  },
  {
    name: "L’art-qui tecte",
    description: "Portfolio application and small E-commerce platform.",
    image: "/projects/lartquitecte.png",
    technologies: ["angular", "node", "firebase"],
    link: "https://lartquitecte.com/",
    colors: ["#FFF", "#FFF"],
  },
  {
    name: "Takeda GmbH projects",
    description:
      "A set of projects done for Takeda production lines to help organizeng drugs production",
    subProjects: [
      {
        name: "Trains board",
        link: "https://takeda.gethuddly.com/huddles/id0300-4020-0101/",
      },
      {
        name: "Management board",
        link: "https://takeda.gethuddly.com/console/",
      },
      {
        name: "Tachosil board",
        link: "https://takeda.gethuddly.com/huddles/id0200-4020-0101/",
      },
      {
        name: "Packmittel board",
        link: "https://takeda.gethuddly.com/huddles/id0100-4020-0101/",
      },
    ],
    image: "/projects/takeda.jpg",
    technologies: ["angular", "typescript", "node", "AWS"],
    colors: ["#ee0000", "#FFF"],
  },
  {
    name: "Voestalpine Welding",
    description:
      "Dashboard application for welding calculator for Voetalpine GmbH, for analytics and managing materials, users, and push notifications.",
    image: "/projects/welding.png",
    technologies: ["react", "typescript", "node", "AWS"],
    link: "https://www.voestalpine.com/welding/",
    colors: ["#0082b4", "#FFF"],
  },
  {
    name: "Money fellows",
    description:
      "Dashboard application for welding calculator for Voetalpine GmbH, for analytics and managing materials, users, and push notifications.",
    image: "/projects/moneyfellows.png",
    technologies: ["ionic", "angular", "sails", "node", "AWS"],
    link: "https://moneyfellows.com/",
    colors: ["#FFF", "#536dfe"],
  },
  {
    name: "Via Customers",
    description:
      "Automated mobile app generator for Shopify stores, with campaign systems supporting marketing automation workflows.",
    image: "/projects/via.png",
    technologies: ["node", "typescript", "react", "graphql", "ionic", "AWS"],
    colors: ["#334155", "#FFF"],
    discontinued: true,
  },
  {
    name: "Clean Tagger app",
    description:
      "Admin portal and management app for mobile application managing users/roles/tasks.",
    image: "/projects/cleantagger.png",
    technologies: ["react", "typescript", "node", "AWS"],
    colors: ["#1f86d7", "#ffb329"],
    discontinued: true,
  },
  {
    name: "Kotobex app",
    description:
      "Backend for mobile application for books operations (buy/sell/exchange) with all possible features (tracking/ notifications/messages/etc.).",
    image: "/projects/kotobex.png",
    technologies: ["node", "firebase"],
    colors: ["#0ad0de", "#FFF"],
    discontinued: true,
  },
  {
    name: "SeQure medical",
    description:
      "A medical platform to gather all the info about vendors (Clinics/ Hospitals/ etc.), apply for their services.",
    image: "/projects/sequre.png",
    technologies: ["node", "typescript", "vue"],
    colors: ["#2e8ecd", "#FFF"],
    discontinued: true,
  },
  {
    name: "Door2 Door",
    description:
      "Mobile/Web platform for food ordering, contain all the latest features about ordering, tracking, and reviewing restaurants.",
    image: "/projects/door2door.png",
    technologies: ["node", "vue"],
    colors: ["#a1d600", "#FFF"],
    discontinued: true,
  },
  {
    name: "Badawar app",
    description:
      "Mobile/Web application for finding school, know their pros/cons receive latest updates and process about them.",
    image: "/projects/badawar.png",
    technologies: ["node", "jquery"],
    colors: ["#fb9652", "#FFF"],
    discontinued: true,
  },
  {
    name: "Findme videos",
    description:
      "A video recruitment platform, its aim is for achieving recruitment with a text free platform, recording real time videos.",
    image: "/projects/findme.png",
    technologies: ["node", "angular"],
    colors: ["#e32b4d", "#57bfca"],
    discontinued: true,
  },
];

const otherProjects: Project[] = [
  {
    name: "RGB-light controller",
    description: "Desktop application to control RGB LED lighting connected via USB.",
    image: "/projects/rgb.png",
    technologies: ["javascript", "arduino", "react", "electron"],
    codeLink: "https://github.com/zyad-yasser/electron-react-iot-led-controller",
    colors: ["#FFF", "#FFF"],
  },
  {
    name: "ZEZOO Corporation",
    description: "My personal old web site and CMS for hadware reviews.",
    image: "/projects/zezooco.jpg",
    technologies: ["php", "jquery"],
    link: "/projects/preview/zezoo-corporation",
    colors: ["#ee0000", "#FFF"],
  },
  {
    name: "Photo corner",
    description: "Instagram clone.",
    image: "/projects/photocorner.jpg",
    technologies: ["node", "vue"],
    codeLink: "https://github.com/zyad-yasser/Photocorner-app",
    colors: ["#a40227", "#CCC"],
    note: "Built with 0 years of experience",
  },
  {
    name: "Blogging JS",
    description: "Blog app.",
    image: "/projects/blogging.jpg",
    technologies: ["node", "angular"],
    codeLink: "https://github.com/zyad-yasser/Blogging-v-1",
    colors: ["#ee0000", "#FFF"],
    note: "Built with 0 years of experience",
  },
  {
    name: "Titan cooling",
    description: "Redesign for the UI of Titan cooling co.",
    image: "/projects/titan.jpg",
    technologies: ["php", "jquery", "html", "css"],
    link: "https://zyadyasser.net/titan",
    codeLink: "https://github.com/zyad-yasser/titan-website",
    colors: ["blue", "#FFF"],
    note: "Built with 0 years of experience",
  },
  {
    name: "ZIO civil",
    description: "UI design/develop for ZIO civil.",
    image: "/projects/ziocivil.jpg",
    technologies: ["php", "jquery", "html", "css"],
    link: "https://zyadyasser.net/ziocivil",
    codeLink: "https://github.com/zyad-yasser/zio-civil-website",
    colors: ["#ee0000", "#FFF"],
    note: "Built with 0 years of experience",
  },
  {
    name: "2D-Games development",
    description: "My tries of building small 2D games and physics engine.",
    image: "/projects/games.png",
    technologies: ["javascript"],
    colors: ["#ee0000", "#FFF"],
    subProjects: [
      {
        name: "Snake game",
        description: "The famous snake game",
        link: "https://zyadyasser.net/snake",
      },
      {
        name: "Jumper fidget spinner",
        description: "Jumping fidget spinner game",
        link: "https://zyadyasser.net/spinner",
      },
      {
        name: "Balls gravity",
        description: "Real gravity physics simulator",
        link: "https://zyadyasser.net/gravity",
      },
      {
        name: "Collision",
        description: "Collision physics simulator",
        link: "https://zyadyasser.net/collision",
      },
      {
        name: "Mouse balls effect",
        description: "Pure balls following the mouse cursor",
        link: "https://zyadyasser.net/sketch",
      },
      {
        name: "Illusion lines and balls",
        link: "https://zyadyasser.net/ines-t",
      },
      {
        name: "Lines",
        link: "https://zyadyasser.net/lines",
      },
      {
        name: "Bubbles",
        link: "https://zyadyasser.net/bubbles",
      },
    ],
  },
  {
    name: "Markets/Office apps development",
    description: "Apps used in markets and civil engineering offices.",
    image: "/projects/can.jpg",
    technologies: ["php", "jquery"],
    colors: ["#CCC", "#ee0000"],
    private: true,
    subProjects: [
      {
        name: "Steel design app",
        description: "Design efficient steel sections.",
      },
      {
        name: "Supermarket",
        description: "Supermarket app.",
      },
    ],
  },
  {
    name: "Wordpress slider",
    description: "slider for wordpress websites.",
    image: "/projects/slider.jpg",
    colors: ["#00ccff", "#999"],
    technologies: ["php", "jquery"],
    link: "/projects/preview/wordpress-slider",
    codeLink: "https://github.com/zyad-yasser/zad-slider",
    note: "Built with 0 years of experience",
  },
  {
    name: "First try responsive",
    description: "Responsive website using pure Javascript and CSS.",
    image: "/projects/responsive.png",
    colors: ["#f64d36", "#CCC"],
    technologies: ["html", "css", "javascript"],
    link: "/projects/preview/first-try-responsive",
    codeLink: "https://github.com/zyad-yasser/project-responsive",
    note: "Built with 0 years of experience",
  },
];

const testimonials: Testimonial[] = [
  {
    writer: "Yasmine Mostafa",
    title: "VAS & Payments Planning Manager at Vodafone Egypt",
    photo: "/testimonials/yasmine.png",
    body: "Zyad is very professional, committed and passionate. Very fast learner and self motivated. Zyad is having great potential to develop himself and always capable of achieving what he aims to",
  },
  {
    writer: "Sydney Liu",
    title: "Co-founder at Commaful",
    photo: "/testimonials/sydney.png",
    body: "Zyad is very professional, always delivers on time, hardworker, and his output quality is impressive.",
  },
  {
    writer: "Zach Newman",
    title: "CEO & Co-founder at Enzo Health",
    photo: "/testimonials/zach.png",
    body: "I'm not sure if Zyad is human or an LLM.",
  },
  {
    writer: "Rodney Cox",
    title: "President at Beyond Menu",
    photo: "/testimonials/rodney.png",
    body: "Wherever I go I want to take you and your team with me.",
  },
];

const experience: Experience[] = [
  {
    company: "Enzo Health",
    role: "Software Engineer III (AI)",
    location: "Remote (US)",
    period: "Oct 2024 — Present",
    current: true,
    highlights: [
      "Contributed to building the platform from early stages through a Series A round exceeding $40M.",
      "Built AI-powered EHR systems, including ambient scribe workflows for real-time medical documentation.",
      "Cut scribe pipeline execution time from ~10 minutes to under 1 minute by redesigning around API-based processing and automation.",
      "Built integrations with external EHR systems and designed data ingestion pipelines for clinical workflows.",
    ],
  },
  {
    company: "Beyond Menu",
    role: "Software Engineer III",
    location: "Remote (US)",
    period: "Oct 2022 — Nov 2024",
    highlights: [
      "Worked on a platform serving 30,000+ restaurants and 40,000+ daily orders.",
      "Led performance optimization achieving Lighthouse scores above 95 and sub-1s first contentful paint.",
      "Built a hybrid delivery system with smart matching, contributing to $1M+ in annual cost reductions.",
      "Migrated delivery workflows from cron-based to event-driven architecture, cutting manual-intervention orders.",
      "Helped build a server-driven UI system that replaced a legacy platform, and supported the QMenu → BeyondMenu merger.",
    ],
  },
  {
    company: "Commaful / CharacterHub",
    role: "Software Engineer",
    location: "Remote (US)",
    period: "Jun 2021 — Feb 2024",
    highlights: [
      "Built CharacterHub from scratch and scaled it to 100,000+ users with ~20,000 daily active users.",
      "Built feed systems focused on efficient rendering, smooth scrolling, and low-latency interactions.",
      "Developed core features: feeds, profiles, customization, and gamification.",
      "Shipped AI-powered features including story generation and interactive character systems.",
    ],
  },
  {
    company: "Via Customers",
    role: "Software Engineer",
    location: "Remote",
    period: "Feb 2022 — Oct 2022",
    highlights: [
      "Built an automated mobile app generator for Shopify stores.",
      "Contributed to campaign systems supporting marketing automation workflows.",
    ],
  },
  {
    company: "Shasha.io",
    role: "Software Engineer (Contract)",
    location: "Remote",
    period: "2022",
    highlights: [
      "Built components of an advertising platform, including player functionality and admin tools.",
    ],
  },
  {
    company: "Moweex",
    role: "Software Engineer (Contract)",
    location: "Remote",
    period: "2021 — 2022",
    highlights: [
      "Developed automation systems for telecom services, including subscription and IPTV workflows.",
      "Built B2B applications for manufacturing and production tracking.",
    ],
  },
  {
    company: "Money Fellows",
    role: "Software Engineer",
    location: "Cairo, Egypt",
    period: "May 2019 — Jun 2019",
    highlights: ["Contributed to mobile application development for a fintech platform."],
  },
  {
    company: "OCS",
    role: "Software Engineer",
    location: "Cairo, Egypt",
    period: "Aug 2018 — May 2019",
    highlights: [
      "Developed applications across education, healthcare, job platforms, and food delivery.",
    ],
  },
];

const openSourceContributions: OpenSourceContribution[] = [
  {
    name: "@zcorpo/react-material-symbols",
    description:
      "Material Symbols icons as React SVG components — no font loading, full tree shaking.",
    link: "https://www.npmjs.com/package/@zcorpo/react-material-symbols",
    type: "npm package",
    technologies: ["react", "typescript", "svg"],
  },
];

export { productionProjects, otherProjects, testimonials, experience, openSourceContributions };
