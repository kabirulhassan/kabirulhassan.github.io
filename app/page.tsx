'use client';

import { useState } from 'react';
import resumeData from '@/data/resume.json';
import { ResumeData } from '@/types/resume';

const data = resumeData as ResumeData;

// Wave Separator Component
const WaveSeparator = ({ flip = false, variant = 1 }: { flip?: boolean; variant?: number }) => {
  const paths = [
    // Variant 1
    [
      'M0,50 C100,80 200,20 350,50 C500,80 600,30 750,55 C900,80 1000,25 1200,50',
      'M0,60 C150,90 300,35 500,65 C700,95 850,40 1200,60',
      'M0,45 C200,70 400,25 600,50 C800,75 1000,30 1200,45',
    ],
    // Variant 2
    [
      'M0,55 C180,25 320,75 500,50 C680,25 820,70 1000,45 C1100,30 1150,55 1200,50',
      'M0,45 C120,70 280,30 450,55 C620,80 780,35 950,55 C1080,70 1150,40 1200,50',
      'M0,50 C200,30 400,65 650,45 C900,25 1050,60 1200,45',
    ],
    // Variant 3
    [
      'M0,45 C150,75 350,30 550,55 C750,80 900,35 1100,50 C1150,55 1180,45 1200,50',
      'M0,55 C200,30 400,70 600,50 C800,30 950,65 1200,55',
      'M0,50 C100,65 250,40 400,55 C550,70 700,35 900,50 C1050,65 1150,45 1200,50',
    ],
  ];

  const selectedPaths = paths[(variant - 1) % paths.length];

  return (
    <div className={`wave-separator ${flip ? 'wave-flip' : ''}`}>
      <svg viewBox="0 0 1200 100" preserveAspectRatio="none">
        <path d={selectedPaths[0]} className="wave-path" />
        <path d={selectedPaths[1]} className="wave-path" style={{ opacity: 0.15 }} />
        <path d={selectedPaths[2]} className="wave-path" style={{ opacity: 0.12 }} />
      </svg>
    </div>
  );
};

// Rings Component
const StarryRings = () => (
  <div className="hero-rings">
    <svg className="ring-svg" viewBox="0 0 420 420">
      <circle className="ring-segment ring-1" cx="210" cy="210" r="200" />
      <circle className="ring-segment ring-2" cx="210" cy="210" r="175" />
      <circle className="ring-segment ring-3" cx="210" cy="210" r="150" />
      <circle className="ring-segment ring-4" cx="210" cy="210" r="125" />
      <circle className="ring-segment ring-5" cx="210" cy="210" r="100" />
      <circle className="ring-segment ring-6" cx="210" cy="210" r="75" />
      <circle className="ring-segment ring-7" cx="210" cy="210" r="50" />
      <circle className="ring-segment ring-8" cx="210" cy="210" r="28" />
    </svg>
  </div>
);

// Background Component
const Background = () => (
  <div className="starry-bg">
    <svg className="bg-swirls" viewBox="0 0 1400 900" preserveAspectRatio="xMidYMid slice">
      <path d="M900,100 Q1050,50 1150,120 Q1250,190 1200,280" className="bg-stroke" />
      <path d="M950,80 Q1080,40 1180,100 Q1280,160 1240,240" className="bg-stroke" style={{ opacity: 0.04 }} />
      <path d="M50,400 Q150,350 200,420 Q250,490 180,550" className="bg-stroke" />
      <path d="M30,420 Q140,360 200,440 Q260,520 180,580" className="bg-stroke" style={{ opacity: 0.03 }} />
      <path d="M600,700 Q750,650 850,720 Q950,790 880,850" className="bg-stroke" />
    </svg>
  </div>
);

// Navigation Component
const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="nav">
      <a href="#" className="nav-logo">KH</a>
      <div className={`nav-links ${isOpen ? 'active' : ''}`}>
        <a href="#about" onClick={() => setIsOpen(false)}>About</a>
        <a href="#experience" onClick={() => setIsOpen(false)}>Experience</a>
        <a href="#projects" onClick={() => setIsOpen(false)}>Projects</a>
        <a href="#skills" onClick={() => setIsOpen(false)}>Skills</a>
        <a href="#contact" onClick={() => setIsOpen(false)}>Contact</a>
      </div>
      <button 
        className={`nav-toggle ${isOpen ? 'active' : ''}`} 
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle navigation"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
    </nav>
  );
};

