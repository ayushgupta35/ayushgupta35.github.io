import React, { useState, useEffect } from 'react';
import { certificationsService } from '../../firebase/services';
import ReorderButtons from './ReorderButtons';

const CertificationsManager = () => {
  const [certifications, setCertifications] = useState([]);
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
    items: []
  };

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchCertifications();
  }, []);

  const fetchCertifications = async () => {
    try {
      const certificationsData = await certificationsService.getCertifications();
      
      // Certifications service now returns array format
      const finalCertifications = Array.isArray(certificationsData) ? certificationsData : [];
      setCertifications(finalCertifications);
    } catch (error) {
      console.error('Error fetching certifications:', error);
      setMessage('❌ Error loading certifications');
    } finally {
      setLoading(false);
    }
  };

  const handleItemsChange = (e) => {
    const itemsArray = e.target.value.split('\n').map(item => item.trim()).filter(item => item);
    setFormData(prev => ({ ...prev, items: itemsArray }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let updatedCertifications;
      
      if (editingCategory !== null) {
        updatedCertifications = [...certifications];
        updatedCertifications[editingCategory] = formData;
      } else {
        updatedCertifications = [...certifications, formData];
      }

      // Store as array format to maintain order
      await certificationsService.updateCertifications(updatedCertifications);
      setMessage('✅ Certifications updated successfully!');
      setFormData(initialFormState);
      setEditingCategory(null);
      setShowForm(false);
      fetchCertifications();
    } catch (error) {
      console.error('Error saving certifications:', error);
      setMessage('❌ Error saving certifications');
    }
  };

  const handleEdit = (index) => {
    const certificationCategory = certifications[index];
    setFormData({
      category: certificationCategory.category || '',
      items: Array.isArray(certificationCategory.items) ? certificationCategory.items : []
    });
    setEditingCategory(index);
    setShowForm(true);
  };

  const handleDelete = async (index) => {
    if (window.confirm('Are you sure you want to delete this certification category?')) {
      try {
        const updatedCertifications = certifications.filter((_, i) => i !== index);
        
        // Store as array format to maintain order
        await certificationsService.updateCertifications(updatedCertifications);
        setMessage('✅ Certification category deleted successfully!');
        fetchCertifications();
      } catch (error) {
        console.error('Error deleting certification category:', error);
        setMessage('❌ Error deleting certification category');
      }
    }
  };

  const handleCancel = () => {
    setFormData(initialFormState);
    setEditingCategory(null);
    setShowForm(false);
  };

  const moveCertificationCategoryUp = async (index) => {
    if (index === 0) return;
    
    try {
      const newCertifications = [...certifications];
      [newCertifications[index], newCertifications[index - 1]] = [newCertifications[index - 1], newCertifications[index]];
      
      // Store as array format to maintain order
      await certificationsService.updateCertifications(newCertifications);
      setCertifications(newCertifications);
      setMessage('✅ Certification category order updated!');
    } catch (error) {
      console.error('Error reordering certification categories:', error);
      setMessage('❌ Error reordering certification categories');
    }
  };

  const moveCertificationCategoryDown = async (index) => {
    if (index === certifications.length - 1) return;
    
    try {
      const newCertifications = [...certifications];
      [newCertifications[index], newCertifications[index + 1]] = [newCertifications[index + 1], newCertifications[index]];
      
      // Store as array format to maintain order
      await certificationsService.updateCertifications(newCertifications);
      setCertifications(newCertifications);
      setMessage('✅ Certification category order updated!');
    } catch (error) {
      console.error('Error reordering certification categories:', error);
      setMessage('❌ Error reordering certification categories');
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
      <h3>{editingCategory !== null ? 'Edit Certification Category' : 'Add New Certification Category'}</h3>
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
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>Items (one per line)</label>
          <textarea
            value={Array.isArray(formData.items) ? formData.items.join('\n') : ''}
            onChange={handleItemsChange}
            rows="6"
            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
            required
          />
          <small style={{ color: '#666', display: 'block', marginTop: '0.5rem' }}>
            Enter each certification or course on a new line
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
        <p>Loading certifications...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Manage Certifications</h2>
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
          Add New Certification Category
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
        {Array.isArray(certifications) && certifications.map((certificationCategory, index) => (
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
                    length={certifications.length}
                    onMoveUp={moveCertificationCategoryUp}
                    onMoveDown={moveCertificationCategoryDown}
                  />
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 0.75rem 0', color: '#4B2E83' }}>{certificationCategory.category}</h4>
                    <ul style={{ margin: '0', paddingLeft: '1.5rem' }}>
                      {Array.isArray(certificationCategory.items) && certificationCategory.items.map((item, itemIndex) => (
                        <li key={itemIndex} style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                          {item}
                        </li>
                      ))}
                    </ul>
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

      {(!Array.isArray(certifications) || certifications.length === 0) && (
        <div style={{ 
          textAlign: 'center', 
          padding: '2rem', 
          color: '#666',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px'
        }}>
          No certification categories found. Add your first certification category to get started!
        </div>
      )}
    </div>
  );
};

export default CertificationsManager;
