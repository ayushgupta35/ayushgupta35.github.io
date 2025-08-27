import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ErrorBoundary from '../components/ErrorBoundary';
import ProjectsManager from '../components/admin/ProjectsManager';
import SkillsManager from '../components/admin/SkillsManager';
import ExperienceManager from '../components/admin/ExperienceManager';
import CertificationsManager from '../components/admin/CertificationsManager';
import HeroManager from '../components/admin/HeroManager';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('hero');
  const { logout, currentUser } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const tabs = [
    { id: 'hero', label: 'Hero Section', icon: '👤' },
    { id: 'projects', label: 'Projects', icon: '🚀' },
    { id: 'skills', label: 'Skills', icon: '💡' },
    { id: 'experience', label: 'Experience', icon: '💼' },
    { id: 'certifications', label: 'Certifications', icon: '🎓' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'hero':
        return (
          <ErrorBoundary>
            <HeroManager />
          </ErrorBoundary>
        );
      case 'projects':
        return (
          <ErrorBoundary>
            <ProjectsManager />
          </ErrorBoundary>
        );
      case 'skills':
        return (
          <ErrorBoundary>
            <SkillsManager />
          </ErrorBoundary>
        );
      case 'experience':
        return (
          <ErrorBoundary>
            <ExperienceManager />
          </ErrorBoundary>
        );
      case 'certifications':
        return (
          <ErrorBoundary>
            <CertificationsManager />
          </ErrorBoundary>
        );
      default:
        return (
          <ErrorBoundary>
            <HeroManager />
          </ErrorBoundary>
        );
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f8f9fa',
      padding: '2rem'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>
              Portfolio Admin
            </h1>
            <p style={{ margin: '0.5rem 0 0 0', opacity: 0.9 }}>
              Welcome, {currentUser?.email}
            </p>
          </div>
          <button
            onClick={handleLogout}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
          >
            Logout
          </button>
        </div>

        {/* Navigation Tabs */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid #e9ecef',
          backgroundColor: '#f8f9fa'
        }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                padding: '1rem 1.5rem',
                border: 'none',
                backgroundColor: activeTab === tab.id ? 'white' : 'transparent',
                color: activeTab === tab.id ? '#495057' : '#6c757d',
                borderBottom: activeTab === tab.id ? '3px solid #667eea' : '3px solid transparent',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: activeTab === tab.id ? '600' : '400',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{ 
          padding: '2rem',
          minHeight: '600px'
        }}>
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
