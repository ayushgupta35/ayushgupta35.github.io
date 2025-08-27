import React from 'react';
import styled from 'styled-components';
import { useData } from '../contexts/DataContext';
import Skills from '../components/Skills';
import Experience from '../components/Experience';

const AboutContainer = styled.div`
  margin-top: 70px;
  min-height: 100vh;
  background: #f8f9fa;
`;

const AboutHero = styled.section`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-align: center;
  padding: 100px 20px;
`;

const AboutTitle = styled.h1`
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 20px;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const AboutSubtitle = styled.p`
  font-size: 1.2rem;
  max-width: 600px;
  margin: 0 auto;
  opacity: 0.9;
  line-height: 1.6;
`;

const PersonalSection = styled.section`
  padding: 80px 20px;
  width: 100%;
  margin: 0 auto;
  text-align: center;

  @media (max-width: 768px) {
    padding: 60px 15px;
  }
`;

const PersonalTitle = styled.h2`
  color: #2d3748;
  font-size: 2.5rem;
  margin-bottom: 20px;
  font-weight: 700;
`;

const PersonalDescription = styled.div`
  max-width: 800px;
  margin: 0 auto;
  color: #718096;
  font-size: 1.1rem;
  line-height: 1.8;
`;

const BioList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 30px 0;
`;

const BioItem = styled.li`
  margin: 15px 0;
  padding: 15px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-2px);
  }
`;

const About = () => {
  const { portfolioData } = useData();
  
  const personalInfo = portfolioData?.personalInfo || {
    name: "Ayush Gupta",
    title: "CS, Data Science, & Informatics @ UW Seattle",
    description: [
      "🛠️ Systems-minded engineer with a passion for automation, clean architecture, and seamless user experiences.",
      "🌐 Full-stack capable — from backend APIs and data pipelines to polished frontends and intuitive UI/UX.",
      "🤖 Built internal tools and workflows that eliminate friction and make complex tasks feel simple.",
      "🎨 Blend technical depth with product design instincts — I think in flows, not just functions.",
      "🚀 Thrive in fast-paced teams, from early startups to enterprise environments; I ramp fast and ship with purpose."
    ]
  };

  return (
    <AboutContainer>
      <AboutHero>
        <AboutTitle>About {personalInfo.name}</AboutTitle>
        <AboutSubtitle>
          {personalInfo.title}
        </AboutSubtitle>
      </AboutHero>

      <PersonalSection>
        <PersonalTitle>Who I Am</PersonalTitle>
        <PersonalDescription>
          <p>{personalInfo.bio || "I build systems, tools, and interfaces that make life easier, shaped by a background in CS, Data Science, and Informatics. Here's what I bring to the table:"}</p>
          
          {personalInfo.description && (
            <BioList>
              {personalInfo.description.map((item, index) => (
                <BioItem key={index}>{item}</BioItem>
              ))}
            </BioList>
          )}
        </PersonalDescription>
      </PersonalSection>

      <Skills />
      
      <Experience />
    </AboutContainer>
  );
};

export default About;
