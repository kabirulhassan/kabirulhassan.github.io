export interface Social {
  github: string;
  linkedin: string;
  email: string;
}

export interface Skills {
  languages: string[];
  webTechnologies: string[];
  frameworks: string[];
  developerTools: string[];
}

export interface Experience {
  id: string;
  role: string;
  company: string;
  location: string;
  period: string;
  technologies: string[];
  highlights: string[];
}

export interface Project {
  id: string;
  name: string;
  period: string;
  technologies: string[];
  description: string;
  highlights: string[];
  link: string | null;
}

export interface Education {
  degree: string;
  institution: string;
  location: string;
  period: string;
  cgpa: string;
}

export interface ResumeData {
  name: string;
  title: string;
  tagline: string;
  social: Social;
  skills: Skills;
  experience: Experience[];
  projects: Project[];
  education: Education;
}

