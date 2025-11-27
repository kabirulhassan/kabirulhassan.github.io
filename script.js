/**
 * Starry Night Portfolio - Dynamic Resume Loader
 * Loads data from resume.json and renders it to the page
 */

// Mobile Navigation Toggle
const initMobileNav = () => {
  const toggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  
  toggle?.addEventListener('click', () => {
    toggle.classList.toggle('active');
    navLinks.classList.toggle('active');
  });

  // Close nav when clicking a link
  navLinks?.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      toggle.classList.remove('active');
      navLinks.classList.remove('active');
    });
  });
};

// Render Experience Timeline
const renderExperience = (experiences) => {
  const timeline = document.getElementById('experience-timeline');
  if (!timeline || !experiences) return;

  timeline.innerHTML = experiences.map(exp => `
    <div class="timeline-item">
      <div class="timeline-header">
        <h3 class="timeline-role">${exp.role}</h3>
        <p class="timeline-company">${exp.company}</p>
        <p class="timeline-meta">${exp.period} • ${exp.location}</p>
      </div>
      <div class="timeline-tech">
        ${exp.technologies.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
      </div>
      <ul class="timeline-highlights">
        ${exp.highlights.map(h => `<li>${h}</li>`).join('')}
      </ul>
    </div>
  `).join('');
};

// Render Projects Grid
const renderProjects = (projects) => {
  const grid = document.getElementById('projects-grid');
  if (!grid || !projects) return;

  grid.innerHTML = projects.map(project => `
    <article class="project-card">
      <div class="project-header">
        <h3 class="project-name">${project.name}</h3>
        ${project.link ? `
          <a href="${project.link}" target="_blank" rel="noopener noreferrer" class="project-link-arrow">→</a>
        ` : ''}
      </div>
      <p class="project-period">${project.period}</p>
      <p class="project-description">${project.description}</p>
      <div class="project-tech">
        ${project.technologies.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
      </div>
    </article>
  `).join('');
};

// Render Skills Grid
const renderSkills = (skills) => {
  const grid = document.getElementById('skills-grid');
  if (!grid || !skills) return;

  const skillCategories = [
    { key: 'languages', title: 'Languages', items: skills.languages },
    { key: 'webTechnologies', title: 'Web Technologies', items: skills.webTechnologies },
    { key: 'frameworks', title: 'Frameworks', items: skills.frameworks },
    { key: 'developerTools', title: 'Developer Tools', items: skills.developerTools }
  ];

  grid.innerHTML = skillCategories.map(cat => `
    <div class="skill-category">
      <h3>${cat.title}</h3>
      <div class="skill-list">
        ${cat.items.map(item => `<span class="skill-item">${item}</span>`).join('')}
      </div>
    </div>
  `).join('');
};

// Render Contact Links
const renderContact = (social) => {
  const container = document.getElementById('contact-links');
  if (!container || !social) return;

  const links = [
    { label: 'Email', href: `mailto:${social.email}`, text: social.email },
    { label: 'LinkedIn', href: social.linkedin, text: 'LinkedIn' },
    { label: 'GitHub', href: social.github, text: 'GitHub' }
  ];

  container.innerHTML = links.map(link => `
    <a href="${link.href}" target="_blank" rel="noopener noreferrer" class="contact-link">
      ${link.text}
    </a>
  `).join('');
};

// Render Education
const renderEducation = (education) => {
  if (!education) return;

  const degree = document.getElementById('education-degree');
  const institution = document.getElementById('education-institution');
  const period = document.getElementById('education-period');

  if (degree) degree.textContent = education.degree;
  if (institution) institution.textContent = `${education.institution}, ${education.location}`;
  if (period) period.textContent = `${education.period} • CGPA: ${education.cgpa}`;
};

// Update Hero Section
const updateHero = (data) => {
  const name = document.querySelector('.hero-name');
  const title = document.querySelector('.hero-title');
  const tagline = document.querySelector('.hero-tagline');

  if (name) name.textContent = data.name;
  if (title) title.textContent = data.title;
  if (tagline) tagline.textContent = data.tagline;
};

// Load and Render Resume Data
const loadResume = async () => {
  try {
    const response = await fetch('./resume.json');
    if (!response.ok) throw new Error('Failed to load resume data');
    
    const data = await response.json();
    
    // Render all sections
    updateHero(data);
    renderEducation(data.education);
    renderExperience(data.experience);
    renderProjects(data.projects);
    renderSkills(data.skills);
    renderContact(data.social);
    
  } catch (error) {
    console.error('Error loading resume:', error);
  }
};

// Smooth reveal animation on scroll
const initScrollReveal = () => {
  const sections = document.querySelectorAll('.section');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.1 });

  sections.forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(30px)';
    section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(section);
  });
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  loadResume();
  initScrollReveal();
});
