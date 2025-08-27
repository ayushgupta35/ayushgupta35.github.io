import React, { useState } from 'react';

const PortfolioSkillsToggle = ({ activeSection, setActiveSection }) => {
  return (
    <section className="portfolio-skills">
      <div className="btn-bg">
        <button 
          className={`btn-2 ${activeSection === 'portfolio' ? 'active-btn' : ''}`} 
          id="portfolio-btn"
          onClick={() => setActiveSection('portfolio')}
        >
          Projects
        </button>
        <button 
          className={`btn-2 ${activeSection === 'skills' ? 'active-btn' : ''}`} 
          id="skills-btn"
          onClick={() => setActiveSection('skills')}
        >
          Skills
        </button>
        <button 
          className={`btn-2 ${activeSection === 'experience' ? 'active-btn' : ''}`} 
          id="experience-btn"
          onClick={() => setActiveSection('experience')}
        >
          Experience
        </button>
        <button 
          className={`btn-2 ${activeSection === 'certifications' ? 'active-btn' : ''}`} 
          id="certifications-btn"
          onClick={() => setActiveSection('certifications')}
        >
          Courses/Certifications
        </button>
      </div>
    </section>
  );
};

export default PortfolioSkillsToggle;
