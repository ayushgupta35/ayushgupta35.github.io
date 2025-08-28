import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye } from 'lucide-react';
import { projectsService } from '../firebase/services';

const Portfolio = () => {
  const [projects, setProjects] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const projectsData = await projectsService.getProjects();
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
        <div key={project.id} className="wrapper project-wrapper" data-project-id={project.id}>
          <img src={project.image} alt={project.id} />
          <h3>
            {project.title}
            <br />
            {/* Technology bubbles */}
            {project.technologies && (
              <div className="project-technologies">
                {project.technologies.split(',').map((tech, index) => (
                  <span key={index} className="tech-bubble">
                    {tech.trim()}
                  </span>
                ))}
              </div>
            )}
            <button 
              className="btn view-project-btn"
              onClick={() => handleProjectClick(project.id)}
            >
              <Eye size={18} />
              View Project
            </button>
          </h3>
        </div>
      ))}
    </section>
  );
};

export default Portfolio;
