import {
  Partner,
  Project,
  Section,
  Service,
  SocaialMediaAccount,
  Tab,
  Testimonial,
} from '../models';
import ProductionProjects from '../components/production-projects/production-projects.component';
import OtherProjects from '../components/other-projects/other-projects.component';

export const projectsTabs: Tab[] = [
  {
    name: 'Production',
    component: ProductionProjects,
  },
  {
    name: 'Other',
    component: OtherProjects,
  },
];

export const sections: Section[] = [
  {
    name: 'home',
    active: true,
  },
  {
    name: 'about',
    active: false,
  },
  {
    name: 'skills',
    active: false,
  },
  {
    name: 'projects',
    active: false,
  },
  {
    name: 'testimonials',
    active: false,
  },
  {
    name: 'services',
    active: false,
  },
  {
    name: 'contacts',
    active: false,
  },
];

export const productionProjects: Project[] = [
  {
    name: 'Shasha.io platform',
    description:
      'Ads management platform, connected to real time players for click, pay, and advertise.',
    image: '/projects/shasha.png',
    technologies: ['vue', 'typescript', 'firebase', 'node'],
    link: 'https://shasha.io/',
    colors: ['#a5189e', '#54aff3'],
  },
  {
    name: 'Commaful app',
    description: 'Mobile stories social media application.',
    image: '/projects/commaful.jpg',
    technologies: ['vue', 'ionic', 'capacitor'],
    link:
      'https://apps.apple.com/us/app/commaful-short-stories-poems/id1244982783',
    colors: ['#FFF', '#00c4c3'],
  },
  {
    name: 'L’art-qui tecte',
    description: 'Portfolio application and small E-commerce platform.',
    image: '/projects/lartquitecte.png',
    technologies: ['angular', 'node', 'firebase'],
    link: 'https://lartquitecte.com/',
    colors: ['#FFF', '#FFF'],
  },
  {
    name: 'Clean Tagger app',
    description:
      'Admin portal and management app for mobile application managing users/roles/tasks.',
    image: '/projects/cleantagger.png',
    technologies: ['react', 'typescript', 'node', 'AWS'],
    link: 'https://cleantagger.com/',
    colors: ['#1f86d7', '#ffb329'],
  },
  {
    name: 'Takeda GmbH projects',
    description:
      'A set of projects done for Takeda production lines to help organizeng drugs production',
    subProjects: [
      {
        name: 'Trains board',
        link: 'https://takeda.gethuddly.com/huddles/id0300-4020-0101/',
      },
      {
        name: 'Base board',
        link: '',
      },
      {
        name: 'Management board',
        link: 'https://takeda.gethuddly.com/console/',
      },
      {
        name: 'Tachosil board',
        link: 'https://takeda.gethuddly.com/huddles/id0200-4020-0101/',
      },
      {
        name: 'Packmittel board',
        link: 'https://takeda.gethuddly.com/huddles/id0100-4020-0101/',
      },
    ],
    image: '/projects/takeda.jpg',
    technologies: ['angular', 'typescript', 'node', 'AWS'],
    colors: ['#ee0000', '#FFF'],
  },
  {
    name: 'Voestalpine Welding',
    description:
      'Dashboard application for welding calculator for Voetalpine GmbH, for analytics and managing materials, users, and push notifications.',
    image: '/projects/welding.png',
    technologies: ['react', 'typescript', 'node', 'AWS'],
    link: 'https://www.voestalpine.com/welding/',
    colors: ['#0082b4', '#FFF'],
  },
  {
    name: 'Money fellows',
    description:
      'Dashboard application for welding calculator for Voetalpine GmbH, for analytics and managing materials, users, and push notifications.',
    image: '/projects/moneyfellows.png',
    technologies: ['ionic', 'angular', 'sails', 'node', 'AWS'],
    link:
      'https://play.google.com/store/apps/details?id=com.moneyfellows.mobileapp&hl=en_US',
    colors: ['#FFF', '#536dfe'],
  },
  {
    name: 'Kotobex app',
    description:
      'Backend for mobile application for books operations (buy/sell/exchange) with all possible features (tracking/ notifications/messages/etc.).',
    image: '/projects/kotobex.png',
    technologies: ['node', 'firebase'],
    link: '',
    colors: ['#0ad0de', '#FFF'],
  },
  {
    name: 'SeQure medical',
    description:
      'A medical platform to gather all the info about vendors (Clinics/ Hospitals/ etc.), apply for their services.',
    image: '/projects/sequre.png',
    technologies: ['node', 'typescript', 'vue'],
    link: 'https://sequre.overcoffees.com/',
    colors: ['#2e8ecd', '#FFF'],
  },
  {
    name: 'Door2 Door',
    description:
      'Mobile/Web platform for food ordering, contain all the latest features about ordering, tracking, and reviewing restaurants.',
    image: '/projects/door2door.png',
    technologies: ['node', 'vue'],
    link: 'https://doortodoor.overcoffees.com/',
    colors: ['#a1d600', '#FFF'],
  },
  {
    name: 'Badawar app',
    description:
      'Mobile/Web application for finding school, know their pros/cons receive latest updates and process about them.',
    image: '/projects/badawar.png',
    technologies: ['node', 'jquery'],
    link: 'https://doortodoor.overcoffees.com/',
    colors: ['#fb9652', '#FFF'],
  },
  {
    name: 'Findme videos',
    description:
      'A video recruitment platform, its aim is for achieving recruitment with a text free platform, recording real time videos.',
    image: '/projects/findme.png',
    technologies: ['node', 'angular'],
    link: 'https://xuuum.overcoffees.com/',
    colors: ['#e32b4d', '#57bfca'],
  },
];

