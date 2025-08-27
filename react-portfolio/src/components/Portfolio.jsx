import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectsService } from '../firebase/services';

const Portfolio = () => {
  const [projects, setProjects] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const projectsData = await projectsService.getProjects();
        console.log('Projects data fetched:', projectsData);
        if (Array.isArray(projectsData)) {
          setProjects(projectsData);
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };

    fetchProjects();
  }, []);

  const handleProjectClick = (projectId) => {
    navigate(`/project/${projectId}`);
  };

  return (
    <section className="portfolio" id="portfolio">
      {projects.map((project) => (
        <div key={project.id} className="wrapper project-wrapper">
          <img src={project.image} alt={project.id} />
          <h3>
            {project.title}
            <br />
            <button className="btn">
              <span onClick={() => handleProjectClick(project.id)} style={{ cursor: 'pointer' }}>
                Click to see more -&gt;
              </span>
            </button>
          </h3>
        </div>
      ))}
    </section>
  );
};

export default Portfolio;
