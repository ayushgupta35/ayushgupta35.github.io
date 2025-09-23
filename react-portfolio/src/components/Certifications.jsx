import React, { useEffect, useState } from 'react';
import { certificationsService } from '../firebase/services';

const Certifications = () => {
  const [certificationsArray, setCertificationsArray] = useState([]);

  useEffect(() => {
    const fetchCertifications = async () => {
      try {
        const certificationsData = await certificationsService.getCertifications();
        
        // Keep as array format to maintain order
        if (Array.isArray(certificationsData)) {
          setCertificationsArray(certificationsData);
        } else if (typeof certificationsData === 'object') {
          // Convert object format to array format (for legacy data)
          const certificationsArray = Object.entries(certificationsData).map(([category, items]) => ({
            category,
            items: Array.isArray(items) ? items : []
          }));
          setCertificationsArray(certificationsArray);
        } else {
          setCertificationsArray([]);
        }
      } catch (error) {
        console.error('Error fetching certifications:', error);
      }
    };

    fetchCertifications();
  }, []);

  return (
    <section className="skills certifications" id="certifications" style={{ display: 'flex' }}>
      <div className="certifications-container">
        {/* Dynamically render certification categories in the order they appear in the array */}
        {certificationsArray.map((certificationCategory, index) => (
          <div key={certificationCategory.category} className="certification-item">
            <h3>{certificationCategory.category}</h3>
            <div className="certification-content">
              {Array.isArray(certificationCategory.items) && certificationCategory.items.map((item, itemIndex) => {
                if (item.includes(' - ')) {
                  const [title, description] = item.split(' - ');
                  return (
                    <div key={itemIndex} className="certification-entry">
                      <h4 className="certification-title">{title}</h4>
                      <p className="certification-description">{description}</p>
                    </div>
                  );
                } else {
                  return (
                    <div key={itemIndex} className="certification-entry">
                      <h4 className="certification-title">{item}</h4>
                    </div>
                  );
                }
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Certifications;
