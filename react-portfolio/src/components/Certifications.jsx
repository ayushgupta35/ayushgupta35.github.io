import React, { useEffect, useState } from 'react';
import { certificationsService } from '../firebase/services';

const Certifications = () => {
  const [certificationsArray, setCertificationsArray] = useState([]);

  useEffect(() => {
    const fetchCertifications = async () => {
      try {
        const certificationsData = await certificationsService.getCertifications();
        console.log('Certifications data fetched:', certificationsData);
        
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
            <ul>
              {Array.isArray(certificationCategory.items) && certificationCategory.items.map((item, itemIndex) => {
                if (item.includes(' - ')) {
                  const [bold, rest] = item.split(' - ');
                  return (
                    <li key={itemIndex}>
                      <b>{bold}</b> - {rest}
                    </li>
                  );
                } else {
                  return <li key={itemIndex}>{item}</li>;
                }
              })}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Certifications;
