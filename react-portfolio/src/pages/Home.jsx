import React, { useState } from 'react';
import Hero from '../components/Hero';
import Blurb from '../components/Blurb';
import CTA from '../components/CTA';
import PortfolioSkillsToggle from '../components/PortfolioSkillsToggle';
import Portfolio from '../components/Portfolio';
import Skills from '../components/Skills';
import Experience from '../components/Experience';
import Certifications from '../components/Certifications';
import Footer from '../components/Footer';

const Home = () => {
  const [activeSection, setActiveSection] = useState('portfolio');

  return (
    <>
      <Hero />
      <Blurb />
      <CTA />
      <PortfolioSkillsToggle activeSection={activeSection} setActiveSection={setActiveSection} />
      
      {/* Render all sections but show/hide with CSS transitions */}
      <div className="sections-container">
        <div className={`section-wrapper ${activeSection === 'portfolio' ? 'active' : 'hidden'}`}>
          <Portfolio />
        </div>
        <div className={`section-wrapper ${activeSection === 'skills' ? 'active' : 'hidden'}`}>
          <Skills />
        </div>
        <div className={`section-wrapper ${activeSection === 'experience' ? 'active' : 'hidden'}`}>
          <Experience />
        </div>
        <div className={`section-wrapper ${activeSection === 'certifications' ? 'active' : 'hidden'}`}>
          <Certifications />
        </div>
      </div>
      
      <Footer />
    </>
  );
};

export default Home;
