'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useMotionTemplate, animate } from 'motion/react';
import resumeData from '@/data/resume.json';
import { ResumeData } from '@/types/resume';
import { useSpring } from './hooks/useSpring';
import { useReveal } from './hooks/useReveal';
import { usePointerParallax } from './hooks/usePointerParallax';
import { useScrollY } from './hooks/useScrollY';
import { project, rubberbandClamp } from './hooks/motion-utils';

const data = resumeData as ResumeData;

// Wraps a section in a scroll-triggered reveal spring (fade + rise).
// Springs from the current on-screen value, so scrolling past quickly
// never causes a jump — it just keeps easing toward visible.
const Reveal = ({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) => {
  const { ref, visible } = useReveal<HTMLDivElement>();
  const progress = useSpring(visible ? 1 : 0, { damping: 1, response: 0.6 });

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: progress,
        transform: `translateY(${(1 - progress) * 24}px)`,
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
};

// Magnetic tilt card — tracks the pointer 1:1 while hovered (direct
// manipulation), springs back to flat on pointer-leave. Skipped on touch
// since there's no hover state to track.
const TiltCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const springX = useSpring(tilt.x, { damping: 1, response: 0.35 });
  const springY = useSpring(tilt.y, { damping: 1, response: 0.35 });

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse') return;
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: px * 6, y: py * -6 });
  };

  const handlePointerLeave = () => setTilt({ x: 0, y: 0 });

  return (
    <div
      ref={cardRef}
      className={className}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={{
        transform: `perspective(800px) rotateX(${springY}deg) rotateY(${springX}deg) translateZ(0)`,
        transformStyle: 'preserve-3d',
      }}
    >
      {children}
    </div>
  );
};

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

  // A slow scroll-linked skew, so the seams between sections read as
  // continuously responsive rather than a static decoration.
  const scrollY = useScrollY();
  const skew = useSpring(Math.sin(scrollY / 400 + variant) * 2, { damping: 1, response: 1 });

  return (
    <div
      className="wave-separator"
      style={{ transform: `scaleY(${flip ? -1 : 1}) skewY(${skew}deg)` }}
    >
      <svg viewBox="0 0 1200 100" preserveAspectRatio="none">
        <path d={selectedPaths[0]} className="wave-path" />
        <path d={selectedPaths[1]} className="wave-path" style={{ opacity: 0.15 }} />
        <path d={selectedPaths[2]} className="wave-path" style={{ opacity: 0.12 }} />
      </svg>
    </div>
  );
};

const RING_RADII = [200, 175, 150, 125, 100, 75, 50, 28];
// Tapping the cluster cycles through 3 levels: each tap grows every ring
// outward, but never by the same amount — growth falls off quadratically
// toward the center, so the innermost rings barely move while the outer
// ones spread apart with increasingly larger gaps between them, and
// nothing ever shrinks below its resting radius. A third tap returns to
// rest. Free to spill past the ring container's box since nothing else
// needs to sit in front of it.
const RING_SPREAD_LEVELS = 3;
const RING_SPREAD_MAX_STEP = 90;
const RING_GROWTH_FACTOR = RING_RADII.map((_, i) => {
  const outwardness = (RING_RADII.length - 1 - i) / (RING_RADII.length - 1); // 1 = outermost, 0 = innermost
  return 0.05 + 0.95 * outwardness * outwardness;
});

