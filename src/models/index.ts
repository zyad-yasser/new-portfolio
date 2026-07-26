export interface Project {
  name: string;
  description: string;
  link?: string;
  image: string;
  technologies: string[];
  colors: [string, string];
  subProjects?: SubProject[];
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
