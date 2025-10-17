import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Star } from 'lucide-react';
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
          <h3>
            {project.featured && (
              <Star 
                size={18} 
                fill="none" 
                color="#666" 
                strokeWidth={2}
                style={{ 
                  marginRight: '0.5rem', 
                  verticalAlign: 0.5,
                  opacity: 0.7
                }}
              />
            )}
            {project.title}
          </h3>
          <img src={project.image} alt={project.id} />
          <div className="project-content">
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
          </div>
        </div>
      ))}
    </section>
  );
};

export default Portfolio;
