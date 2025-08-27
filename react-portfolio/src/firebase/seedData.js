// This is a simple script to upload the example data to Firebase
// Run this once to populate your database with your portfolio data

import { database } from './config.js';
import { ref, set } from 'firebase/database';

// Full portfolio data - matches the structure from example-firebase.json
const portfolioData = {
  "certifications": {
    "Awards": [
      "National Merit Scholarship - Top 1,000 students nationwide",
      "University of Washington Purple & Gold Scholar - Highest university level",
      "Robert Half Student Scholar - Sole award recipient"
    ],
    "Certifications": [
      "Oracle - MySQL Database Service Explorer",
      "GitHub - All In for Students Open Source Contributor",
      "Dubstech - Data Visualization in Tableau & Power BI",
      "Salesforce - Opportunity Management Training",
      "Microsoft 365 - Master of Excel"
    ],
    "Other Courses": [
      "Harvard - CS50 Intro to Computer Science",
      "Harvard - CS50 Web Development",
      "Georgia Tech - Intro to C++"
    ],
    "UW Courses Taken": [
      "CSE 442 - Distributed Systems",
      "CSE 446 - Machine Learning", 
      "CSE 473 - Artificial Intelligence",
      "CSE 421 - Algorithms",
      "CSE 333 - Systems Programming",
      "CSE 332 - Data Structures & Parallelism",
      "CSE 344 - SQL & Databases",
      "CSE 331 - Software Design & Implementation",
      "INFO 200 - User Experience & Design",
      "INFO 201 - R & Data Science"
    ]
  },
  "experience": [
    {
      "company": "GEICO",
      "companyLogo": "/assets/GEICO.png",
      "description": [
        "Building internal tools to streamline cloud infrastructure provisioning across 20+ engineering teams, reducing manual overhead in hybrid IaaS management.",
        "Developing a full-stack FinOps extension that guides engineers through compute provisioning using decision matrices and predictive models to recommend cost-effective configurations."
      ],
      "period": "June 2025 - Present",
      "title": "Software Development Intern"
    },
    {
      "company": "Flow",
      "companyLogo": "/assets/flow-logo.png",
      "description": [
        "Led backend development for an AI-powered B2B sales platform, using Spark to aggregate and transform customer data from 20+ APIs (Salesforce, HubSpot, ZoomInfo) into scalable insights.",
        "Built secure Django/PostgreSQL systems for lead scoring, improving sales rep productivity by 23% in pilot tests.",
        "Optimized CI/CD pipelines (GitHub Actions) and managed Azure infrastructure."
      ],
      "period": "October 2023 - June 2025",
      "title": "Founding Engineer"
    },
    {
      "company": "University of Washington Information School",
      "companyLogo": "/assets/uw-logo.png",
      "description": [
        "Taught R programming and data analysis to a class of 25 students, offering weekly 1:1 and group support that improved student assignment scores and engagement.",
        "Designed inclusive lesson materials and feedback loops to support a diverse range of learners."
      ],
      "period": "September 2024 – June 2025",
      "title": "Undergraduate Teaching Assistant"
    }
  ],
  "portfolio": {
    "personalInfo": {
      "bio": "",
      "description": [],
      "image": "/assets/ayush.jpeg",
      "location": "Seattle, WA",
      "name": "Ayush Gupta",
      "resumeLink": "https://docs.google.com/document/d/1awk77bpE-Yjjo2IFfMGwo6tTNhgtpr1MzqtRur37NtM/export?format=pdf",
      "socialLinks": {
        "email": "ayushg3512@gmail.com",
        "github": "https://github.com/ayushgupta35",
        "linkedin": "https://linkedin.com/in/ayushgupta35"
      },
      "title": "CS, Data Science, & Informatics @ UW Seattle",
      "university": "University of Washington",
      "universityLogo": "/assets/uw-logo.png"
    }
  },
  "projects": {
    "mini-google": {
      "description": "Built a full-stack mini search engine in C/C++ from scratch that indexes files, stores data on disk, and serves ranked search results via a multithreaded HTTP server with browser support.",
      "id": "mini-google",
      "image": "/assets/mini-google.png",
      "presentationLink": "",
      "resourcesLink": "",
      "technologies": "C, C++, HTML",
      "title": "Mini Google Search Engine"
    },
    "simple-db": {
      "description": "SimpleDB is a fully functional, educational relational database system built from scratch in Java, designed to simulate the core components of modern RDBMS systems.",
      "id": "simple-db",
      "image": "/assets/simple-db.png",
      "presentationLink": "",
      "resourcesLink": "",
      "technologies": "Java, SQL",
      "title": "SimpleDB"
    },
    "paxos": {
      "description": "Built a fully functional implementation of the Paxos consensus protocol from scratch in Java.",
      "id": "paxos",
      "image": "/assets/paxos.png",
      "presentationLink": "",
      "resourcesLink": "",
      "technologies": "Java",
      "title": "Paxos Made Simple"
    }
  },
  "skills": {
    "Software Engineering": [
      "Python", "Java", "C", "C++", "C#", "AI", "Machine Learning", "REST APIs", "DevOps",
      "CI/CD", "Docker", "Kubernetes", "Spring", "Linux", "AWS", "Azure", "Flask", "Django",
      "React", "JavaScript", "HTML", "OOP", "Data Structures"
    ],
    "Data Engineering": [
      "R", "MySQL", "NoSQL", "PostgreSQL", "Business Intelligence", "Data Models", "ETL Design",
      "Data Architecture", "Distributed Storage", "Data Mining", "Spark", "Hadoop", "Pandas",
      "Tableau", "Power BI", "Excel", "Relational Databases"
    ],
    "Automation & Tools": [
      "Selenium", "Postman", "Web Services", "Salesforce CRM", "Oracle CRM", "Oracle Fusion",
      "GitHub", "Figma"
    ],
    "Soft Skills": [
      "Collaboration", "Communication", "Adaptability", "Customer Obsession", "Attention to Detail",
      "User-Centered Design"
    ]
  }
};

async function seedData() {
  try {
    console.log('Uploading portfolio data to Firebase...');
    await set(ref(database, '/'), portfolioData);
    console.log('✅ Portfolio data uploaded successfully!');
    console.log('You can now run your React app and see the data.');
  } catch (error) {
    console.error('❌ Error uploading data:', error);
  }
}

// Uncomment the line below and run this file to seed your database
// seedData();

export { seedData };
