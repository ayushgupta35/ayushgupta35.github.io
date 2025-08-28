import React, { useEffect, useState } from 'react';
import { Download, Mail, Check } from 'lucide-react';
import { portfolioService } from '../firebase/services';

const CTA = () => {
  const [personalInfo, setPersonalInfo] = useState(null);
  const [showTooltip, setShowTooltip] = useState(false);

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

  const copyEmail = async (e) => {
    e.preventDefault();
    if (personalInfo?.socialLinks?.email) {
      try {
        await navigator.clipboard.writeText(personalInfo.socialLinks.email);
        setShowTooltip(true);
        setTimeout(() => setShowTooltip(false), 2000);
      } catch (err) {
        console.error('Failed to copy email:', err);
        // Fallback: open mailto as before
        window.location.href = `mailto:${personalInfo.socialLinks.email}`;
      }
    }
  };

  if (!personalInfo) {
    return null;
  }

  return (
    <div className="cta-floating-actions">
      <a href={personalInfo.resumeLink} download className="floating-action resume-action">
        <div className="action-icon">
          <Download size={20} />
        </div>
        <span className="action-label">Resume</span>
      </a>
      <button 
        onClick={copyEmail}
        className="floating-action contact-action"
      >
        <div className="action-icon">
          {showTooltip ? <Check size={20} /> : <Mail size={20} />}
        </div>
        <span className="action-label">Contact</span>
        {showTooltip && (
          <div className="email-tooltip">
            {personalInfo.socialLinks.email} copied!
          </div>
        )}
      </button>
    </div>
  );
};

export default CTA;
