import React, { useEffect, useState } from 'react';
import { Download, Mail, X, Copy, ExternalLink } from 'lucide-react';
import { portfolioService } from '../firebase/services';

const CTA = () => {
  const [personalInfo, setPersonalInfo] = useState(null);
  const [showContactHub, setShowContactHub] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
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

    fetchPersonalInfo();
  }, []);

  const toggleContactHub = (e) => {
    e.preventDefault();
    if (showContactHub) {
      closeContactHub();
    } else {
      setShowContactHub(true);
      setIsClosing(false);
    }
  };

  const closeContactHub = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShowContactHub(false);
      setIsClosing(false);
    }, 200); // Match the close animation duration
  };

  const getViewableResumeLink = (resumeLink) => {
    if (!resumeLink) return '';
    
    // Handle Google Docs links - convert to PDF viewer
    if (resumeLink.includes('docs.google.com/document')) {
      const docMatch = resumeLink.match(/\/document\/d\/([a-zA-Z0-9-_]+)/);
      if (docMatch) {
        const docId = docMatch[1];
        return `https://drive.google.com/file/d/${docId}/preview`;
      }
    }
    
    // For other links, return as-is
    return resumeLink;
  };

  if (!personalInfo) {
    return null;
  }

  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here if desired
    } catch (err) {
      console.error(`Failed to copy ${type}:`, err);
    }
  };

  return (
    <>
      <div className="cta-floating-actions">
        <a href={getViewableResumeLink(personalInfo.resumeLink)} target="_blank" rel="noopener noreferrer" className="floating-action resume-action">
          <div className="action-icon">
            <Download size={20} />
          </div>
          <span className="action-label">Resume</span>
        </a>
        <button 
          onClick={toggleContactHub}
          className={`floating-action contact-action ${showContactHub ? 'active' : ''}`}
        >
          <div className="action-icon">
            <Mail size={20} />
          </div>
          <span className="action-label">Contact</span>
        </button>
      </div>

      {/* Contact Hub Popup */}
      {showContactHub && (
        <>
          <div className={`contact-hub-backdrop ${isClosing ? 'closing' : ''}`} onClick={closeContactHub}></div>
          <div className={`contact-hub-overlay ${isClosing ? 'closing' : ''}`} onClick={closeContactHub}>
            <div className={`contact-hub ${isClosing ? 'closing' : ''}`} onClick={(e) => e.stopPropagation()}>
            <div className="contact-hub-header">
              <h3>Let's Connect!</h3>
              <button 
                className="close-btn"
                onClick={closeContactHub}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="contact-options">
              {/* Email */}
              {personalInfo.socialLinks?.email && (
                <div className="contact-option">
                  <div className="contact-info">
                    <Mail size={18} />
                    <span>{personalInfo.socialLinks.email}</span>
                  </div>
                  <div className="contact-actions">
                    <button 
                      className="action-btn copy-btn"
                      onClick={() => copyToClipboard(personalInfo.socialLinks.email, 'email')}
                      title="Copy email"
                    >
                      <Copy size={16} />
                    </button>
                    <button 
                      className="action-btn external-btn"
                      onClick={() => window.open(`mailto:${personalInfo.socialLinks.email}`)}
                      title="Open in email client"
                    >
                      <ExternalLink size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* LinkedIn */}
              {personalInfo.socialLinks?.linkedin && (
                <div className="contact-option">
                  <div className="contact-info">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                    <span>LinkedIn</span>
                  </div>
                  <div className="contact-actions">
                    <button 
                      className="action-btn copy-btn"
                      onClick={() => copyToClipboard(personalInfo.socialLinks.linkedin, 'LinkedIn')}
                      title="Copy LinkedIn URL"
                    >
                      <Copy size={16} />
                    </button>
                    <button 
                      className="action-btn external-btn"
                      onClick={() => window.open(personalInfo.socialLinks.linkedin, '_blank')}
                      title="Open LinkedIn profile"
                    >
                      <ExternalLink size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* GitHub */}
              {personalInfo.socialLinks?.github && (
                <div className="contact-option">
                  <div className="contact-info">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    <span>GitHub</span>
                  </div>
                  <div className="contact-actions">
                    <button 
                      className="action-btn copy-btn"
                      onClick={() => copyToClipboard(personalInfo.socialLinks.github, 'GitHub')}
                      title="Copy GitHub URL"
                    >
                      <Copy size={16} />
                    </button>
                    <button 
                      className="action-btn external-btn"
                      onClick={() => window.open(personalInfo.socialLinks.github, '_blank')}
                      title="Open GitHub profile"
                    >
                      <ExternalLink size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          </div>
        </>
      )}
    </>
  );
};

export default CTA;
