import React, { useEffect, useState } from 'react';
import { portfolioService, heroService } from '../firebase/services';

const Hero = () => {
  const [personalInfo, setPersonalInfo] = useState(null);
  const [heroData, setHeroData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch both personal info and hero data
        const [portfolioData, heroInfo] = await Promise.all([
          portfolioService.getPortfolioData(),
          heroService.getHeroData()
        ]);
        
        if (portfolioData?.personalInfo) {
          setPersonalInfo(portfolioData.personalInfo);
        }
        
        setHeroData(heroInfo);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  if (!personalInfo) {
    return null;
  }

  // Use hero data for editable fields, fallback to personal info
  const profileImage = heroData?.profilePicture || personalInfo.image;
  const subHeader = heroData?.subHeader || personalInfo.title;
  const introParagraph = heroData?.introParagraph;
  const bulletPoints = heroData?.bulletPoints;

  return (
    <section className="hero">
      <div className="hero-pic">
        <div className="inner-circle"></div>
        <img
          src={profileImage}
          alt={personalInfo.name}
        />
      </div>
      <div className="hero-info">
        <h1>Hey there! 👋 I'm {personalInfo.name}</h1>
        <h2>
          {subHeader} <img id="logo" src={personalInfo.universityLogo} alt="University Logo" />
        </h2>

        <div className="logo-container">
          <a href={personalInfo.socialLinks.github}>
            <img src="/assets/github_light.png" alt="github logo" />
          </a>
          <a href={personalInfo.socialLinks.linkedin}>
            <img src="/assets/linkedin_light.png" alt="linkedin logo" />
          </a>
          <a href={`mailto:${personalInfo.socialLinks.email}`}>
            <img src="/assets/email_light.png" alt="email logo" />
          </a>
        </div>
        
        {introParagraph && (
          <p style={{ 
            marginTop: '1.5rem', 
            fontSize: '1.1rem', 
            lineHeight: '1.6', 
            color: '#555',
            maxWidth: '700px',
            marginBottom: '1.5rem',
            textAlign: 'left'
          }}>
            {introParagraph}
          </p>
        )}

        {bulletPoints && bulletPoints.length > 0 && (
          <ul style={{
            listStyle: 'none',
            padding: 0,
            margin: '1.5rem 0',
            maxWidth: '700px',
            textAlign: 'left'
          }}>
            {bulletPoints.filter(point => point && point.trim()).map((point, index) => (
              <li key={index} style={{
                margin: '0.8rem 0',
                fontSize: '1rem',
                lineHeight: '1.5',
                color: '#555',
                textAlign: 'left'
              }}>
                {point}
              </li>
            ))}
          </ul>
        )}

      </div>
    </section>
  );
};

export default Hero;