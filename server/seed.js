const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Import models
const User = require('./models/user');
const Candidate = require('./models/candidate');
const Job = require('./models/job');

dotenv.config();

const seedDatabase = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Database connected successfully.');

    // Clear existing collections
    console.log('Clearing existing database collections...');
    await User.deleteMany({});
    await Candidate.deleteMany({});
    await Job.deleteMany({});
    console.log('Collections cleared.');

    // 1. Create Default Users
    console.log('Creating default user accounts...');
    const defaultPassword = 'password123';

    const admin = await User.create({
      name: 'Rajesh Kumar (Admin)',
      email: 'admin@example.com',
      password: defaultPassword,
      role: 'admin',
    });

    const recruiter = await User.create({
      name: 'Sunita Sharma (Recruiter)',
      email: 'recruiter@example.com',
      password: defaultPassword,
      role: 'recruiter',
    });

    const employer = await User.create({
      name: 'Rahul Verma (Employer)',
      email: 'employer@example.com',
      password: defaultPassword,
      role: 'employer',
    });

    const jobSeeker = await User.create({
      name: 'Amit Patel (Jobseeker)',
      email: 'seeker@example.com',
      password: defaultPassword,
      role: 'job_seeker',
    });

    console.log('Users created successfully:');
    console.log(`- Admin: admin@example.com (password123)`);
    console.log(`- Recruiter: recruiter@example.com (password123)`);
    console.log(`- Employer: employer@example.com (password123)`);
    console.log(`- Jobseeker: seeker@example.com (password123)`);

    // 2. Create Indian Candidate Records (Created by Admin or Recruiter)
    console.log('Seeding candidate records...');
    const candidates = [
      {
        name: 'Aarav Sharma',
        email: 'aarav.sharma@gmail.com',
        phone: '+91 98765 43210',
        experience: 4,
        skills: ['React', 'Node.js', 'MongoDB', 'Redux', 'JavaScript'],
        resumeUrl: 'https://example.com/resumes/aarav_sharma.pdf',
        status: 'hired',
        createdBy: recruiter._id,
      },
      {
        name: 'Priya Patel',
        email: 'priya.patel@yahoo.com',
        phone: '+91 87654 32109',
        experience: 2,
        skills: ['Figma', 'UI/UX Design', 'CSS', 'HTML', 'Tailwind CSS'],
        resumeUrl: 'https://example.com/resumes/priya_patel.pdf',
        status: 'shortlisted',
        createdBy: recruiter._id,
      },
      {
        name: 'Rohan Gupta',
        email: 'rohan.gupta@gmail.com',
        phone: '+91 76543 21098',
        experience: 0,
        skills: ['Python', 'SQL', 'Java', 'Data Structures'],
        resumeUrl: 'https://example.com/resumes/rohan_gupta.pdf',
        status: 'applied',
        createdBy: admin._id,
      },
      {
        name: 'Ananya Iyer',
        email: 'ananya.iyer@outlook.com',
        phone: '+91 65432 10987',
        experience: 6,
        skills: ['Express', 'Node.js', 'MongoDB', 'React', 'TypeScript', 'AWS'],
        resumeUrl: 'https://example.com/resumes/ananya_iyer.pdf',
        status: 'shortlisted',
        createdBy: recruiter._id,
      },
      {
        name: 'Vikram Singh',
        email: 'vikram.singh@gmail.com',
        phone: '+91 91234 56789',
        experience: 8,
        skills: ['Kubernetes', 'Docker', 'AWS', 'Terraform', 'CI/CD', 'Jenkins'],
        resumeUrl: 'https://example.com/resumes/vikram_singh.pdf',
        status: 'hired',
        createdBy: admin._id,
      },
      {
        name: 'Sneha Reddy',
        email: 'sneha.reddy@gmail.com',
        phone: '+91 82345 67890',
        experience: 3,
        skills: ['Python', 'Django', 'PostgreSQL', 'REST APIs'],
        resumeUrl: 'https://example.com/resumes/sneha_reddy.pdf',
        status: 'rejected',
        createdBy: recruiter._id,
      },
      {
        name: 'Arjun Mehta',
        email: 'arjun.mehta@gmail.com',
        phone: '+91 73456 78901',
        experience: 1,
        skills: ['Angular', 'JavaScript', 'CSS', 'Bootstrap'],
        resumeUrl: 'https://example.com/resumes/arjun_mehta.pdf',
        status: 'applied',
        createdBy: recruiter._id,
      },
      {
        name: 'Kavita Krishnan',
        email: 'kavita.k@gmail.com',
        phone: '+91 94567 89012',
        experience: 5,
        skills: ['Manual Testing', 'Selenium', 'Automation', 'Jira'],
        resumeUrl: 'https://example.com/resumes/kavita_k.pdf',
        status: 'applied',
        createdBy: admin._id,
      },
    ];

    await Candidate.insertMany(candidates);
    console.log(`Seeded ${candidates.length} candidate profiles.`);

    // 3. Create Sample Job Openings (Created by Employer)
    console.log('Seeding job openings...');
    const jobs = [
      {
        title: 'Senior MERN Stack Developer',
        description: 'Looking for a highly skilled full stack developer to lead our web application projects using MongoDB, Express, React, and Node.js.',
        requirements: 'Minimum 5+ years of software design, development and maintenance experiences.',
        company: 'Tech Mahindra',
        location: 'Bangalore, Karnataka',
        salary: '12,00,000 - 18,00,000 INR',
        type: 'Full-time',
        skills: ['react', 'node', 'mongodb', 'express', 'aws'],
        industry: 'IT Services',
        employer: employer._id,
      },
      {
        title: 'Junior UI Engineer (React)',
        description: 'Entry level front end developer role focused on building responsive and beautiful pixel-perfect browser layouts using React and Tailwind CSS.',
        requirements: 'Solid grasp of HTML, CSS, JavaScript, ES6 features, and React components state handling.',
        company: 'Wipro Technologies',
        location: 'Pune, Maharashtra',
        salary: '4,50,000 - 6,00,000 INR',
        type: 'Full-time',
        skills: ['react', 'javascript', 'css', 'tailwind'],
        industry: 'IT Services',
        employer: employer._id,
      },
      {
        title: 'Cloud DevOps Engineer',
        description: 'Join our infrastructure operations team to build scalable CI/CD automation and container deployments in production environments.',
        requirements: 'Experience managing docker instances, Kubernetes pods, and AWS clouds.',
        company: 'Infosys Limited',
        location: 'Hyderabad, Telangana',
        salary: '14,00,000 - 20,00,000 INR',
        type: 'Full-time',
        skills: ['docker', 'kubernetes', 'aws', 'jenkins', 'git'],
        industry: 'Software Consulting',
        employer: employer._id,
      },
    ];

    await Job.insertMany(jobs);
    console.log(`Seeded ${jobs.length} job postings.`);

    console.log('Database seeding completed successfully! 🎉');
    process.exit(0);
  } catch (err) {
    console.error('Seeding process encountered an error:', err);
    process.exit(1);
  }
};

seedDatabase();
