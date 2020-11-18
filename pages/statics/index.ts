import { Partner, Project, Section, Tab, Testimonial } from './../models';
import ProductionProjects from "../../pages/components/production-projects/production-projects.component";
import OtherProjects from "../../pages/components/other-projects/other-projects.component";

export const projectsTabs: Tab[] = [
    {
        name: "Production",
        component: ProductionProjects
    },
    {
        name: "Other",
        component: OtherProjects
    },
];

export const sections: Section[] = [
    {
        name: "home",
        active: true
    },
    {
        name: "about",
        active: false
    },
    {
        name: "skills",
        active: false
    },
    {
        name: "projects",
        active: false
    },
    {
        name: "testmonials",
        active: false
    },
    {
        name: "services",
        active: false
    },
    {
        name: "contacts",
        active: false
    },
];

export const productionProjects: Project[] = [
    {
        name: 'Shasha.io platform',
        description: 'Ads management platform, connected to real time players for click, pay, and advertise.',
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
        link: 'https://apps.apple.com/us/app/commaful-short-stories-poems/id1244982783',
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
        description: 'Admin portal and management app for mobile application managing users/roles/tasks.',
        image: '/projects/cleantagger.png',
        technologies: ['react', 'typescript', 'node', 'AWS'],
        link: 'https://cleantagger.com/',
        colors: ['#1f86d7', '#ffb329'],
    },
    {
        name: 'Takeda GmbH projects',
        description: 'A set of projects done for Takeda production lines to help organizeng drugs production',
        subProjects: [
            {
                name: 'Trains board',
                link: 'https://takeda.gethuddly.com/huddles/id0300-4020-0101/'
            },
            {
                name: 'Base board',
                link: ''
            },
            {
                name: 'Management board',
                link: 'https://takeda.gethuddly.com/console/'
            },
            {
                name: 'Tachosil board',
                link: 'https://takeda.gethuddly.com/huddles/id0200-4020-0101/'
            },
            {
                name: 'Packmittel board',
                link: 'https://takeda.gethuddly.com/huddles/id0100-4020-0101/'
            }
        ],
        image: '/projects/takeda.jpg',
        technologies: ['angular', 'typescript', 'node', 'AWS'],
        colors: ['#ee0000', '#FFF'],
    },
    {
        name: 'Voestalpine Welding',
        description: 'Dashboard application for welding calculator for Voetalpine GmbH, for analytics and managing materials, users, and push notifications.',
        image: '/projects/welding.png',
        technologies: ['react', 'typescript', 'node', 'AWS'],
        link: 'https://www.voestalpine.com/welding/',
        colors: ['#0082b4', '#FFF'],
    },
    {
        name: 'Money fellows',
        description: 'Dashboard application for welding calculator for Voetalpine GmbH, for analytics and managing materials, users, and push notifications.',
        image: '/projects/moneyfellows.png',
        technologies: ['ionic', 'angular', 'sails', 'node', 'AWS'],
        link: 'https://play.google.com/store/apps/details?id=com.moneyfellows.mobileapp&hl=en_US',
        colors: ['#FFF', '#536dfe'],
    },
    {
        name: 'Kotobex app',
        description: 'Backend for mobile application for books operations (buy/sell/exchange) with all possible features (tracking/ notifications/messages/etc.).',
        image: '/projects/kotobex.png',
        technologies: ['node', 'firebase'],
        link: '',
        colors: ['#0ad0de', '#FFF'],
    },
    {
        name: 'SeQure medical',
        description: 'A medical platform to gather all the info about vendors (Clinics/ Hospitals/ etc.), apply for their services.',
        image: '/projects/sequre.png',
        technologies: ['node', 'typescript', 'vue'],
        link: 'https://sequre.overcoffees.com/',
        colors: ['#2e8ecd', '#FFF'],
    },
    {
        name: 'Door2 Door',
        description: 'Mobile/Web platform for food ordering, contain all the latest features about ordering, tracking, and reviewing restaurants.',
        image: '/projects/door2door.png',
        technologies: ['node', 'vue'],
        link: 'https://doortodoor.overcoffees.com/',
        colors: ['#a1d600', '#FFF'],
    },
    {
        name: 'Badawar app',
        description: 'Mobile/Web application for finding school, know their pros/cons receive latest updates and process about them.',
        image: '/projects/badawar.png',
        technologies: ['node', 'jquery'],
        link: 'https://doortodoor.overcoffees.com/',
        colors: ['#fb9652', '#FFF'],
    },
    {
        name: 'Findme videos',
        description: 'A video recruitment platform, its aim is for achieving recruitment with a text free platform, recording real time videos.',
        image: '/projects/findme.png',
        technologies: ['node', 'angular'],
        link: 'https://xuuum.overcoffees.com/',
        colors: ['#e32b4d', '#57bfca'],
    },
]

