import { database } from './config';
import { ref, get, set, push, remove, update } from 'firebase/database';

// Portfolio data services
export const portfolioService = {
  // Get all portfolio data
  async getPortfolioData() {
    try {
      const snapshot = await get(ref(database, 'portfolio'));
      return snapshot.exists() ? snapshot.val() : null;
    } catch (error) {
      console.error('Error fetching portfolio data:', error);
      throw error;
    }
  },

  // Update portfolio data
  async updatePortfolioData(data) {
    try {
      await set(ref(database, 'portfolio'), data);
      return true;
    } catch (error) {
      console.error('Error updating portfolio data:', error);
      throw error;
    }
  },

  // Get personal info
  async getPersonalInfo() {
    try {
      const snapshot = await get(ref(database, 'portfolio/personalInfo'));
      return snapshot.exists() ? snapshot.val() : null;
    } catch (error) {
      console.error('Error fetching personal info:', error);
      throw error;
    }
  },

  // Update personal info
  async updatePersonalInfo(personalInfo) {
    try {
      await set(ref(database, 'portfolio/personalInfo'), personalInfo);
      return true;
    } catch (error) {
      console.error('Error updating personal info:', error);
      throw error;
    }
  }
};

// Projects data services
export const projectsService = {
  // Get all projects
  async getProjects() {
    try {
      const snapshot = await get(ref(database, 'projects'));
      if (!snapshot.exists()) return [];
      
      const projectsObj = snapshot.val();
      const projectsArray = Object.values(projectsObj);
      
      // Sort by order if it exists, otherwise maintain original order
      return projectsArray.sort((a, b) => {
        if (a.order !== undefined && b.order !== undefined) {
          return a.order - b.order;
        }
        return 0;
      });
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  },

  // Update projects order
  async updateProjectsOrder(orderedProjects) {
    try {
      const updates = {};
      orderedProjects.forEach((project, index) => {
        updates[`projects/${project.id}/order`] = index;
      });
      await update(ref(database), updates);
      return true;
    } catch (error) {
      console.error('Error updating projects order:', error);
      throw error;
    }
  },

  // Add new project
  async addProject(project) {
    try {
      const projectRef = ref(database, `projects/${project.id}`);
      await set(projectRef, project);
      return project;
    } catch (error) {
      console.error('Error adding project:', error);
      throw error;
    }
  },

  // Update project
  async updateProject(projectId, project) {
    try {
      await update(ref(database, `projects/${projectId}`), project);
      return true;
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  },

  // Delete project
  async deleteProject(projectId) {
    try {
      await remove(ref(database, `projects/${projectId}`));
      return true;
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  },

  // Get single project
  async getProject(projectId) {
    try {
      const snapshot = await get(ref(database, `projects/${projectId}`));
      return snapshot.exists() ? snapshot.val() : null;
    } catch (error) {
      console.error('Error fetching project:', error);
      throw error;
    }
  }
};

// Skills data services
export const skillsService = {
  // Get all skills
  async getSkills() {
    try {
      const snapshot = await get(ref(database, 'skills'));
      if (!snapshot.exists()) return [];
      
      const skillsData = snapshot.val();
      
      // Check if it's stored as an array (new format) or object (old format)
      if (Array.isArray(skillsData)) {
        return skillsData;
      } else if (typeof skillsData === 'object') {
        // Convert object format to array format for ordering
        return Object.entries(skillsData).map(([category, skills]) => ({
          category,
          skills: Array.isArray(skills) ? skills : []
        }));
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching skills:', error);
      throw error;
    }
  },

  // Update skills (store as array to maintain order)
  async updateSkills(skillsArray) {
    try {
      await set(ref(database, 'skills'), skillsArray);
      return true;
    } catch (error) {
      console.error('Error updating skills:', error);
      throw error;
    }
  }
};

// Experience data services
export const experienceService = {
  // Get all experience
  async getExperience() {
    try {
      const snapshot = await get(ref(database, 'experience'));
      return snapshot.exists() ? snapshot.val() : [];
    } catch (error) {
      console.error('Error fetching experience:', error);
      throw error;
    }
  },

  // Update experience
  async updateExperience(experience) {
    try {
      await set(ref(database, 'experience'), experience);
      return true;
    } catch (error) {
      console.error('Error updating experience:', error);
      throw error;
    }
  }
};

// Certifications data services
export const certificationsService = {
  // Get all certifications
  async getCertifications() {
    try {
      const snapshot = await get(ref(database, 'certifications'));
      if (!snapshot.exists()) return [];
      
      const certificationsData = snapshot.val();
      
      // Check if it's stored as an array (new format) or object (old format)
      if (Array.isArray(certificationsData)) {
        return certificationsData;
      } else if (typeof certificationsData === 'object') {
        // Convert object format to array format for ordering
        return Object.entries(certificationsData).map(([category, items]) => ({
          category,
          items: Array.isArray(items) ? items : []
        }));
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching certifications:', error);
      throw error;
    }
  },

  // Update certifications (store as array to maintain order)
  async updateCertifications(certificationsArray) {
    try {
      await set(ref(database, 'certifications'), certificationsArray);
      return true;
    } catch (error) {
      console.error('Error updating certifications:', error);
      throw error;
    }
  }
};

// Hero Service
export const heroService = {
  getHeroData: async () => {
    try {
      const snapshot = await get(ref(database, 'hero'));
      return snapshot.val();
    } catch (error) {
      console.error('Error fetching hero data:', error);
      throw error;
    }
  },

  updateHeroData: async (heroData) => {
    try {
      await set(ref(database, 'hero'), heroData);
    } catch (error) {
      console.error('Error updating hero data:', error);
      throw error;
    }
  },

  migrateCurrentContent: async () => {
    try {
      // Check if hero data already exists
      const existingData = await heroService.getHeroData();
      if (existingData && existingData.introParagraph) {
        return existingData;
      }

      // Default content to migrate
      const defaultHeroContent = {
        profilePicture: '',
        subHeader: 'CS, Data Science, & Informatics @ UW Seattle',
        introParagraph: "I build systems, tools, and interfaces that make life easier, shaped by a background in CS, Data Science, and Informatics. Here's what I bring to the table:",
        bulletPoints: [
          "🛠️ Systems-minded engineer with a passion for automation, clean architecture, and seamless user experiences.",
          "🌐 Full-stack capable — from backend APIs and data pipelines to polished frontends and intuitive UI/UX.",
          "🤖 Built internal tools and workflows that eliminate friction and make complex tasks feel simple.",
          "🎨 Blend technical depth with product design instincts — I think in flows, not just functions.",
          "🚀 Thrive in fast-paced teams, from early startups to enterprise environments; I ramp fast and ship with purpose."
        ]
      };

      await heroService.updateHeroData(defaultHeroContent);
      return defaultHeroContent;
    } catch (error) {
      console.error('Error migrating hero content:', error);
      throw error;
    }
  }
};
