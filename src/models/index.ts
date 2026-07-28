export interface Project {
  name: string;
  description: string;
  link?: string;
  codeLink?: string;
  image: string;
  technologies: string[];
  colors: [string, string];
  subProjects?: SubProject[];
  discontinued?: boolean;
  private?: boolean;
  note?: string;
}

export interface SubProject {
  name: string;
  link?: string;
  description?: string;
}

export interface Testimonial {
  writer: string;
  title: string;
  photo: string;
  body: string;
}

export interface Experience {
  company: string;
  role: string;
  location: string;
  period: string;
  current?: boolean;
  highlights: string[];
}

export interface OpenSourceContribution {
  name: string;
  description: string;
  link: string;
  type: "npm package" | "GitHub repo" | "OSS contribution";
  technologies?: string[];
}
