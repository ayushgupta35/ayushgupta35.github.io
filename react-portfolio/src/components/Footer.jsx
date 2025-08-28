import React from 'react';
import { ChevronUp } from 'lucide-react';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <>
      {/* Back to Top Button */}
      <button 
        className="back-to-top-btn"
        onClick={scrollToTop}
        aria-label="Back to top"
      >
        <ChevronUp size={20} />
      </button>
      
      <footer>
        <p>&copy; Ayush Gupta 2025</p>
      </footer>
    </>
  );
};

export default Footer;