// Rings Component — offsets toward the cursor with per-ring depth, so
// deeper (smaller) rings track more than outer ones, reading as parallax.
// Also grabbable (drag to spin, release to coast under momentum) and
// tappable (cycles the ring cluster through 3 grown-out levels then back
// to rest — a click-driven equivalent of the drag momentum spring).
const StarryRings = () => {
  const pointer = usePointerParallax();
  const springX = useSpring(pointer.x, { damping: 1, response: 0.5 });
  const springY = useSpring(pointer.y, { damping: 1, response: 0.5 });

  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  const [spreadLevel, setSpreadLevel] = useState(0);
  const level = useSpring(spreadLevel, { damping: 0.75, response: 0.55 });

  const rotate = useMotionValue(0);
  const dragAngle = useRef(0);
  const pointerDown = useRef({ x: 0, y: 0, moved: false });
  const coast = useRef<ReturnType<typeof animate> | null>(null);

  const angleAt = (e: React.PointerEvent, rect: DOMRect) => {
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    return (Math.atan2(e.clientY - cy, e.clientX - cx) * 180) / Math.PI;
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    coast.current?.stop();
    pointerDown.current = { x: e.clientX, y: e.clientY, moved: false };
    dragAngle.current = angleAt(e, e.currentTarget.getBoundingClientRect());
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (Math.hypot(e.clientX - pointerDown.current.x, e.clientY - pointerDown.current.y) > 6) {
      pointerDown.current.moved = true;
    }
    if (reducedMotion || e.buttons === 0) return;
    const angle = angleAt(e, e.currentTarget.getBoundingClientRect());
    rotate.set(rotate.get() + (angle - dragAngle.current));
    dragAngle.current = angle;
  };

  const handlePointerUp = () => {
    if (!pointerDown.current.moved) setSpreadLevel((v) => (v + 1) % RING_SPREAD_LEVELS);
    if (reducedMotion) return;
    const velocity = rotate.getVelocity();
    coast.current = animate(rotate, rotate.get() + project(velocity), {
      type: 'inertia',
      velocity,
      power: 0.6,
      timeConstant: 350,
      restDelta: 0.05,
    });
  };

  useEffect(() => () => coast.current?.stop(), []);

  return (
    <motion.div
      className={`hero-rings ${reducedMotion ? '' : 'hero-rings-draggable'}`}
      style={{ rotate }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <svg className="ring-svg" viewBox="0 0 420 420">
        {RING_RADII.map((r0, i) => {
          const depth = (i + 1) * 1.4; // inner rings move more
          const r = r0 + level * RING_SPREAD_MAX_STEP * RING_GROWTH_FACTOR[i];
          return (
            <g key={r0} style={{ transform: `translate(${springX * depth}px, ${springY * depth}px)` }}>
              <circle className={`ring-segment ring-${i + 1}`} cx="210" cy="210" r={r} />
            </g>
          );
        })}
      </svg>
    </motion.div>
  );
};

// Background Component — very slow parallax on the swirls, opposite
// direction to the rings, so the whole canvas reads as having depth.
const Background = () => {
  const pointer = usePointerParallax();
  const springX = useSpring(pointer.x, { damping: 1, response: 0.8 });
  const springY = useSpring(pointer.y, { damping: 1, response: 0.8 });

  return (
    <div className="starry-bg">
      <svg
        className="bg-swirls"
        viewBox="0 0 1400 900"
        preserveAspectRatio="xMidYMid slice"
        style={{ transform: `translate(${springX * -12}px, ${springY * -12}px)` }}
      >
        <path d="M900,100 Q1050,50 1150,120 Q1250,190 1200,280" className="bg-stroke" />
        <path d="M950,80 Q1080,40 1180,100 Q1280,160 1240,240" className="bg-stroke" style={{ opacity: 0.04 }} />
        <path d="M50,400 Q150,350 200,420 Q250,490 180,550" className="bg-stroke" />
        <path d="M30,420 Q140,360 200,440 Q260,520 180,580" className="bg-stroke" style={{ opacity: 0.03 }} />
        <path d="M600,700 Q750,650 850,720 Q950,790 880,850" className="bg-stroke" />
      </svg>
    </div>
  );
};

// Navigation Component — bar gains a stronger material as you scroll
// past the hero, and the mobile drawer tracks a swipe-to-close drag 1:1,
// rubber-banding past its bounds, then hands off the release velocity to
// the settling spring so a fast flick closes it before you're 30% across.
const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const scrollY = useScrollY();
  const dragStartX = useRef(0);
  const isDragging = useRef(false);
  const drawerOffset = useMotionValue(100); // 0 = open on-screen, 100 = off-screen right
  const drawerX = useMotionTemplate`${drawerOffset}%`;

  const settle = (target: number, velocity?: number) => {
    animate(drawerOffset, target, { type: 'spring', visualDuration: 0.3, bounce: 0.15, velocity });
  };

  const toggle = () => {
    const next = !isOpen;
    setIsOpen(next);
    settle(next ? 0 : 100);
  };

  const closeDrawer = () => {
    setIsOpen(false);
    settle(100);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isOpen) return;
    e.preventDefault();
    isDragging.current = true;
    dragStartX.current = e.clientX;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current) return;
    const deltaPercent = ((e.clientX - dragStartX.current) / window.innerWidth) * 100;
    drawerOffset.set(rubberbandClamp(deltaPercent, 100));
  };

  const handlePointerUp = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const velocity = drawerOffset.getVelocity(); // %/s, positive = moving toward closed
    const projected = drawerOffset.get() + project(velocity);
    const shouldClose = projected > 50;
    setIsOpen(!shouldClose);
    settle(shouldClose ? 100 : 0, velocity);
  };

  return (
    <nav className={`nav ${scrollY > 20 ? 'nav-scrolled' : ''}`}>
      <a href="#" className="nav-logo">KH</a>
      <motion.div
        className={`nav-links ${isOpen ? 'active' : ''}`}
        style={{ '--drawer-x': drawerX } as React.CSSProperties}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <a href="#about" onClick={closeDrawer}>About</a>
        <a href="#experience" onClick={closeDrawer}>Experience</a>
        <a href="#projects" onClick={closeDrawer}>Projects</a>
        <a href="#skills" onClick={closeDrawer}>Skills</a>
        <a href="#contact" onClick={closeDrawer}>Contact</a>
      </motion.div>
      <button
        className={`nav-toggle ${isOpen ? 'active' : ''}`}
        onClick={toggle}
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
      <Reveal className="about-content">
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
      </Reveal>
    </div>
  </section>
);

// Experience Section
const Experience = () => (
  <section id="experience" className="section experience">
    <div className="container">
      <h2 className="section-title">Experience</h2>
      <div className="timeline">
        {data.experience.map((exp, idx) => (
          <Reveal key={exp.id} className="timeline-item" delay={idx * 80}>
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
          </Reveal>
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
        {data.projects.map((project, idx) => (
          <Reveal key={project.id} className="project-reveal" delay={idx * 80}>
            <TiltCard className="project-card">
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
            </TiltCard>
          </Reveal>
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
          {skillCategories.map((category, idx) => (
            <Reveal key={category.title} className="skill-category" delay={idx * 60}>
              <h3>{category.title}</h3>
              <div className="skill-list">
                {category.items.map((item) => (
                  <span key={item} className="skill-item">{item}</span>
                ))}
              </div>
            </Reveal>
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
      <Reveal>
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
      </Reveal>
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

