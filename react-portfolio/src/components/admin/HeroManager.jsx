import React, { useState, useEffect } from 'react';
import { heroService, portfolioService } from '../../firebase/services';
import ImageUpload from './ImageUpload';

const HeroManager = () => {
  const [heroData, setHeroData] = useState({
    profilePicture: '',
    subHeader: '',
    introParagraph: '',
    bulletPoints: ['', '', '', '', '']
  });
  const [personalInfo, setPersonalInfo] = useState(null);
  const [imagePath, setImagePath] = useState(''); // Track Firebase Storage path for deletion
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchHeroData();
    fetchPersonalInfo();
  }, []);

  const fetchPersonalInfo = async () => {
    try {
      const portfolioData = await portfolioService.getPortfolioData();
      if (portfolioData?.personalInfo) {
        setPersonalInfo(portfolioData.personalInfo);
      }
    } catch (error) {
      console.error('Error fetching personal info:', error);
    }
  };

  const fetchHeroData = async () => {
    try {
      // First try to get existing data
      let data = await heroService.getHeroData();
      
      // If no data exists, migrate the current content
      if (!data || !data.introParagraph) {
        data = await heroService.migrateCurrentContent();
        setMessage('Current content migrated to Firebase successfully!');
        setTimeout(() => setMessage(''), 3000);
      }
      
      if (data) {
        setHeroData({
          profilePicture: data.profilePicture || '',
          subHeader: data.subHeader || '',
          introParagraph: data.introParagraph || '',
          bulletPoints: data.bulletPoints || ['', '', '', '', '']
        });
      }
    } catch (error) {
      console.error('Error fetching hero data:', error);
      setMessage('Error loading hero data');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleInputChange = (field, value) => {
    setHeroData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleBulletPointChange = (index, value) => {
    setHeroData(prev => ({
      ...prev,
      bulletPoints: prev.bulletPoints.map((point, i) => i === index ? value : point)
    }));
  };

  const handleImageChange = (url, path) => {
    setHeroData(prev => ({ ...prev, profilePicture: url }));
    setImagePath(path);
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await heroService.updateHeroData(heroData);
      setMessage('Hero section updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error updating hero data:', error);
      setMessage('Error updating hero section');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="hero-manager">
      <h2>Hero Section Management</h2>
      
      {message && (
        <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      <div className="hero-form">
        <div className="form-section">
          <h3>Profile Picture</h3>
          {/* Show current profile picture */}
          <div className="current-image-section">
            <h4>Current Profile Picture:</h4>
            <div className="current-image-display">
              {(heroData.profilePicture || personalInfo?.image) ? (
                <img 
                  src={heroData.profilePicture || personalInfo?.image} 
                  alt="Current profile" 
                  className="current-profile-pic"
                />
              ) : (
                <div className="no-image-placeholder">
                  No profile picture set
                </div>
              )}
            </div>
          </div>
          
          {/* Image upload for new picture */}
          <div className="image-upload-section">
            <h4>Upload New Picture:</h4>
            <ImageUpload
              currentImage={heroData.profilePicture}
              onImageChange={handleImageChange}
              folder="projects"
              label="Profile Picture"
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Sub-header</h3>
          <input
            type="text"
            value={heroData.subHeader}
            onChange={(e) => handleInputChange('subHeader', e.target.value)}
            placeholder="CS, Data Science, & Informatics @ UW Seattle"
          />
        </div>

        <div className="form-section">
          <h3>Introduction Paragraph</h3>
          <textarea
            value={heroData.introParagraph}
            onChange={(e) => handleInputChange('introParagraph', e.target.value)}
            placeholder="I build systems, tools, and interfaces that make life easier, shaped by a background in CS, Data Science, and Informatics. Here's what I bring to the table:"
            rows="3"
          />
        </div>

        <div className="form-section">
          <h3>Bullet Points</h3>
          {heroData.bulletPoints.map((point, index) => {
            const placeholders = [
              "🛠️ Systems-minded engineer with a passion for automation, clean architecture, and seamless user experiences.",
              "🌐 Full-stack capable — from backend APIs and data pipelines to polished frontends and intuitive UI/UX.",
              "🤖 Built internal tools and workflows that eliminate friction and make complex tasks feel simple.",
              "🎨 Blend technical depth with product design instincts — I think in flows, not just functions.",
              "🚀 Thrive in fast-paced teams, from early startups to enterprise environments; I ramp fast and ship with purpose."
            ];
            
            return (
              <div key={index} className="bullet-point-input">
                <span className="bullet-number">{index + 1}.</span>
                <textarea
                  value={point}
                  onChange={(e) => handleBulletPointChange(index, e.target.value)}
                  placeholder={placeholders[index] || `Bullet point ${index + 1}`}
                  rows="2"
                />
              </div>
            );
          })}
        </div>

        <button 
          onClick={handleSave}
          disabled={isLoading}
          className="save-btn"
        >
          {isLoading ? 'Saving...' : 'Save Hero Section'}
        </button>
      </div>

      <style jsx>{`
        .hero-manager {
          padding: 2rem;
        }

        .form-section {
          margin-bottom: 2rem;
        }

        .form-section h3 {
          margin-bottom: 0.5rem;
          color: #333;
        }

        .current-image-section {
          margin-bottom: 1.5rem;
        }

        .current-image-section h4 {
          margin-bottom: 0.5rem;
          color: #555;
          font-size: 0.9rem;
        }

        .image-upload-section h4 {
          margin-bottom: 0.5rem;
          color: #555;
          font-size: 0.9rem;
        }

        .current-image-display {
          border: 2px dashed #ddd;
          border-radius: 8px;
          padding: 1rem;
          text-align: center;
          background: #f9f9f9;
        }

        .current-profile-pic {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          object-fit: cover;
          border: 3px solid #4B2E83;
        }

        .no-image-placeholder {
          color: #999;
          font-style: italic;
          padding: 2rem;
        }

        .form-section input,
        .form-section textarea {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 1rem;
        }

        .bullet-point-input {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }

        .bullet-number {
          font-weight: bold;
          margin-top: 0.5rem;
          min-width: 20px;
        }

        .bullet-point-input textarea {
          flex: 1;
        }

        .save-btn {
          background: #4B2E83;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 4px;
          cursor: pointer;
          font-size: 1rem;
          margin-top: 1rem;
        }

        .save-btn:hover {
          background: #3a2368;
        }

        .save-btn:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .message {
          padding: 1rem;
          border-radius: 4px;
          margin-bottom: 1rem;
        }

        .message.success {
          background: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }

        .message.error {
          background: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }
      `}</style>
    </div>
  );
};

export default HeroManager;
