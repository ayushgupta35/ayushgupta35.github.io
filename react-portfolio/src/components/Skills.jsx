import React, { useEffect, useState } from 'react';
import { skillsService } from '../firebase/services';

const Skills = () => {
  const [skillsArray, setSkillsArray] = useState([]);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const skillsData = await skillsService.getSkills();
        console.log('Skills data fetched:', skillsData);
        
        // Keep as array format to maintain order
        if (Array.isArray(skillsData)) {
          setSkillsArray(skillsData);
        } else if (typeof skillsData === 'object') {
          // Convert object format to array format (for legacy data)
          const skillsArray = Object.entries(skillsData).map(([category, skills]) => ({
            category,
            skills: Array.isArray(skills) ? skills : []
          }));
          setSkillsArray(skillsArray);
        } else {
          setSkillsArray([]);
        }
      } catch (error) {
        console.error('Error fetching skills:', error);
      }
    };

    fetchSkills();
  }, []);

  return (
    <section className="skills" id="skills" style={{ display: 'flex' }}>
      <div className="skills-container">
        {/* Dynamically render skill categories in the order they appear in the array */}
        {skillsArray.map((skillCategory, index) => (
          <div key={skillCategory.category} className="skill-item">
            <h3>{skillCategory.category}</h3>
            <article className={`${skillCategory.category.toLowerCase().replace(/\s+/g, '-').replace(/&/g, '')}-skills`}>
              {Array.isArray(skillCategory.skills) && skillCategory.skills.map((skill, skillIndex) => (
                <p key={skillIndex}>{skill}</p>
              ))}
            </article>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Skills;
