// Click events for buttons
const portfolio = document.getElementById("portfolio");
const portfolioBtn = document.getElementById("portfolio-btn");
const skills = document.getElementById("skills");
const skillsBtn = document.getElementById("skills-btn");
const experience = document.getElementById("experience");
const experienceBtn = document.getElementById("experience-btn");
const certifications = document.getElementById("certifications");
const certificationsBtn = document.getElementById("certifications-btn");

portfolioBtn.addEventListener("click", (event) => {
  portfolio.style.display = "flex";
  skills.style.display = "none";
  experience.style.display = "none";
  certifications.style.display = "none";
  portfolioBtn.classList.add("active-btn");
  skillsBtn.classList.remove("active-btn");
  experienceBtn.classList.remove("active-btn");
  certificationsBtn.classList.remove("active-btn");
});

skillsBtn.addEventListener("click", (event) => {
  portfolio.style.display = "none";
  skills.style.display = "flex";
  experience.style.display = "none";
  certifications.style.display = "none";
  portfolioBtn.classList.remove("active-btn");
  skillsBtn.classList.add("active-btn");
  experienceBtn.classList.remove("active-btn");
  certificationsBtn.classList.remove("active-btn");
});

experienceBtn.addEventListener("click", (event) => {
  portfolio.style.display = "none";
  skills.style.display = "none";
  experience.style.display = "flex";
  certifications.style.display = "none";
  portfolioBtn.classList.remove("active-btn");
  skillsBtn.classList.remove("active-btn");
  experienceBtn.classList.add("active-btn");
  certificationsBtn.classList.remove("active-btn");
});

certificationsBtn.addEventListener("click", (event) => {
  portfolio.style.display = "none";
  skills.style.display = "none";
  experience.style.display = "none";
  certifications.style.display = "flex";
  portfolioBtn.classList.remove("active-btn");
  skillsBtn.classList.remove("active-btn");
  experienceBtn.classList.remove("active-btn");
  certificationsBtn.classList.add("active-btn");
});