import React, { useEffect, useState } from 'react';
import { portfolioService } from '../firebase/services';

const CTA = () => {
  const [personalInfo, setPersonalInfo] = useState(null);

  useEffect(() => {
    const fetchPersonalInfo = async () => {
      try {
        const portfolioData = await portfolioService.getPortfolioData();
        if (portfolioData?.personalInfo) {
          setPersonalInfo(portfolioData.personalInfo);
        }
      } catch (error) {
        console.error('Error fetching personal info:', error);
      }
    };

    fetchPersonalInfo();
  }, []);

  if (!personalInfo) {
    return null;
  }

  return (
    <section className="cta">
      <a href={personalInfo.resumeLink} download>
        <button className="btn download-btn">Download Resume</button>
      </a>
      <a href={`mailto:${personalInfo.socialLinks.email}`}>
        <button className="btn contact-btn" title={personalInfo.socialLinks.email}>
          Contact Me
        </button>
      </a>
    </section>
  );
};

export default CTA;
