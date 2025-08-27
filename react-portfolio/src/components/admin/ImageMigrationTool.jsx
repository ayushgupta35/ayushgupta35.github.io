import React, { useState } from 'react';
import { projectsService, experienceService } from '../../firebase/services';
import { imageService } from '../../firebase/imageService';

const ImageMigrationTool = () => {
  const [status, setStatus] = useState('Ready to migrate images');
  const [migrationLog, setMigrationLog] = useState([]);
  const [isRunning, setIsRunning] = useState(false);

  const log = (message) => {
    setMigrationLog(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
    console.log(message);
  };

  const fetchImageAsFile = async (imagePath, filename) => {
    try {
      // Remove leading slash if present and handle both /assets/ and assets/ paths
      let cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
      
      // If the path starts with assets/, use it directly. Otherwise prepend it.
      if (!cleanPath.startsWith('assets/')) {
        cleanPath = `assets/${cleanPath}`;
      }
      
      console.log(`Attempting to fetch: ${cleanPath}`);
      const response = await fetch(`/${cleanPath}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch ${cleanPath}: ${response.statusText}`);
      }
      
      const blob = await response.blob();
      const extension = imagePath.split('.').pop().toLowerCase();
      
      // Determine MIME type
      const mimeTypes = {
        'png': 'image/png',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'gif': 'image/gif',
        'webp': 'image/webp'
      };
      
      const mimeType = mimeTypes[extension] || 'image/png';
      return new File([blob], `${filename}.${extension}`, { type: mimeType });
    } catch (error) {
      log(`Error fetching ${imagePath}: ${error.message}`);
      return null;
    }
  };

  const migrateProjectImages = async () => {
    try {
      log('Starting project images migration...');
      const projects = await projectsService.getProjects();
      const projectsList = Object.values(projects || {});
      
      for (const project of projectsList) {
        if (project.image && project.image.startsWith('/assets/')) {
          log(`Migrating image for project: ${project.title}`);
          
          const filename = `${project.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`;
          const imageFile = await fetchImageAsFile(project.image, filename);
          
          if (imageFile) {
            const result = await imageService.uploadProjectImage(imageFile);
            
            // Update project with new Firebase Storage URL
            const updatedProject = { ...project, image: result.url };
            await projectsService.updateProject(project.id, updatedProject);
            
            log(`✅ Migrated ${project.title}: ${result.url}`);
          } else {
            log(`❌ Failed to migrate ${project.title}`);
          }
        } else if (project.image && project.image.includes('firebasestorage')) {
          log(`⏭️ Skipping ${project.title} - already on Firebase Storage`);
        } else {
          log(`⏭️ Skipping ${project.title} - no local image to migrate`);
        }
      }
      
      log('Project images migration completed!');
    } catch (error) {
      log(`Error migrating project images: ${error.message}`);
    }
  };

  const migrateCompanyLogos = async () => {
    try {
      log('Starting company logos migration...');
      const experiences = await experienceService.getExperience();
      const experiencesList = Array.isArray(experiences) ? experiences : [];
      
      const updatedExperiences = [];
      
      for (const experience of experiencesList) {
        if (experience.companyLogo && experience.companyLogo.startsWith('/assets/')) {
          log(`Migrating logo for company: ${experience.company}`);
          
          const filename = `${experience.company.toLowerCase().replace(/[^a-z0-9]/g, '-')}-logo-${Date.now()}`;
          const logoFile = await fetchImageAsFile(experience.companyLogo, filename);
          
          if (logoFile) {
            const result = await imageService.uploadCompanyLogo(logoFile);
            
            // Update experience with new Firebase Storage URL
            const updatedExperience = { ...experience, companyLogo: result.url };
            updatedExperiences.push(updatedExperience);
            
            log(`✅ Migrated ${experience.company}: ${result.url}`);
          } else {
            log(`❌ Failed to migrate ${experience.company}`);
            updatedExperiences.push(experience);
          }
        } else if (experience.companyLogo && experience.companyLogo.includes('firebasestorage')) {
          log(`⏭️ Skipping ${experience.company} - already on Firebase Storage`);
          updatedExperiences.push(experience);
        } else {
          log(`⏭️ Skipping ${experience.company} - no local logo to migrate`);
          updatedExperiences.push(experience);
        }
      }
      
      // Update all experiences at once
      await experienceService.updateExperience(updatedExperiences);
      log('Company logos migration completed!');
    } catch (error) {
      log(`Error migrating company logos: ${error.message}`);
    }
  };

  const testImageAccess = async () => {
    setStatus('Testing image access...');
    setMigrationLog([]);
    
    const testPaths = [
      '/assets/beacon.png',
      'assets/beacon.png',
      '/public/assets/beacon.png',
      './assets/beacon.png',
      '../../../public/assets/beacon.png',
      new URL('/assets/beacon.png', window.location.origin).href,
      `${window.location.origin}/assets/beacon.png`
    ];

    log('🔍 Testing different asset paths...');

    for (const testPath of testPaths) {
      try {
        log(`Testing path: ${testPath}`);
        
        const response = await fetch(testPath);
        if (response.ok) {
          log(`✅ SUCCESS: ${testPath} - Status: ${response.status}`);
          log(`Content-Type: ${response.headers.get('content-type')}`);
          log(`Content-Length: ${response.headers.get('content-length')} bytes`);
        } else {
          log(`❌ FAILED: ${testPath} - Status: ${response.status}`);
        }
      } catch (error) {
        log(`❌ ERROR: ${testPath} - ${error.message}`);
      }
    }

    // Test direct image access
    const img = new Image();
    img.onload = () => {
      log('✅ Image element can load: /assets/beacon.png');
    };
    img.onerror = () => {
      log('❌ Image element failed to load: /assets/beacon.png');
    };
    img.src = '/assets/beacon.png';
    
    setStatus('Image access test completed');
  };

  const runMigration = async () => {
    setIsRunning(true);
    setMigrationLog([]);
    setStatus('Migration in progress...');
    
    try {
      await migrateProjectImages();
      await migrateCompanyLogos();
      setStatus('Migration completed successfully! 🎉');
    } catch (error) {
      setStatus(`Migration failed: ${error.message}`);
      log(`Migration failed: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const identifyStaticAssets = () => {
    const staticAssets = [
      'ayush.jpeg', // Your headshot
      'mason-wilkes-TMgQMXoglsM-unsplash.jpg', // Background image
      'email_dark.png',
      'email_light.png',
      'github_dark.png',
      'github_light.png',
      'linkedin_dark.png',
      'linkedin_light.png',
      'theme_dark.png',
      'theme_light.png',
      'mail.png',
      'github-logo.png'
    ];
    
    return staticAssets;
  };

  return (
    <div style={{ 
      padding: '2rem', 
      border: '2px solid #007bff', 
      borderRadius: '8px', 
      margin: '1rem',
      backgroundColor: '#f8f9fa'
    }}>
      <h2>📦 Image Migration Tool</h2>
      <p>This tool will migrate project images and company logos from local assets to Firebase Storage.</p>
      
      <div style={{ marginBottom: '1rem' }}>
        <h4>Static Assets (will remain local):</h4>
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '0.5rem',
          fontSize: '0.8rem',
          color: '#666'
        }}>
          {identifyStaticAssets().map(asset => (
            <span key={asset} style={{ 
              backgroundColor: '#e9ecef', 
              padding: '0.25rem 0.5rem', 
              borderRadius: '4px' 
            }}>
              {asset}
            </span>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <p><strong>Status:</strong> {status}</p>
        
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <button 
            onClick={testImageAccess}
            disabled={isRunning}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isRunning ? 'not-allowed' : 'pointer',
              fontSize: '1rem'
            }}
          >
            Test Image Access
          </button>
          
          <button 
            onClick={runMigration}
            disabled={isRunning}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: isRunning ? '#6c757d' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isRunning ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              fontWeight: 'bold'
            }}
          >
            {isRunning ? 'Migrating...' : 'Start Migration'}
          </button>
        </div>
      </div>
      
      {migrationLog.length > 0 && (
        <div style={{ 
          backgroundColor: '#ffffff',
          border: '1px solid #dee2e6',
          borderRadius: '4px',
          padding: '1rem',
          maxHeight: '300px',
          overflowY: 'auto'
        }}>
          <strong>Migration Log:</strong>
          <div style={{ fontSize: '0.85rem', fontFamily: 'monospace', marginTop: '0.5rem' }}>
            {migrationLog.map((entry, index) => (
              <div key={index} style={{ 
                padding: '0.25rem 0',
                borderBottom: index < migrationLog.length - 1 ? '1px solid #f1f3f4' : 'none'
              }}>
                {entry}
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div style={{ 
        marginTop: '1rem', 
        padding: '1rem',
        backgroundColor: '#fff3cd',
        border: '1px solid #ffeaa7',
        borderRadius: '4px',
        fontSize: '0.9rem'
      }}>
        <strong>⚠️ Important:</strong> This migration will:
        <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }}>
          <li>Upload project images and company logos to Firebase Storage</li>
          <li>Update database references to use Firebase Storage URLs</li>
          <li>Keep static assets (your headshot, icons) in local assets folder</li>
          <li>Run only once - subsequent runs will skip already migrated images</li>
        </ul>
      </div>
    </div>
  );
};

export default ImageMigrationTool;
