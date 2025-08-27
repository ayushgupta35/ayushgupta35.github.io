import React, { useEffect, useState } from 'react';
import { experienceService } from '../firebase/services';

const Experience = () => {
  const [experience, setExperience] = useState([]);

  useEffect(() => {
    const fetchExperience = async () => {
      try {
        const experienceData = await experienceService.getExperience();
        console.log('Experience data fetched:', experienceData);
        setExperience(experienceData || []);
      } catch (error) {
        console.error('Error fetching experience:', error);
      }
    };

    fetchExperience();
  }, []);

  return (
    <section className="skills experience" id="experience" style={{ display: 'flex' }}>
      <div className="experience-container">
        {experience.map((job, index) => (
          <div key={index} className="experience-item">
            <h3>{job.title}</h3>
            <p className="company">
              <img id="logo" src={job.companyLogo} alt={`${job.company} Logo`} /> {job.company}
            </p>
            <p>{job.period}</p>
            <ul>
              {Array.isArray(job.description) 
                ? job.description.map((bullet, bulletIndex) => (
                    <li key={bulletIndex}>{bullet}</li>
                  ))
                : typeof job.description === 'string'
                ? job.description.split('. ').map((bullet, bulletIndex) => (
                    <li key={bulletIndex}>{bullet.endsWith('.') ? bullet : bullet + '.'}</li>
                  ))
                : <li>No description available</li>
              }
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Experience;
