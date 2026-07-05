# Recruitment & Candidate Management Platform Backend

A production-ready Node.js, Express, and MongoDB backend supporting authentication, job listings, application management, candidates dashboard, bulk CSV importing, structured logging, and transactional email notifications.

---

## 📂 Project Structure

The project is organized into modular directory structures inside the `server/` directory:

```
server/
├── config/             # Database and email configurations
│   ├── db.js           # Mongoose MongoDB connection
│   └── mail.config.js  # Nodemailer SMTP transporter (with dry-run fallback)
├── controllers/        # Request handlers
│   ├── applicationController.js
│   ├── candidate.controller.js
│   ├── candidateImport.controller.js
│   ├── jobController.js
│   └── userController.js
├── middlewares/        # Express custom middlewares
│   ├── auth.js         # JWT validation & RBAC (Role-Based Access Control)
│   ├── error.js        # Global error translation & stack trace hides
│   ├── logging.js      # Request/response logger with requestId tracking
│   ├── multer.js       # Cloudinary file upload filter
│   └── rateLimiter.js  # API request rate limits
├── models/             # Mongoose schemas
│   ├── application.js
│   ├── candidate.js
│   ├── job.js
│   └── user.js
├── routes/             # Route declarations
│   ├── applicationroute.js
│   ├── candidate.routes.js
│   ├── candidateImport.routes.js
│   ├── jobroute.js
│   └── userRoute.js
├── services/           # Business logic layer
│   ├── candidate.service.js
│   ├── candidateImport.service.js
│   ├── email.service.js
│   └── emailTemplates.js
├── utils/              # Utility helpers
│   ├── appError.js     # Custom operational AppError class
│   └── logger.js       # Winston structured logger config
├── server.js           # Main entry point & app initialization
└── package.json        # Dependencies & start scripts
```

---

## 🛠️ Tech Stack & Key Dependencies

- **Runtime Environment**: Node.js (Express 5.x)
- **Database**: MongoDB Atlas via Mongoose (ODM)
- **Authentication**: JWT (JsonWebToken) & BcryptJS (Password hashing)
- **Logging**: Winston Structured Logger
- **Files & Uploads**: Multer & Cloudinary Storage
- **Emails**: Nodemailer (HTML templated triggers)
- **Security & Hardening**:
  - `helmet`: Sets HTTP security headers.
  - `express-rate-limit`: Prevents DDoS and brute-force attacks.
  - `express-mongo-sanitize`: Sanitizes request parameters against NoSQL injections.
  - `xss` sanitization: Strips malicious scripts and raw HTML tags.

---

## 🔑 Database Schema Specifications

### 1. User Model (`User`)
- `name`: (String, required)
- `email`: (String, required, unique, lowercase)
- `password`: (String, required, hashed via bcrypt)
- `role`: (String enum: `['job_seeker', 'employer', 'admin', 'recruiter']`, required)
- `timestamps`: Enabled

### 2. Job Model (`Job`)
- `title`: (String, required, text-indexed)
- `description`: (String, required, text-indexed)
- `requirements`: (String)
- `company`: (String, required, text-indexed)
- `location`: (String, text-indexed)
- `salary`: (String)
- `type`: (String) e.g., Full-time, Contract
- `skills`: (Array of Strings, index-optimized)
- `industry`: (String, index-optimized)
- `employer`: (ObjectId ref `User`, required)
- `createdAt`: Date default

### 3. Application Model (`Application`)
- `job`: (ObjectId ref `Job`, required)
- `applicant`: (ObjectId ref `User`, required)
- `coverLetter`: (String)
- `resumeUrl`: (String)
- `resumePublicId`: (String)
- `status`: (String enum: `['applied', 'reviewed', 'accepted', 'rejected']`, default: `applied`)
- `timestamps`: Enabled
- *Constraint*: Compound unique index on `job` + `applicant` (prevents double applications).

### 4. Candidate Model (`Candidate`)
- `name`: (String, required)
- `email`: (String, required, unique, lowercase)
- `phone`: (String)
- `experience`: (Number, minimum 0)
- `skills`: (Array of Strings)
- `resumeUrl`: (String)
- `status`: (String enum: `['applied', 'shortlisted', 'rejected', 'hired']`, default: `applied`)
- `createdBy`: (ObjectId ref `User`, required)
- `timestamps`: Enabled

---

## ⚡ API Endpoints