export const otherProjects: Project[] = [
  {
    name: 'RGB-light controller',
    description:
      'Desktop application to control RGB LED lighting connected via USB.',
    image: '/projects/rgb.png',
    technologies: ['javascript', 'arduino', 'react', 'electron'],
    link: 'https://zyadyasser.net/zezooco',
    colors: ['#FFF', '#FFF'],
  },
  {
    name: 'ZEZOO Corporation',
    description: 'My personal old web site and CMS for hadware reviews.',
    image: '/projects/zezooco.jpg',
    technologies: ['php', 'jquery'],
    link: 'https://zyadyasser.net/zezooco',
    colors: ['#ee0000', '#FFF'],
  },
  {
    name: 'Photo corner',
    description: 'Instagram clone.',
    image: '/projects/photocorner.jpg',
    technologies: ['node', 'vue'],
    link: 'https://zyadyasser.net/photo-corner',
    colors: ['#a40227', '#CCC'],
  },
  {
    name: 'Blogging JS',
    description: 'Blog app.',
    image: '/projects/blogging.jpg',
    technologies: ['node', 'angular'],
    link: 'https://zyadyasser.net/blogging',
    colors: ['#ee0000', '#FFF'],
  },
  {
    name: 'Titan cooling',
    description: 'Redesign for the UI of Titan cooling co.',
    image: '/projects/titan.jpg',
    technologies: ['php', 'jquery', 'html', 'css'],
    link: 'https://zyadyasser.net/titan',
    colors: ['blue', '#FFF'],
  },
  {
    name: 'ZIO civil',
    description: 'UI design/develop for ZIO civil.',
    image: '/projects/ziocivil.jpg',
    technologies: ['php', 'jquery', 'html', 'css'],
    link: 'https://zyadyasser.net/ziocivil',
    colors: ['#ee0000', '#FFF'],
  },
  {
    name: '2D-Games development',
    description: 'My tries of building small 2D games and physics engine.',
    image: '/projects/games.png',
    technologies: ['javascript'],
    colors: ['#ee0000', '#FFF'],
    subProjects: [
      {
        name: 'Snake game',
        description: 'The famous snake game',
        link: 'https://zyadyasser.net/snake',
      },
      {
        name: 'Jumper fidget spinner',
        description: 'Jumping fidget spinner game',
        link: 'https://zyadyasser.net/spinner',
      },
      {
        name: 'Balls gravity',
        description: 'Real gravity physics simulator',
        link: 'https://zyadyasser.net/gravity',
      },
      {
        name: 'Collision',
        description: 'Collision physics simulator',
        link: 'https://zyadyasser.net/collision',
      },
      {
        name: 'Mouse balls effect',
        description: 'Pure balls following the mouse cursor',
        link: 'https://zyadyasser.net/sketch',
      },
      {
        name: 'Illusion lines and balls',
        link: 'https://zyadyasser.net/ines-t',
      },
      {
        name: 'Lines',
        link: 'https://zyadyasser.net/lines',
      },
      {
        name: 'Bubbles',
        link: 'https://zyadyasser.net/bubbles',
      },
    ],
  },
  {
    name: 'Markets/Office apps development',
    description: 'Apps used in markets and civil engineering offices.',
    image: '/projects/can.jpg',
    technologies: ['php', 'jquery'],
    colors: ['#CCC', '#ee0000'],
    subProjects: [
      {
        name: 'Steel design app',
        description: 'Design efficient steel sections.',
        link: 'https://zyadyasser.net/steel-designer',
      },
      {
        name: 'Supermarket',
        description: 'Supermarket app.',
        link: 'https://zyadyasser.net/super-market',
      },
    ],
  },
  {
    name: 'Wordpress slider',
    description: 'slider for wordpress websites.',
    image: '/projects/slider.jpg',
    colors: ['#00ccff', '#999'],
    technologies: ['php', 'jquery'],
  },
  {
    name: 'First try responsive',
    description: 'Responsive website using pure Javascript and CSS.',
    image: '/projects/responsive.png',
    colors: ['#f64d36', '#CCC'],
    technologies: ['html', 'css', 'javascript'],
  },
];

