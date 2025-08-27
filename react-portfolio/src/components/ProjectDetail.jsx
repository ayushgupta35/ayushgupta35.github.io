import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectsService } from '../firebase/services';

const ProjectDetail = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      if (!projectId) {
        setError(true);
        return;
      }

      try {
        // First get all projects and find the one with matching id
        const projects = await projectsService.getProjects();
        const foundProject = projects.find(proj => proj.id === projectId);
        
        if (!foundProject) {
          setError(true);
        } else {
          setProject(foundProject);
        }
      } catch (error) {
        console.error('Error loading project data:', error);
        setError(true);
      }
    };

    fetchProject();
  }, [projectId]);

  const handleBackClick = () => {
    navigate(-1); // Go back in browser history
  };

  if (error || !project) {
    return (
      <div>
        <a href="#" onClick={(e) => { e.preventDefault(); handleBackClick(); }} className="back-link">← Back</a>
        <div id="project-content">
          <p>Project not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <a href="#" onClick={(e) => { e.preventDefault(); handleBackClick(); }} className="back-link">← Back</a>
      <div id="project-content">
        <h1 id="project-title">{project.title}</h1>
        <p id="project-technologies">{project.technologies}</p>
        <img id="project-image" src={project.image} alt={project.title} />
        <p id="project-description">{project.description}</p>
        <div id="project-links">
          {project.resourcesLink && (
            <a
              href={project.resourcesLink}
              target="_blank"
              rel="noopener noreferrer"
              className="project-link"
            >
              Project Resources
            </a>
          )}
          {project.presentationLink && (
            <a
              href={project.presentationLink}
              target="_blank"
              rel="noopener noreferrer"
              className="project-link"
            >
              Link
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
