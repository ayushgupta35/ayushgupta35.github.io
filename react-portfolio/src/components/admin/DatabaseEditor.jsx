import React, { useState, useEffect } from 'react';
import { database } from '../../firebase/config';
import { ref, get, set } from 'firebase/database';

const DatabaseEditor = () => {
  const [jsonData, setJsonData] = useState('');
  const [originalData, setOriginalData] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [isValidJson, setIsValidJson] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);

  // Auto-clear messages after 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  useEffect(() => {
    fetchDatabaseData();
  }, []);

  const fetchDatabaseData = async () => {
    try {
      setLoading(true);
      const snapshot = await get(ref(database));
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        const formattedJson = JSON.stringify(data, null, 2);
        setJsonData(formattedJson);
        setOriginalData(formattedJson);
        setHasChanges(false);
        setMessage('✅ Database loaded successfully!');
      } else {
        setJsonData('{}');
        setOriginalData('{}');
        setMessage('⚠️ Database is empty. You can add data by editing the JSON below.');
      }
    } catch (error) {
      console.error('Error fetching database:', error);
      setMessage('❌ Error loading database. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleJsonChange = (e) => {
    const newValue = e.target.value;
    setJsonData(newValue);
    setHasChanges(newValue !== originalData);
    
    // Validate JSON
    try {
      JSON.parse(newValue);
      setIsValidJson(true);
    } catch (error) {
      setIsValidJson(false);
    }
  };

  const saveToFirebase = async () => {
    if (!isValidJson) {
      setMessage('❌ Cannot save: JSON is invalid. Please fix syntax errors first.');
      return;
    }

    try {
      setSaving(true);
      const parsedData = JSON.parse(jsonData);
      
      // Save to Firebase root
      await set(ref(database), parsedData);
      
      setOriginalData(jsonData);
      setHasChanges(false);
      setMessage('✅ Database updated successfully!');
    } catch (error) {
      console.error('Error saving to Firebase:', error);
      setMessage('❌ Error saving to database. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const resetChanges = () => {
    setJsonData(originalData);
    setHasChanges(false);
    setIsValidJson(true);
    setMessage('🔄 Changes reset to original data.');
  };

  const formatJson = () => {
    try {
      const parsed = JSON.parse(jsonData);
      const formatted = JSON.stringify(parsed, null, 2);
      setJsonData(formatted);
      setMessage('✨ JSON formatted successfully!');
    } catch (error) {
      setMessage('❌ Cannot format: Invalid JSON syntax.');
    }
  };

  const minifyJson = () => {
    try {
      const parsed = JSON.parse(jsonData);
      const minified = JSON.stringify(parsed);
      setJsonData(minified);
      setMessage('📦 JSON minified successfully!');
    } catch (error) {
      setMessage('❌ Cannot minify: Invalid JSON syntax.');
    }
  };

  if (loading) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '3rem',
        color: '#6c757d'
      }}>
        <div style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>🔄</div>
        <p>Loading database...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '1rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ 
          margin: '0 0 0.5rem 0', 
          color: '#495057',
          fontSize: '1.5rem',
          fontWeight: '600'
        }}>
          🗄️ Database JSON Editor
        </h2>
        <p style={{ 
          margin: 0, 
          color: '#6c757d',
          fontSize: '0.95rem'
        }}>
          Edit your entire Firebase database directly as JSON. Be careful - changes affect your live data!
        </p>
      </div>

      {/* Action Buttons */}
      <div style={{ 
        marginBottom: '1rem',
        display: 'flex',
        gap: '1rem',
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        <button
          onClick={saveToFirebase}
          disabled={!isValidJson || !hasChanges || saving}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: !isValidJson || !hasChanges ? '#6c757d' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: !isValidJson || !hasChanges ? 'not-allowed' : 'pointer',
            fontSize: '0.9rem',
            fontWeight: '500',
            opacity: !isValidJson || !hasChanges ? 0.6 : 1,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          {saving ? '⏳' : '💾'} {saving ? 'Saving...' : 'Save to Firebase'}
        </button>
        
        <button
          onClick={resetChanges}
          disabled={!hasChanges}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: hasChanges ? '#dc3545' : '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: hasChanges ? 'pointer' : 'not-allowed',
            fontSize: '0.9rem',
            fontWeight: '500',
            opacity: hasChanges ? 1 : 0.6,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          🔄 Reset Changes
        </button>
        
        <button
          onClick={fetchDatabaseData}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          🔄 Refresh from Firebase
        </button>

        <div style={{
          height: '20px',
          width: '1px',
          backgroundColor: '#dee2e6'
        }}></div>

        <button
          onClick={formatJson}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#17a2b8',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.8rem',
            fontWeight: '500'
          }}
        >
          ✨ Format
        </button>
        
        <button
          onClick={minifyJson}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#ffc107',
            color: '#212529',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.8rem',
            fontWeight: '500'
          }}
        >
          📦 Minify
        </button>
      </div>

      {/* Status Indicators */}
      <div style={{
        marginBottom: '1rem',
        display: 'flex',
        gap: '1rem',
        flexWrap: 'wrap'
      }}>
        <div style={{
          padding: '0.5rem 1rem',
          backgroundColor: isValidJson ? '#d1f2eb' : '#f8d7da',
          color: isValidJson ? '#0c5460' : '#721c24',
          border: `1px solid ${isValidJson ? '#b8e6d3' : '#f5c6cb'}`,
          borderRadius: '4px',
          fontSize: '0.85rem',
          fontWeight: '500'
        }}>
          {isValidJson ? '✅ Valid JSON' : '❌ Invalid JSON'}
        </div>
        
        <div style={{
          padding: '0.5rem 1rem',
          backgroundColor: hasChanges ? '#fff3cd' : '#d1ecf1',
          color: hasChanges ? '#856404' : '#0c5460',
          border: `1px solid ${hasChanges ? '#ffeaa7' : '#b8daff'}`,
          borderRadius: '4px',
          fontSize: '0.85rem',
          fontWeight: '500'
        }}>
          {hasChanges ? '⚠️ Unsaved Changes' : '✅ No Changes'}
        </div>

        <div style={{
          padding: '0.5rem 1rem',
          backgroundColor: '#f8f9fa',
          color: '#495057',
          border: '1px solid #dee2e6',
          borderRadius: '4px',
          fontSize: '0.85rem'
        }}>
          📊 {jsonData.split('\n').length} lines
        </div>
      </div>

      {/* Message Display */}
      {message && (
        <div style={{
          padding: '0.75rem 1rem',
          marginBottom: '1rem',
          backgroundColor: message.includes('❌') ? '#f8d7da' : 
                           message.includes('⚠️') ? '#fff3cd' : '#d1edff',
          color: message.includes('❌') ? '#721c24' : 
                 message.includes('⚠️') ? '#856404' : '#0c5460',
          border: `1px solid ${message.includes('❌') ? '#f5c6cb' : 
                                message.includes('⚠️') ? '#ffeaa7' : '#b8daff'}`,
          borderRadius: '6px',
          fontSize: '0.9rem'
        }}>
          {message}
        </div>
      )}

      {/* JSON Editor */}
      <div style={{
        border: `2px solid ${isValidJson ? '#28a745' : '#dc3545'}`,
        borderRadius: '8px',
        overflow: 'hidden'
      }}>
        <div style={{
          backgroundColor: isValidJson ? '#f8f9fa' : '#f8d7da',
          padding: '0.75rem 1rem',
          borderBottom: `1px solid ${isValidJson ? '#dee2e6' : '#f5c6cb'}`,
          fontSize: '0.9rem',
          color: '#495057',
          fontWeight: '500',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>📝 Firebase Database JSON</span>
          <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>
            Ctrl+A to select all, Ctrl+F to search
          </span>
        </div>
        
        <textarea
          value={jsonData}
          onChange={handleJsonChange}
          style={{
            width: '100%',
            height: '600px',
            padding: '1rem',
            border: 'none',
            resize: 'vertical',
            fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
            fontSize: '0.9rem',
            lineHeight: '1.4',
            backgroundColor: isValidJson ? '#fafafa' : '#fef5f5',
            color: '#333',
            outline: 'none',
            tabSize: 2
          }}
          placeholder="Loading database..."
          spellCheck={false}
        />
      </div>

      {/* Warning */}
      <div style={{
        marginTop: '1rem',
        padding: '1rem',
        backgroundColor: '#fff3cd',
        borderLeft: '4px solid #ffc107',
        borderRadius: '0 6px 6px 0',
        fontSize: '0.9rem',
        color: '#856404'
      }}>
        <strong>⚠️ Warning:</strong> This editor provides direct access to your Firebase database. 
        Changes are permanent and affect your live application. Always backup important data before making major changes.
        <br />
        <strong>Tips:</strong>
        <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }}>
          <li>Use "Format" to make JSON readable</li>
          <li>Check for valid JSON before saving (green border = valid)</li>
          <li>Use "Reset Changes" if you make a mistake</li>
          <li>Refresh from Firebase to get the latest data</li>
        </ul>
      </div>
    </div>
  );
};

export default DatabaseEditor;