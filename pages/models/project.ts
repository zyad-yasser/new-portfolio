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