export const otherProjects: Project[] = [
    {
        name: 'RGB-light controller',
        description: 'Desktop application to control RGB LED lighting connected via USB.',
        image: '/projects/rgb.png',
        technologies: ['javascript', 'arduino', 'react', 'electron'],
        link: 'https://zyadyasser.com/zezooco',
        colors: ['#FFF', '#FFF'],
    },
    {
        name: 'ZEZOO Corporation',
        description: 'My personal old web site and CMS for hadware reviews.',
        image: '/projects/zezooco.jpg',
        technologies: ['php', 'jquery'],
        link: 'https://zyadyasser.com/zezooco',
        colors: ['#ee0000', '#FFF'],
    },
    {
        name: 'Photo corner',
        description: 'Instagram clone.',
        image: '/projects/photocorner.jpg',
        technologies: ['node', 'vue'],
        link: 'https://zyadyasser.com/photo-corner',
        colors: ['#a40227', '#CCC'],
    },
    {
        name: 'Blogging JS',
        description: 'Blog app.',
        image: '/projects/blogging.jpg',
        technologies: ['node', 'angular'],
        link: 'https://zyadyasser.com/blogging',
        colors: ['#ee0000', '#FFF'],
    },
    {
        name: 'Titan cooling',
        description: 'Redesign for the UI of Titan cooling co.',
        image: '/projects/titan.jpg',
        technologies: ['php', 'jquery', 'html', 'css'],
        link: 'https://zyadyasser.com/titan',
        colors: ['blue', '#FFF'],
    },
    {
        name: 'ZIO civil',
        description: 'UI design/develop for ZIO civil.',
        image: '/projects/ziocivil.jpg',
        technologies: ['php', 'jquery', 'html', 'css'],
        link: 'https://zyadyasser.com/ziocivil',
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
                link: 'https://zyadyasser.com/snake'
            },
            {
                name: 'Jumper fidget spinner',
                description: 'Jumping fidget spinner game',
                link: 'https://zyadyasser.com/spinner'
            },
            {
                name: 'Balls gravity',
                description: 'Real gravity physics simulator',
                link: 'https://zyadyasser.com/gravity'
            },
            {
                name: 'Collision',
                description: 'Collision physics simulator',
                link: 'https://zyadyasser.com/collision'
            },
            {
                name: 'Mouse balls effect',
                description: 'Pure balls following the mouse cursor',
                link: 'https://zyadyasser.com/sketch'
            },
            {
                name: 'Illusion lines and balls',
                link: 'https://zyadyasser.com/ines-t'
            },
            {
                name: 'Lines',
                link: 'https://zyadyasser.com/lines'
            },
            {
                name: 'Bubbles',
                link: 'https://zyadyasser.com/bubbles'
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
                link: 'https://zyadyasser.com/steel-designer'
            },
            {
                name: 'Supermarket',
                description: 'Supermarket app.',
                link: 'https://zyadyasser.com/super-market'
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
]

export const testimonials: Testimonial[] = [
    {
        writer: 'Yasmine Mostafa',
        title: 'VAS & Payments Planning Manager at Vodafone Egypt',
        photo: '/testimonials/yasmine.png',
        body: 'Zyad is very professional, committed and passionate. Very fast learner and self motivated. Zyad is having great potential to develop himself and always capable of achieving what he aims to',
    },
    {
        writer: 'Sydney Liu',
        title: 'Co-founder at Commaful',
        photo: '/testimonials/sydney.png',
        body: 'Zyad is very professional, always delivers on time, hardworker, and his output quality is impressive.',
    },
]

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
]