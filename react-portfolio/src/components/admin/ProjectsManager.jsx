import React, { useState, useEffect } from 'react';
import { projectsService } from '../../firebase/services';
import ImageUpload from './ImageUpload';
import ReorderButtons from './ReorderButtons';
import HtmlFileUpload from './HtmlFileUpload';

const ProjectsManager = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProject, setEditingProject] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState('');

  // Auto-clear messages after 3 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const initialProjectState = {
    id: '',
    title: '',
    description: '',
    image: '',
    technologies: [],
    resourcesUrl: '',
    projectUrl: '',
    featured: false,
    category: '',
    longDescription: '',
    challenges: '',
    learnings: '',
    isRMarkdown: false,
    htmlFile: ''
  };

  const [formData, setFormData] = useState(initialProjectState);
  const [imagePath, setImagePath] = useState(''); // Track Firebase Storage path for deletion
  const [htmlFilePath, setHtmlFilePath] = useState(''); // Track HTML file path for deletion
  const [copied, setCopied] = useState(false);

  const handleImageChange = (url, path) => {
    setFormData(prev => ({ ...prev, image: url }));
    setImagePath(path);
  };

  const handleHtmlFileChange = (url, path) => {
    setFormData(prev => ({ ...prev, htmlFile: url }));
    setHtmlFilePath(path);
  };

  const exportAllProjects = async () => {
    try {
      let text = `PORTFOLIO PROJECTS EXPORT\n`;
      text += `Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}\n`;
      text += `Total Projects: ${projects.length}\n`;
      text += `${'='.repeat(80)}\n\n`;

      projects.forEach((project, index) => {
        text += `PROJECT ${index + 1}: ${project.title || 'Untitled'}\n`;
        text += `${'-'.repeat(50)}\n`;
        
        if (project.category) {
          text += `Category: ${project.category}\n`;
        }
        
        if (project.featured) {
          text += `Status: Featured Project\n`;
        }
        
        text += `\nDescription:\n${project.description || 'No description available'}\n\n`;
        
        if (project.longDescription) {
          text += `Detailed Description:\n${project.longDescription}\n\n`;
        }
        
        if (project.technologies) {
          if (Array.isArray(project.technologies) && project.technologies.length > 0) {
            text += `Technologies: ${project.technologies.join(', ')}\n`;
          } else if (typeof project.technologies === 'string' && project.technologies.trim()) {
            text += `Technologies: ${project.technologies}\n`;
          }
        }
        
        if (project.challenges) {
          text += `\nChallenges:\n${project.challenges}\n`;
        }
        
        if (project.learnings) {
          text += `\nLearnings:\n${project.learnings}\n`;
        }
        
        text += '\nLinks:\n';
        if (project.projectUrl || project.presentationLink) {
          text += `- Project URL: ${project.projectUrl || project.presentationLink || 'N/A'}\n`;
        }
        if (project.resourcesUrl || project.resourcesLink) {
          text += `- Resources/Code: ${project.resourcesUrl || project.resourcesLink || 'N/A'}\n`;
        }
        if (project.image) {
          text += `- Image: ${project.image}\n`;
        }
        
        text += `\n${'='.repeat(80)}\n\n`;
      });

      text += `END OF EXPORT\nTotal Projects Exported: ${projects.length}\n`;
      
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setMessage('📋 All projects copied to clipboard successfully!');
      
      // Reset copied state after 3 seconds
      setTimeout(() => {
        setCopied(false);
      }, 3000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      setMessage('❌ Failed to copy to clipboard. Please try again.');
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const projectsData = await projectsService.getProjects();
      let projects = projectsData || [];
      
      // If projects don't have order properties, assign them based on current order
      const needsOrderUpdate = projects.some(project => project.order === undefined);
      if (needsOrderUpdate) {
        projects = projects.map((project, index) => ({ ...project, order: index }));
        // Update all projects with order numbers
        await projectsService.updateProjectsOrder(projects);
      }
      
      setProjects(projects);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setMessage('Error fetching projects');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'technologies') {
      setFormData(prev => ({
        ...prev,
        [name]: value.split(',').map(tech => tech.trim())
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Map admin form fields to the expected data structure
      const projectData = {
        ...formData,
        technologies: Array.isArray(formData.technologies) 
          ? formData.technologies.join(', ') 
          : formData.technologies,
        resourcesLink: formData.resourcesUrl || '',
        presentationLink: formData.projectUrl || ''
      };
      
      // Remove the admin-specific field names
      delete projectData.resourcesUrl;
      delete projectData.projectUrl;
      
      if (editingProject) {
        await projectsService.updateProject(editingProject.id, projectData);
        setMessage('✅ Project updated successfully!');
      } else {
        const projectId = formData.id || `project-${Date.now()}`;
        const finalProjectData = { ...projectData, id: projectId };
        await projectsService.addProject(finalProjectData);
        setMessage('✅ Project added successfully!');
      }
      
      // Wait a moment before refreshing to ensure Firebase operation completes
      setTimeout(() => {
        setFormData(initialProjectState);
        setImagePath('');
        setHtmlFilePath('');
        setEditingProject(null);
        setShowForm(false);
        fetchProjects();
      }, 500);
    } catch (error) {
      console.error('Error saving project:', error);
      setMessage('❌ Error saving project');
    }
  };

  const handleEdit = (project) => {
    const editData = {
      id: project.id || '',
      title: project.title || '',
      description: project.description || '',
      image: project.image || '',
      technologies: Array.isArray(project.technologies) 
        ? project.technologies 
        : (typeof project.technologies === 'string' 
           ? project.technologies.split(',').map(tech => tech.trim()) 
           : []),
      resourcesUrl: project.resourcesLink || project.resourcesUrl || '',
      projectUrl: project.presentationLink || project.projectUrl || '',
      featured: project.featured || false,
      category: project.category || '',
      longDescription: project.longDescription || '',
      challenges: project.challenges || '',
      learnings: project.learnings || '',
      isRMarkdown: project.isRMarkdown || false,
      htmlFile: project.htmlFile || ''
    };
    setFormData(editData);
    setEditingProject(project);
    setShowForm(true);
  };

  const handleDelete = async (projectId) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await projectsService.deleteProject(projectId);
        setMessage('✅ Project deleted successfully!');
        fetchProjects();
      } catch (error) {
        console.error('Error deleting project:', error);
        setMessage('❌ Error deleting project');
      }
    }
  };

  const handleCancel = () => {
    setFormData(initialProjectState);
    setImagePath('');
    setHtmlFilePath('');
    setEditingProject(null);
    setShowForm(false);
  };

  const moveProjectUp = async (index) => {
    if (index === 0) return;
    
    try {
      const newProjects = [...projects];
      [newProjects[index], newProjects[index - 1]] = [newProjects[index - 1], newProjects[index]];
      
      // Update the order in Firebase
      await projectsService.updateProjectsOrder(newProjects);
      
      setProjects(newProjects);
      setMessage('✅ Project order updated!');
    } catch (error) {
      console.error('Error reordering projects:', error);
      setMessage('❌ Error reordering projects');
    }
  };

  const moveProjectDown = async (index) => {
    if (index === projects.length - 1) return;
    
    try {
      const newProjects = [...projects];
      [newProjects[index], newProjects[index + 1]] = [newProjects[index + 1], newProjects[index]];
      
      // Update the order in Firebase
      await projectsService.updateProjectsOrder(newProjects);
      
      setProjects(newProjects);
      setMessage('✅ Project order updated!');
    } catch (error) {
      console.error('Error reordering projects:', error);
      setMessage('❌ Error reordering projects');
    }
  };

  if (loading) return <div>Loading projects...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Manage Projects</h2>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            onClick={exportAllProjects}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: copied ? '#28a745' : '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            {copied ? '✅' : '📋'} {copied ? 'Copied!' : 'Export All'}
          </button>
          <button
            onClick={() => setShowForm(true)}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#4B2E83',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Add New Project
          </button>
        </div>
      </div>

      {message && (
        <div style={{
          padding: '1rem',
          marginBottom: '1rem',
          backgroundColor: message.includes('✅') ? '#d4edda' : '#f8d7da',
          border: `1px solid ${message.includes('✅') ? '#c3e6cb' : '#f5c6cb'}`,
          borderRadius: '4px',
          color: message.includes('✅') ? '#155724' : '#721c24'
        }}>
          {message}
        </div>
      )}

      {showForm && !editingProject && (
        <div style={{
          backgroundColor: '#f8f9fa',
          padding: '2rem',
          borderRadius: '8px',
          marginBottom: '2rem'
        }}>
          <h3>Add New Project</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>ID</label>
                <input
                  type="text"
                  name="id"
                  value={formData.id}
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
                  required
                />
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
                required
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <ImageUpload
                currentImage={formData.image}
                onImageChange={handleImageChange}
                folder="projects"
                label="Project Image"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Category</label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
                />
              </div>
            </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Technologies (comma-separated)</label>
                <input
                  type="text"
                  name="technologies"
                  value={Array.isArray(formData.technologies) ? formData.technologies.join(', ') : ''}
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
                />
              </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Project Resources</label>
                <input
                  type="url"
                  name="resourcesUrl"
                  value={formData.resourcesUrl}
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Link</label>
                <input
                  type="url"
                  name="projectUrl"
                  value={formData.projectUrl}
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Long Description</label>
              <textarea
                name="longDescription"
                value={formData.longDescription}
                onChange={handleInputChange}
                rows="4"
                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center' }}>
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleInputChange}
                  style={{ marginRight: '0.5rem' }}
                />
                Featured Project
              </label>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center' }}>
                <input
                  type="checkbox"
                  name="isRMarkdown"
                  checked={formData.isRMarkdown}
                  onChange={handleInputChange}
                  style={{ marginRight: '0.5rem' }}
                />
                R Markdown Project
              </label>
            </div>

            {formData.isRMarkdown && (
              <HtmlFileUpload
                currentFile={formData.htmlFile}
                onFileChange={handleHtmlFileChange}
                label="R Markdown HTML File"
              />
            )}

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                type="submit"
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#4B2E83',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                {editingProject ? 'Update Project' : 'Add Project'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div style={{ display: 'grid', gap: '1rem' }}>
        {projects.map((project, index) => (
          <div key={project.id}>
            <div style={{
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '1rem',
              backgroundColor: 'white'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div style={{ display: 'flex', alignItems: 'start', gap: '1rem' }}>
                  <ReorderButtons
                    index={index}
                    length={projects.length}
                    onMoveUp={moveProjectUp}
                    onMoveDown={moveProjectDown}
                  />
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 0.5rem 0', color: '#4B2E83' }}>{project.title}</h4>
                    <p style={{ margin: '0 0 0.5rem 0', color: '#666' }}>{project.description}</p>
                    <div style={{ marginBottom: '0.5rem' }}>
                      <strong>Technologies:</strong> {Array.isArray(project.technologies) ? project.technologies.join(', ') : (project.technologies || 'N/A')}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      {project.featured && (
                        <span style={{
                          backgroundColor: '#4B2E83',
                          color: 'white',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.8rem'
                        }}>
                          Featured
                        </span>
                      )}
                      {project.isRMarkdown && (
                        <span style={{
                          backgroundColor: 'white',
                          color: '#4B2E83',
                          border: '1px solid #4B2E83',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.8rem'
                        }}>
                          R Markdown
                        </span>
                      )}
                      {project.isRMarkdown && project.htmlFile && (
                        <a 
                          href={project.htmlFile} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{
                            backgroundColor: '#4B2E83',
                            color: 'white',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '4px',
                            fontSize: '0.8rem',
                            textDecoration: 'none'
                          }}
                        >
                          View HTML
                        </a>
                      )}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem' }}>
                  <button
                    onClick={() => handleEdit(project)}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(project.id)}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>

            {showForm && editingProject && editingProject.id === project.id && (
              <div style={{
                backgroundColor: '#f8f9fa',
                padding: '2rem',
                borderRadius: '8px',
                marginTop: '1rem',
                border: '1px solid #dee2e6'
              }}>
                <h3>Edit Project</h3>
                <form onSubmit={handleSubmit}>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Title</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
                      required
                    />
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="3"
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
                      required
                    />
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <ImageUpload
                      currentImage={formData.image}
                      onImageChange={handleImageChange}
                      folder="projects"
                      label="Project Image"
                    />
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Technologies (comma-separated)</label>
                    <input
                      type="text"
                      name="technologies"
                      value={Array.isArray(formData.technologies) ? formData.technologies.join(', ') : ''}
                      onChange={handleInputChange}
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem' }}>Project Resources</label>
                      <input
                        type="url"
                        name="resourcesUrl"
                        value={formData.resourcesUrl}
                        onChange={handleInputChange}
                        style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem' }}>Link</label>
                      <input
                        type="url"
                        name="projectUrl"
                        value={formData.projectUrl}
                        onChange={handleInputChange}
                        style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Long Description</label>
                    <textarea
                      name="longDescription"
                      value={formData.longDescription}
                      onChange={handleInputChange}
                      rows="4"
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
                    />
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center' }}>
                      <input
                        type="checkbox"
                        name="featured"
                        checked={formData.featured}
                        onChange={handleInputChange}
                        style={{ marginRight: '0.5rem' }}
                      />
                      Featured Project
                    </label>
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center' }}>
                      <input
                        type="checkbox"
                        name="isRMarkdown"
                        checked={formData.isRMarkdown}
                        onChange={handleInputChange}
                        style={{ marginRight: '0.5rem' }}
                      />
                      R Markdown Project
                    </label>
                  </div>

                  {formData.isRMarkdown && (
                    <HtmlFileUpload
                      currentFile={formData.htmlFile}
                      onFileChange={handleHtmlFileChange}
                      label="R Markdown HTML File"
                    />
                  )}

                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                      type="submit"
                      style={{
                        padding: '0.75rem 1.5rem',
                        backgroundColor: '#4B2E83',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Update Project
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      style={{
                        padding: '0.75rem 1.5rem',
                        backgroundColor: '#6c757d',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectsManager;