// Hero Section
const Hero = () => (
  <section id="hero" className="hero">
    <div className="hero-content">
      <StarryRings />
      <div className="hero-text">
        <p className="hero-greeting">Hello, I&apos;m</p>
        <h1 className="hero-name">{data.name}</h1>
        <p className="hero-title">{data.title}</p>
        <p className="hero-tagline">{data.tagline}</p>
        <div className="hero-cta">
          <a href="#contact" className="btn btn-primary">Get in Touch</a>
          <a href="#experience" className="btn btn-secondary">View Work</a>
        </div>
      </div>
    </div>
  </section>
);

// About Section
const About = () => (
  <section id="about" className="section about">
    <div className="container">
      <h2 className="section-title">About</h2>
      <div className="about-content">
        <p>
          I&apos;m a fullstack software engineer with a passion for building scalable web applications. 
          Currently working with Next.js, React, and MongoDB to create solutions that serve thousands of users.
        </p>
        <p>
          I have experience across the entire development lifecycle — from designing robust frameworks 
          and optimizing database queries to crafting intuitive user interfaces.
        </p>
        <div className="education-card">
          <div className="education-details">
            <h3>{data.education.degree}</h3>
            <p>{data.education.institution}, {data.education.location}</p>
            <p className="education-meta">{data.education.period} · CGPA: {data.education.cgpa}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
);

// Experience Section
const Experience = () => (
  <section id="experience" className="section experience">
    <div className="container">
      <h2 className="section-title">Experience</h2>
      <div className="timeline">
        {data.experience.map((exp) => (
          <div key={exp.id} className="timeline-item">
            <div className="timeline-header">
              <h3 className="timeline-role">{exp.role}</h3>
              <p className="timeline-company">{exp.company}</p>
              <p className="timeline-meta">{exp.period} · {exp.location}</p>
            </div>
            <div className="timeline-tech">
              {exp.technologies.map((tech) => (
                <span key={tech} className="tech-tag">{tech}</span>
              ))}
            </div>
            <ul className="timeline-highlights">
              {exp.highlights.map((highlight, i) => (
                <li key={i}>{highlight}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// Projects Section
const Projects = () => (
  <section id="projects" className="section projects">
    <div className="container">
      <h2 className="section-title">Projects</h2>
      <div className="projects-grid">
        {data.projects.map((project) => (
          <article key={project.id} className="project-card">
            <div className="project-header">
              <h3 className="project-name">{project.name}</h3>
              {project.link && (
                <a href={project.link} target="_blank" rel="noopener noreferrer" className="project-link-arrow">
                  →
                </a>
              )}
            </div>
            <p className="project-period">{project.period}</p>
            <p className="project-description">{project.description}</p>
            <div className="project-tech">
              {project.technologies.map((tech) => (
                <span key={tech} className="tech-tag">{tech}</span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  </section>
);

// Skills Section
const Skills = () => {
  const skillCategories = [
    { title: 'Languages', items: data.skills.languages },
    { title: 'Web Technologies', items: data.skills.webTechnologies },
    { title: 'Frameworks', items: data.skills.frameworks },
    { title: 'Developer Tools', items: data.skills.developerTools },
  ];

  return (
    <section id="skills" className="section skills">
      <div className="container">
        <h2 className="section-title">Skills</h2>
        <div className="skills-grid">
          {skillCategories.map((category) => (
            <div key={category.title} className="skill-category">
              <h3>{category.title}</h3>
              <div className="skill-list">
                {category.items.map((item) => (
                  <span key={item} className="skill-item">{item}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Contact Section
const Contact = () => (
  <section id="contact" className="section contact">
    <div className="container">
      <h2 className="section-title">Let&apos;s Connect</h2>
      <p className="contact-intro">
        I&apos;m always open to discussing new opportunities, collaborations, or just having a chat about technology.
      </p>
      <div className="contact-links">
        <a href={`mailto:${data.social.email}`} className="contact-link">
          {data.social.email}
        </a>
        <a href={data.social.linkedin} target="_blank" rel="noopener noreferrer" className="contact-link">
          LinkedIn
        </a>
        <a href={data.social.github} target="_blank" rel="noopener noreferrer" className="contact-link">
          GitHub
        </a>
      </div>
    </div>
  </section>
);

// Footer
const Footer = () => (
  <footer className="footer">
    <p>Designed & Built by Kabirul Hassan</p>
    <p className="footer-note">Inspired by Van Gogh&apos;s Starry Night</p>
  </footer>
);

// Main Page
export default function Home() {
  return (
    <>
      <Background />
      <Navigation />
      <Hero />
      <WaveSeparator variant={1} />
      <About />
      <WaveSeparator flip variant={2} />
      <Experience />
      <WaveSeparator variant={3} />
      <Projects />
      <WaveSeparator flip variant={1} />
      <Skills />
      <WaveSeparator variant={2} />
      <Contact />
      <Footer />
    </>
  );
}

