import React, { useState, useEffect } from 'react';
import { skillsService } from '../../firebase/services';
import ReorderButtons from './ReorderButtons';

const SkillsManager = () => {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
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
    category: '',
    skills: []
  };

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      const skillsData = await skillsService.getSkills();
      
      // Skills service now returns array format
      const finalSkills = Array.isArray(skillsData) ? skillsData : [];
      setSkills(finalSkills);
    } catch (error) {
      console.error('Error fetching skills:', error);
      setMessage('❌ Error loading skills');
    } finally {
      setLoading(false);
    }
  };

  const handleSkillsChange = (e) => {
    const skillsArray = e.target.value.split(',').map(skill => skill.trim()).filter(skill => skill);
    setFormData(prev => ({ ...prev, skills: skillsArray }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let updatedSkills;
      
      if (editingCategory !== null) {
        updatedSkills = [...skills];
        updatedSkills[editingCategory] = formData;
      } else {
        updatedSkills = [...skills, formData];
      }

      // Store as array format to maintain order
      await skillsService.updateSkills(updatedSkills);
      setMessage('✅ Skills updated successfully!');
      setFormData(initialFormState);
      setEditingCategory(null);
      setShowForm(false);
      fetchSkills();
    } catch (error) {
      console.error('Error saving skills:', error);
      setMessage('❌ Error saving skills');
    }
  };

  const handleEdit = (index) => {
    const skillCategory = skills[index];
    setFormData({
      category: skillCategory.category || '',
      skills: Array.isArray(skillCategory.skills) ? skillCategory.skills : []
    });
    setEditingCategory(index);
    setShowForm(true);
  };

  const handleDelete = async (index) => {
    if (window.confirm('Are you sure you want to delete this skill category?')) {
      try {
        const updatedSkills = skills.filter((_, i) => i !== index);
        
        // Store as array format to maintain order
        await skillsService.updateSkills(updatedSkills);
        setMessage('✅ Skill category deleted successfully!');
        fetchSkills();
      } catch (error) {
        console.error('Error deleting skill category:', error);
        setMessage('❌ Error deleting skill category');
      }
    }
  };

  const handleCancel = () => {
    setFormData(initialFormState);
    setEditingCategory(null);
    setShowForm(false);
  };

  const moveSkillCategoryUp = async (index) => {
    if (index === 0) return;
    
    try {
      const newSkills = [...skills];
      [newSkills[index], newSkills[index - 1]] = [newSkills[index - 1], newSkills[index]];
      
      // Store as array format to maintain order
      await skillsService.updateSkills(newSkills);
      setSkills(newSkills);
      setMessage('✅ Skill category order updated!');
    } catch (error) {
      console.error('Error reordering skill categories:', error);
      setMessage('❌ Error reordering skill categories');
    }
  };

  const moveSkillCategoryDown = async (index) => {
    if (index === skills.length - 1) return;
    
    try {
      const newSkills = [...skills];
      [newSkills[index], newSkills[index + 1]] = [newSkills[index + 1], newSkills[index]];
      
      // Store as array format to maintain order
      await skillsService.updateSkills(newSkills);
      setSkills(newSkills);
      setMessage('✅ Skill category order updated!');
    } catch (error) {
      console.error('Error reordering skill categories:', error);
      setMessage('❌ Error reordering skill categories');
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
      <h3>{editingCategory !== null ? 'Edit Skill Category' : 'Add New Skill Category'}</h3>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>Category Name</label>
          <input
            type="text"
            value={formData.category}
            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
            required
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>Skills (comma-separated)</label>
          <textarea
            value={Array.isArray(formData.skills) ? formData.skills.join(', ') : ''}
            onChange={handleSkillsChange}
            rows="3"
            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
            required
          />
          <small style={{ color: '#666', display: 'block', marginTop: '0.5rem' }}>
            Enter skills separated by commas
          </small>
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
            {editingCategory !== null ? 'Update Category' : 'Add Category'}
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
        <p>Loading skills...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Manage Skills</h2>
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
          Add New Skill Category
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

      {showForm && editingCategory === null && renderForm()}

      <div style={{ display: 'grid', gap: '1rem' }}>
        {Array.isArray(skills) && skills.map((skillCategory, index) => (
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
                    length={skills.length}
                    onMoveUp={moveSkillCategoryUp}
                    onMoveDown={moveSkillCategoryDown}
                  />
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 0.75rem 0', color: '#4B2E83' }}>{skillCategory.category}</h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {Array.isArray(skillCategory.skills) && skillCategory.skills.map((skill, skillIndex) => (
                        <span
                          key={skillIndex}
                          style={{
                            backgroundColor: '#f0f0f0',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '20px',
                            fontSize: '0.9rem',
                            border: '1px solid #ddd'
                          }}
                        >
                          {skill}
                        </span>
                      ))}
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

            {showForm && editingCategory === index && renderForm()}
          </div>
        ))}
      </div>

      {(!Array.isArray(skills) || skills.length === 0) && (
        <div style={{ 
          textAlign: 'center', 
          padding: '2rem', 
          color: '#666',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px'
        }}>
          No skill categories found. Add your first skill category to get started!
        </div>
      )}
    </div>
  );
};

export default SkillsManager;
