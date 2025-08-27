// Utility functions for data validation and normalization

export const normalizeProjectData = (project) => {
  return {
    id: project.id || '',
    title: project.title || '',
    description: project.description || '',
    image: project.image || '',
    technologies: Array.isArray(project.technologies) ? project.technologies : [],
    githubUrl: project.githubUrl || '',
    liveUrl: project.liveUrl || '',
    featured: Boolean(project.featured),
    category: project.category || '',
    longDescription: project.longDescription || '',
    challenges: project.challenges || '',
    learnings: project.learnings || ''
  };
};

export const normalizeSkillsData = (skills) => {
  if (!Array.isArray(skills)) return [];
  return skills.map(skillCategory => ({
    category: skillCategory.category || '',
    skills: Array.isArray(skillCategory.skills) ? skillCategory.skills : []
  }));
};

export const normalizeExperienceData = (experiences) => {
  if (!Array.isArray(experiences)) return [];
  return experiences.map(experience => ({
    title: experience.title || '',
    company: experience.company || '',
    companyLogo: experience.companyLogo || '',
    duration: experience.duration || '',
    responsibilities: Array.isArray(experience.responsibilities) ? experience.responsibilities : []
  }));
};

export const normalizeCertificationsData = (certifications) => {
  if (!Array.isArray(certifications)) return [];
  return certifications.map(certification => ({
    category: certification.category || '',
    items: Array.isArray(certification.items) ? certification.items : []
  }));
};

export const validateProjectData = (project) => {
  const errors = [];
  
  if (!project.id || project.id.trim() === '') {
    errors.push('Project ID is required');
  }
  
  if (!project.title || project.title.trim() === '') {
    errors.push('Project title is required');
  }
  
  if (!project.description || project.description.trim() === '') {
    errors.push('Project description is required');
  }
  
  return errors;
};

export const validateSkillData = (skillCategory) => {
  const errors = [];
  
  if (!skillCategory.category || skillCategory.category.trim() === '') {
    errors.push('Skill category name is required');
  }
  
  if (!Array.isArray(skillCategory.skills) || skillCategory.skills.length === 0) {
    errors.push('At least one skill is required');
  }
  
  return errors;
};

export const validateExperienceData = (experience) => {
  const errors = [];
  
  if (!experience.title || experience.title.trim() === '') {
    errors.push('Job title is required');
  }
  
  if (!experience.company || experience.company.trim() === '') {
    errors.push('Company name is required');
  }
  
  if (!experience.duration || experience.duration.trim() === '') {
    errors.push('Duration is required');
  }
  
  if (!Array.isArray(experience.responsibilities) || experience.responsibilities.length === 0) {
    errors.push('At least one responsibility is required');
  }
  
  return errors;
};

export const validateCertificationData = (certification) => {
  const errors = [];
  
  if (!certification.category || certification.category.trim() === '') {
    errors.push('Certification category name is required');
  }
  
  if (!Array.isArray(certification.items) || certification.items.length === 0) {
    errors.push('At least one certification/course is required');
  }
  
  return errors;
};