### 🔐 Authentication (`/api/users`)
- `POST /register` &rarr; Register a user.
- `POST /login` &rarr; Authenticate a user and retrieve a JWT token.

### 💼 Jobs (`/api/jobs`)
- `POST /` &rarr; Create job posting *(Employer only)*.
- `GET /` &rarr; Query jobs with full-text search, pagination, and location/industry/skills filtering.
- `GET /:id` &rarr; Fetch single job posting.
- `PUT /:id` &rarr; Edit job details *(Employer owner only)*.
- `DELETE /:id` &rarr; Delete job posting *(Employer owner only)*.

### 📄 Job Applications (`/api/applications`)
- `POST /:jobId` &rarr; Apply to job with multipart form-data (coverLetter + resume file).
- `DELETE /:applicationId` &rarr; Withdraw application.
- `GET /me` &rarr; Retrieve applications submitted by currently authenticated jobseeker.
- `GET /job/:jobId` &rarr; Retrieve all applications for a job posting *(Employer owner only)*.
- `PATCH /:applicationId` &rarr; Update application status *(Employer owner only)*.

### 👥 Candidates (`/api/candidates`)
- `POST /` &rarr; Create a candidate profile *(Admin & Recruiter only)*.
- `GET /` &rarr; Query candidates with advanced features *(All authenticated users)*:
  - Text search: `?q=searchterm` (scans name, email, skills)
  - Experience filters: `?minExp=2&maxExp=5`
  - Status filter: `?status=shortlisted`
  - Sorting: `?sortBy=experience&sortOrder=asc` (default: `createdAt` desc)
  - Pagination: `?page=1&limit=10`
- `GET /:id` &rarr; Retrieve candidate by ID *(All authenticated users)*.
- `PUT /:id` &rarr; Update candidate details *(Admin & Recruiter only)*.
- `DELETE /:id` &rarr; Delete candidate *(Admin only)*.

### 📥 Candidate CSV Bulk Import (`/api/candidates/import`)
- `POST /` &rarr; Accepts CSV file upload (`multipart/form-data`) under key `file` *(Admin only)*.
  - Streaming parser processes files line-by-line without high memory consumption.
  - Performs row validation, Batch deduplication, and database deduplication.
  - Dispatches an asynchronous transactional summary email to the importing Admin.

### 🩺 System Diagnostics
- `GET /health` &rarr; Returns server status, runtime environment, database connection state, and current server time.

---

## 🔒 Hardening & Security Implementations

1. **Helmet Headers**: Injected custom headers to prevent scripting vulnerabilities.
2. **NoSQL Injection Guard**: Custom middleware intercepts body and parameter objects, sanitizing keys starting with `$` or containing `.`.
3. **XSS Protection**: Cleans values in incoming payloads by escaping HTML control sequences (`<`, `>`, `"`, `'`, `/`).
4. **Rate Limiting**:
   - Global rate limiter: Max 100 requests per 15 minutes.
   - Authentication routes rate limiter: Max 20 requests per 15 minutes.
   - CSV Import rate limiter: Max 5 imports per hour.
5. **Graceful Shutdown**: Intercepts `SIGINT`/`SIGTERM` signals, closes the HTTP port to block new traffic, closes active Mongoose connections safely, and exits without leaving active server ports locked.

---

## 📧 Asynchronous Notifications (Transactional Mailer)
- Nodemailer is configured to send fire-and-forget HTML emails without delaying HTTP responses.
- **Dry-run Mode**: If SMTP variables are missing from `.env`, the system defaults to a mock dry-run logger. This prints parsed mail configurations to the terminal console during development.
- **Templates**:
  - `candidateCreatedTemplate`: Confirms receipt of application details to the candidate.
  - `candidateStatusUpdatedTemplate`: Notifies the candidate if their hiring status transitions (e.g., Shortlisted, Hired).
  - `csvImportSummaryTemplate`: Dispatches a formatted table summary of successful/failed rows to the Admin who uploaded the CSV file.

---

## 🚀 Setting Up the Application

### 1. Prerequisite Variables
Create a `.env` file in the `server` directory matching this configuration:

```env
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_signing_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
PORT=5000

# SMTP Configuration (Leave empty to trigger development console dry-run fallback)
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
SMTP_FROM_EMAIL="Recruitment Platform" <no-reply@recruitment.com>
```

### 2. Install & Launch
Run these commands from the `server` folder:

```bash
# Install dependencies
npm install

# Start development server (nodemon)
npm run dev

# Start production server
npm start
```