export const testimonials: Testimonial[] = [
  {
    writer: 'Yasmine Mostafa',
    title: 'VAS & Payments Planning Manager at Vodafone Egypt',
    photo: '/testimonials/yasmine.png',
    body:
      'Zyad is very professional, committed and passionate. Very fast learner and self motivated. Zyad is having great potential to develop himself and always capable of achieving what he aims to',
  },
  {
    writer: 'Sydney Liu',
    title: 'Co-founder at Commaful',
    photo: '/testimonials/sydney.png',
    body:
      'Zyad is very professional, always delivers on time, hardworker, and his output quality is impressive.',
  },
];

export const partners: Partner[] = [
  {
    image: '/partners/ocs.png',
    name: 'Over coffee solutions',
  },
  {
    image: '/partners/commaful.png',
    name: 'Commaful',
  },
  {
    image: '/partners/moneyfellows.png',
    name: 'Money Fellows',
  },
  {
    image: '/partners/lartquitecte.png',
    name: 'Lartquitecte',
  },
  {
    image: '/partners/shasha.png',
    name: 'Shasha.io',
  },
  {
    image: '/partners/moweex.png',
    name: 'Moweex GmbH',
  },
];

export const services: Service[] = [
  {
    image: '/services/backend.png',
    name: 'Backend development',
  },
  {
    image: '/services/frontend.png',
    name: 'Frontend development',
  },
  {
    image: '/services/ui.png',
    name: 'UI design & development',
  },
  {
    image: '/services/devops.png',
    name: 'Development operations',
  },
  {
    image: '/services/mobile.png',
    name: 'Mobile app development',
  },
];

