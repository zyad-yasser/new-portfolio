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

export interface Section {
  name: string;
  active: boolean;
}

export interface Tab {
  name: string;
  component: (props: any) => React.JSX.Element | React.JSX.Element[];
}

export interface Testimonial {
  writer: string;
  title: string;
  photo: string;
  body: string;
}

export interface Partner {
  name: string;
  image: string;
}

export interface Service {
  name: string;
  image: string;
}

export interface SocaialMediaAccount {
  name: string;
  icon: string;
  color: string;
  value: string;
}
