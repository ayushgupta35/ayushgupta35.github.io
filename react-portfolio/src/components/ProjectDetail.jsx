import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Github, ExternalLink, Figma, Chrome } from 'lucide-react';
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
    // Navigate to home page
    navigate('/');
    
    // Scroll to the specific project after a short delay to ensure the page loads
    setTimeout(() => {
      const projectElement = document.querySelector(`[data-project-id="${projectId}"]`);
      if (projectElement) {
        projectElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      } else {
        // Fallback: scroll to portfolio section
        const portfolioSection = document.getElementById('portfolio');
        if (portfolioSection) {
          portfolioSection.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
        }
      }
    }, 100);
  };

  const isGitHubLink = (url) => {
    return url && url.toLowerCase().includes('github');
  };

  const isFigmaLink = (url) => {
    return url && url.toLowerCase().includes('figma');
  };

  const isChromeStoreLink = (url) => {
    return url && (url.toLowerCase().includes('chrome.google.com/webstore') || 
                   url.toLowerCase().includes('chromewebstore.google.com'));
  };

  const renderLinkButton = (url, label) => {
    const isGitHub = isGitHubLink(url);
    const isFigma = isFigmaLink(url);
    const isChromeStore = isChromeStoreLink(url);
    
    let linkClass = 'project-link';
    let icon = <ExternalLink size={18} />;
    
    if (isGitHub) {
      linkClass += ' github-link';
      icon = <Github size={18} />;
    } else if (isFigma) {
      linkClass += ' figma-link';
      icon = <Figma size={18} />;
    } else if (isChromeStore) {
      linkClass += ' chrome-store-link';
      icon = <Chrome size={18} />;
    } else {
      linkClass += ' external-link';
    }
    
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={linkClass}
      >
        {icon}
        {label}
      </a>
    );
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
          {project.resourcesLink && renderLinkButton(
            project.resourcesLink, 
            isGitHubLink(project.resourcesLink) ? 'View on GitHub' : 
            isFigmaLink(project.resourcesLink) ? 'View on Figma' : 
            isChromeStoreLink(project.resourcesLink) ? 'View in Chrome Store' :
            'Project Resources'
          )}
          {project.presentationLink && renderLinkButton(
            project.presentationLink,
            isGitHubLink(project.presentationLink) ? 'View on GitHub' :
            isFigmaLink(project.presentationLink) ? 'View on Figma' :
            isChromeStoreLink(project.presentationLink) ? 'View in Chrome Store' :
            'View Project'
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