export const socialMediaAccounts: SocaialMediaAccount[] = [
  {
    name: 'facebook',
    color: '#1877f2',
    icon: 'lni-facebook-filled',
    value: 'https://www.facebook.com/zyad.yasser.hussein',
  },
  {
    name: 'twitter',
    color: '#1da1f2',
    icon: 'lni-twitter-original',
    value: 'https://twitter.com/zezoozyad',
  },
  {
    name: 'linkedin',
    color: '#007bb5',
    icon: 'lni-linkedin-original',
    value: 'https://www.linkedin.com/in/zyad-yasser-developer/',
  },
  {
    name: 'github',
    color: '#000',
    icon: 'lni-github-original',
    value: 'https://github.com/zyad-yasser/',
  },
  {
    name: 'behance',
    color: '#0057ff',
    icon: 'lni-behance-original',
    value: 'https://www.behance.net/zyadyasserc1a7',
  },
  {
    name: 'pinterest',
    color: '#bd081c',
    icon: 'lni-pinterest',
    value: 'https://www.pinterest.ru/yasserhessin',
  },
];

export const skills = [
  {
    icon: "/static/logos/mean.png",
    title: "MEAN stack development",
    text: "All about full stack development using Angular / Node.js",
    caption:
      "Starting from backend development using the amazing Node.js runtime, to frontend development using Angular (latest) the most powerful beloved framework, and finally we neverforget about database design and queries using MongoDB.",
    image: "/static/logos/mean-expanded.png"
  },
  {
    icon: "/static/logos/mern.png",
    title: "MERN stack development",
    text: "Full stack development using React.js / Node.js",
    caption:
      "I find amazing enjoyable work when I write full stack apps using React and when it combined with Next.js and Node.js, it becomes super stack.",
    image: "/static/logos/mern-expanded.png"
  },
  {
    icon: "/static/logos/frontend.png",
    title: "Frontend development",
    text: "It's like art to me when I work using Vue / Svelte",
    caption:
      "Making and building applications using amazing frontend frameworks available, also building libraries, components, and building blocks which can be combined to acheive your dreams in your app.",
    image: "/static/logos/frontend-expanded.png"
  },
  {
    icon: "/static/logos/cross-platform.png",
    title: "Cross platform development",
    text: "Developing mobile applications using cross platform technologies",
    caption:
      "Building mobile applications functionality and interfaces one of the most enjoyable jobs to do, Ionic, Native Script, Flutter, each one of them has it's special impact on the application.",
    image: "/static/logos/cross-platform-expanded.png"
  },
  {
    icon: "/static/logos/devops.png",
    title: "DevOps",
    text: "Moving your app from the state of development, to the production",
    caption:
      "Your app is the most important thing to pay attention to when it comes to production, with the experience in AWS, Firebase, heroku, Nginx, Apache, Linux, we can deliver your application to production with the most stable state with all your needs.",
    image: "/static/logos/devops-expanded.png"
  },
  {
    icon: "/static/logos/ui.png",
    title: "UI design / development",
    text: "Designing, and developing impressive UIs",
    caption:
      "Building UIs is the so important key parameter of successfull application, as when it comes to easy, amd attactive design, this makes the user keen to use the app, HTML5, CSS3, Bootstrap, JavaScript solid experience to deliver the desired UIS.",
    image: "/static/logos/ui-expanded.png"
  },
  {
    icon: "/static/logos/gfx.png",
    title: "Graphic design",
    text: "All about graphics and media design",
    caption:
      "As this was my first hobby to have, I love using designing apps, Photoshop, Illustrator, XD, Abstract, Sketch, I love when the wireframes become interactive dynamic user experience.",
    image: "/static/logos/gfx-expanded.png"
  },
  {
    icon: "/static/logos/iot.png",
    title: "IOT / Desktop applications development",
    text: "Building robotics, desktop applications, and smart houses",
    caption:
      "The field of building robotics and control it throw apps is robust, I use Node.js to control several boards to build robotics and control smart houses, also I use Electron.js to build desktop applications.",
    image: "/static/logos/iot-expanded.png"
  }
];
