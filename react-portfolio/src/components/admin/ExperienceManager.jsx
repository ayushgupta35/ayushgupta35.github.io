import React, { useState, useEffect } from 'react';
import { experienceService } from '../../firebase/services';
import ImageUpload from './ImageUpload';
import ReorderButtons from './ReorderButtons';

const ExperienceManager = () => {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // Auto-clear messages after 3 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const initialFormState = {
    title: '',
    company: '',
    companyLogo: '',
    period: '',
    description: ''
  };

  const [formData, setFormData] = useState(initialFormState);

  const handleImageChange = (url, path) => {
    setFormData(prev => ({ ...prev, companyLogo: url }));
  };

  useEffect(() => {
    fetchExperiences();
  }, []);

  const fetchExperiences = async () => {
    try {
      const experienceData = await experienceService.getExperience();
      setExperiences(Array.isArray(experienceData) ? experienceData : []);
    } catch (error) {
      console.error('Error fetching experiences:', error);
      setMessage('Error fetching experiences');
      setExperiences([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let updatedExperiences;
      
      // Prepare data for compatibility with both admin and main portfolio
      const experienceData = {
        ...formData,
        period: formData.period, // Use period as main field
        duration: formData.period, // Keep duration for backward compatibility
        description: formData.description // Keep description as is for admin
      };
      
      if (editingIndex !== null) {
        updatedExperiences = [...experiences];
        updatedExperiences[editingIndex] = experienceData;
      } else {
        updatedExperiences = [...experiences, experienceData];
      }

      await experienceService.updateExperience(updatedExperiences);
      setMessage('✅ Experience updated successfully!');
      
      // Wait a moment before refreshing to ensure Firebase operation completes
      setTimeout(() => {
        setFormData(initialFormState);
        setEditingIndex(null);
        setShowForm(false);
        fetchExperiences();
      }, 500);
    } catch (error) {
      console.error('Error saving experience:', error);
      setMessage('❌ Error saving experience');
    }
  };

  const handleEdit = (index) => {
    const experience = experiences[index];
    const editData = {
      title: experience.title || '',
      company: experience.company || '',
      companyLogo: experience.companyLogo || '',
      period: experience.period || experience.duration || '',
      description: experience.description && typeof experience.description === 'string' ? experience.description : ''
    };
    setFormData(editData);
    setEditingIndex(index);
    setShowForm(true);
  };

  const handleDelete = async (index) => {
    if (window.confirm('Are you sure you want to delete this experience?')) {
      try {
        const updatedExperiences = experiences.filter((_, i) => i !== index);
        await experienceService.updateExperience(updatedExperiences);
        setMessage('✅ Experience deleted successfully!');
        fetchExperiences();
      } catch (error) {
        console.error('Error deleting experience:', error);
        setMessage('❌ Error deleting experience');
      }
    }
  };

  const handleCancel = () => {
    setFormData(initialFormState);
    setEditingIndex(null);
    setShowForm(false);
  };

  const moveExperienceUp = async (index) => {
    if (index === 0) return;
    
    try {
      const newExperiences = [...experiences];
      [newExperiences[index], newExperiences[index - 1]] = [newExperiences[index - 1], newExperiences[index]];
      
      await experienceService.updateExperience(newExperiences);
      setExperiences(newExperiences);
      setMessage('✅ Experience order updated!');
    } catch (error) {
      console.error('Error reordering experiences:', error);
      setMessage('❌ Error reordering experiences');
    }
  };

  const moveExperienceDown = async (index) => {
    if (index === experiences.length - 1) return;
    
    try {
      const newExperiences = [...experiences];
      [newExperiences[index], newExperiences[index + 1]] = [newExperiences[index + 1], newExperiences[index]];
      
      await experienceService.updateExperience(newExperiences);
      setExperiences(newExperiences);
      setMessage('✅ Experience order updated!');
    } catch (error) {
      console.error('Error reordering experiences:', error);
      setMessage('❌ Error reordering experiences');
    }
  };

  const renderForm = () => (
    <div style={{
      border: '1px solid #ddd',
      borderRadius: '8px',
      padding: '1.5rem',
      marginBottom: '1rem',
      backgroundColor: '#f8f9fa'
    }}>
      <h3>{editingIndex !== null ? 'Edit Experience' : 'Add New Experience'}</h3>
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Job Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
              required
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Company</label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
              required
            />
          </div>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows="3"
            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <ImageUpload
            currentImage={formData.companyLogo}
            onImageChange={handleImageChange}
            folder="companies"
            label="Company Logo"
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Period</label>
            <input
              type="text"
              value={formData.period}
              onChange={(e) => setFormData(prev => ({ ...prev, period: e.target.value }))}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
              required
            />
          </div>
        </div>

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
            {editingIndex !== null ? 'Update Experience' : 'Add Experience'}
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
  );

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <p>Loading experiences...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Manage Experience</h2>
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
          Add New Experience
        </button>
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

      {showForm && editingIndex === null && renderForm()}

      <div style={{ display: 'grid', gap: '1rem' }}>
        {Array.isArray(experiences) && experiences.map((experience, index) => (
          <div key={index}>
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
                    length={experiences.length}
                    onMoveUp={moveExperienceUp}
                    onMoveDown={moveExperienceDown}
                  />
                  <div style={{ flex: 1, display: 'flex', gap: '1rem' }}>
                    {experience.companyLogo && (
                      <img
                        src={experience.companyLogo}
                        alt={`${experience.company} logo`}
                        style={{
                          width: '50px',
                          height: '50px',
                          objectFit: 'contain',
                          borderRadius: '4px'
                        }}
                      />
                    )}
                    <div>
                      <h4 style={{ margin: '0 0 0.25rem 0', color: '#4B2E83' }}>{experience.title}</h4>
                      <p style={{ margin: '0 0 0.5rem 0', fontWeight: '500' }}>{experience.company}</p>
                      <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#666', fontWeight: '500' }}>{experience.period || experience.duration}</p>
                      {experience.description && typeof experience.description === 'string' && (
                        <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.9rem', color: '#555', fontStyle: 'italic' }}>
                          {experience.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem' }}>
                  <button
                    onClick={() => handleEdit(index)}
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
                    onClick={() => handleDelete(index)}
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

            {showForm && editingIndex === index && renderForm()}
          </div>
        ))}
      </div>

      {(!Array.isArray(experiences) || experiences.length === 0) && (
        <div style={{ 
          textAlign: 'center', 
          padding: '2rem', 
          color: '#666',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px'
        }}>
          No experiences found. Add your first experience to get started!
        </div>
      )}
    </div>
  );
};

export default ExperienceManager;
