import { useEffect } from 'react';
import { visitorService } from '../firebase/services';

const useVisitorTracking = () => {
  useEffect(() => {
    // Track the visit when the component mounts
    const trackVisit = async () => {
      try {
        await visitorService.recordVisit();
      } catch (error) {
        console.error('Error tracking visit:', error);
      }
    };

    // Add a small delay to ensure the page has loaded
    const timer = setTimeout(trackVisit, 1000);

    return () => clearTimeout(timer);
  }, []);
};

export default useVisitorTracking;
