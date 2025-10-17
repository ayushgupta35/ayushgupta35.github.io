import React, { useState } from 'react';

const TechnicalSkillsEditor = ({ skills = [], onChange, label = "Technical Skills" }) => {
  const [newSkill, setNewSkill] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingSkill, setEditingSkill] = useState('');

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      const updatedSkills = [...skills, newSkill.trim()];
      onChange(updatedSkills);
      setNewSkill('');
    }
  };

  const deleteSkill = (index) => {
    const updatedSkills = skills.filter((_, i) => i !== index);
    onChange(updatedSkills);
  };

  const startEditing = (index) => {
    setEditingIndex(index);
    setEditingSkill(skills[index]);
  };

  const saveEdit = () => {
    if (editingSkill.trim() && !skills.includes(editingSkill.trim())) {
      const updatedSkills = [...skills];
      updatedSkills[editingIndex] = editingSkill.trim();
      onChange(updatedSkills);
      setEditingIndex(null);
      setEditingSkill('');
    }
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditingSkill('');
  };

  const handleKeyPress = (e, action) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (action === 'add') {
        addSkill();
      } else if (action === 'edit') {
        saveEdit();
      }
    }
  };

  return (
    <div style={{ marginBottom: '1rem' }}>
      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
        {label}
      </label>
      
      {/* Add new skill */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <input
          type="text"
          value={newSkill}
          onChange={(e) => setNewSkill(e.target.value)}
          onKeyPress={(e) => handleKeyPress(e, 'add')}
          placeholder="Add a technical skill..."
          style={{
            flex: 1,
            padding: '0.5rem',
            borderRadius: '4px',
            border: '1px solid #ddd',
            fontSize: '0.9rem'
          }}
        />
        <button
          type="button"
          onClick={addSkill}
          disabled={!newSkill.trim() || skills.includes(newSkill.trim())}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: !newSkill.trim() || skills.includes(newSkill.trim()) ? '#ccc' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: !newSkill.trim() || skills.includes(newSkill.trim()) ? 'not-allowed' : 'pointer',
            fontSize: '0.9rem'
          }}
        >
          Add
        </button>
      </div>

      {/* Skills list */}
      {skills.length > 0 && (
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.5rem',
          padding: '1rem',
          backgroundColor: '#f8f9fa',
          borderRadius: '4px',
          border: '1px solid #e9ecef'
        }}>
          {skills.map((skill, index) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center' }}>
              {editingIndex === index ? (
                <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                  <input
                    type="text"
                    value={editingSkill}
                    onChange={(e) => setEditingSkill(e.target.value)}
                    onKeyPress={(e) => handleKeyPress(e, 'edit')}
                    style={{
                      padding: '0.25rem 0.5rem',
                      borderRadius: '12px',
                      border: '1px solid #007bff',
                      fontSize: '0.85rem',
                      minWidth: '80px'
                    }}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={saveEdit}
                    style={{
                      padding: '0.125rem 0.25rem',
                      backgroundColor: '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: '2px',
                      cursor: 'pointer',
                      fontSize: '0.7rem'
                    }}
                  >
                    ✓
                  </button>
                  <button
                    type="button"
                    onClick={cancelEdit}
                    style={{
                      padding: '0.125rem 0.25rem',
                      backgroundColor: '#6c757d',
                      color: 'white',
                      border: 'none',
                      borderRadius: '2px',
                      cursor: 'pointer',
                      fontSize: '0.7rem'
                    }}
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    padding: '0.375rem 0.75rem',
                    backgroundColor: '#4B2E83',
                    color: 'white',
                    borderRadius: '16px',
                    fontSize: '0.85rem',
                    fontWeight: '500'
                  }}
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => startEditing(index)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'white',
                      cursor: 'pointer',
                      padding: '0',
                      fontSize: '0.75rem',
                      marginLeft: '0.25rem'
                    }}
                    title="Edit skill"
                  >
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteSkill(index)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'white',
                      cursor: 'pointer',
                      padding: '0',
                      fontSize: '0.75rem'
                    }}
                    title="Delete skill"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {skills.length === 0 && (
        <div style={{
          padding: '1rem',
          backgroundColor: '#f8f9fa',
          borderRadius: '4px',
          border: '1px solid #e9ecef',
          color: '#6c757d',
          fontStyle: 'italic',
          textAlign: 'center'
        }}>
          No technical skills added yet
        </div>
      )}
    </div>
  );
};

export default TechnicalSkillsEditor;