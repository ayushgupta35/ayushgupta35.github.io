import React, { useState } from 'react';
import { seedData } from '../firebase/seedData';

const SeedDataPage = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSeedData = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      await seedData();
      setMessage('✅ Data seeded successfully! You can now view your portfolio.');
    } catch (error) {
      console.error('Error seeding data:', error);
      setMessage('❌ Error seeding data. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Portfolio Data Setup</h1>
      <p>Click the button below to populate your Firebase database with portfolio data.</p>
      
      <div style={{ marginTop: '2rem' }}>
        <button 
          onClick={handleSeedData}
          disabled={loading}
          style={{
            padding: '1rem 2rem',
            fontSize: '1rem',
            backgroundColor: '#4B2E83',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? 'Seeding Data...' : 'Seed Portfolio Data'}
        </button>
      </div>
      
      {message && (
        <div style={{ 
          marginTop: '1rem', 
          padding: '1rem', 
          backgroundColor: message.includes('✅') ? '#d4edda' : '#f8d7da',
          border: `1px solid ${message.includes('✅') ? '#c3e6cb' : '#f5c6cb'}`,
          borderRadius: '4px',
          color: message.includes('✅') ? '#155724' : '#721c24'
        }}>
          {message}
        </div>
      )}
      
      <div style={{ marginTop: '2rem' }}>
        <a href="/" style={{ color: '#4B2E83', textDecoration: 'none' }}>
          ← Back to Portfolio
        </a>
      </div>
    </div>
  );
};

export default SeedDataPage;
