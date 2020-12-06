export class Project {
    name: string;
    description: string;
    link?: string;
    image: string;
    technologies: string[];
    colors: [string, string];
    subProjects?: SubProject[];
}

export class SubProject {
    name: string;
    link?: string;
    description?: string;
}

export class Section {
    name: string;
    active: boolean;
}

export class Tab {
    name: string;
    component: (props: any) => JSX.Element| JSX.Element[];
}

export class Testimonial {
    writer: string;
    title: string;
    photo: string;
    body: string;
}

export class Partner {
    name: string;
    image: string;
}

export class Service {
    name: string;
    image: string;
}

export class SocaialMediaAccount {
    name: string;
    icon: string;
    color: string;
    value: string;
}
