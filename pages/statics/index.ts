import { Section } from "../models/section";
import ProductionProjects from "../../pages/components/production-projects/production-projects.component";
import OtherProjects from "../../pages/components/other-projects/other-projects.component";
import { Tab } from "../models/tab";

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
        name: "gallery",
        active: false
    },
    {
        name: "contacts",
        active: false
    },
];