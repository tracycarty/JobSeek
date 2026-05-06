# JobSeek — Job Application Feature Spec

**Feature Name:** Job Application  
**App Name:** JobSeek  
**Spec Path:** specs/job-application.md  
**Status:** FOR REVIEW  

---

# 1. Goal

Enable applicants to submit job applications with uploaded documents (resume and optional cover letter), and allow employers to review and manage those applications.

---

# 2. Scope

## Applicant Side
- Apply to a job using file uploads
- View application history and status
- Prevent duplicate applications

## Employer Side
- View applications for their jobs
- Accept or reject applicants

---

# 3. Architecture

- **Database:** MySQL  
- **Backend:** NestJS  
- **Frontend:** HTML + JavaScript (multipart/form-data)  
- **Storage:** Local disk (/uploads/...)  
- **Auth:** JWT  

---

# 4. Implementation Tasks

---

# Phase 1: Backend Foundation

## Task 1.1: Create Application Entity
**File:** src/applications/application.entity.ts

**Fields:**
- id (CHAR(36), UUID)
- applicantId (FK → users.id)
- jobId (FK → jobs.id)
- status (ENUM: PENDING, ACCEPTED, REJECTED)
- appliedAt (DATETIME)
- resumePath (string, required)
- coverLetterPath (string, optional)

---

## Task 1.2: Database Migration

```sql
CREATE TABLE applications (
  id CHAR(36) PRIMARY KEY,
  applicant_id CHAR(36) NOT NULL,
  job_id CHAR(36) NOT NULL,
  status ENUM('PENDING', 'ACCEPTED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
  applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  resume_path VARCHAR(255) NOT NULL,
  cover_letter_path VARCHAR(255),

  CONSTRAINT fk_applicant FOREIGN KEY (applicant_id)
    REFERENCES users(id) ON DELETE CASCADE,

  CONSTRAINT fk_job FOREIGN KEY (job_id)
    REFERENCES jobs(id) ON DELETE CASCADE,

  UNIQUE KEY unique_application (applicant_id, job_id),
  INDEX idx_applicant_id (applicant_id),
  INDEX idx_job_id (job_id)
);
Phase 2: Service Layer
Task 2.1: Create DTO

File: src/applications/dto/create-application.dto.ts

import { IsUUID } from 'class-validator';

export class CreateApplicationDto {
  @IsUUID()
  jobId: string;
}
Task 2.2: Create Application Service

File: src/applications/application.service.ts

Methods:

apply(userId, dto, files)
getApplications(jobId, userId)
getUserApplications(userId)
updateStatus(applicationId, status, userId)
saveUploadedFile(file, type)
File Upload Rules
Resume → required
Cover letter → optional
Max size → 5MB
Allowed types:
PDF
DOC
DOCX
File Storage
Type	Path
Resume	/uploads/resumes/
Cover Letter	/uploads/cover-letters/
File Saving Logic
async saveUploadedFile(file: Express.Multer.File, type: 'resume' | 'cover'): Promise<string> {
  const ext = file.originalname.split('.').pop();
  const filename = `${uuidv4()}.${ext}`;

  const path = type === 'resume'
    ? `uploads/resumes/${filename}`
    : `uploads/cover-letters/${filename}`;

  await fs.promises.writeFile(path, file.buffer);

  return path;
}
Validation Rules
Job must exist
User must exist
Prevent duplicate applications
Resume file must be provided
Handle MySQL duplicate error (ER_DUP_ENTRY)
Phase 3: REST API
Task 3.1: Create Application Controller

File: src/applications/application.controller.ts

Routes
Apply to Job

POST /applications

Auth: JWT
Content-Type: multipart/form-data

Fields:

jobId
resume (required file)
coverLetter (optional file)
Get Current User Applications

GET /applications/me

Get Applications per Job (Employer Only)

GET /jobs/:jobId/applications?page=1&limit=10

Note: Must verify employer owns the job

Update Application Status

PATCH /applications/:id/status

{
  "status": "ACCEPTED"
}
Error Handling
400 → Invalid file
401 → Unauthorized
403 → Forbidden
404 → Not found
409 → Duplicate application
Phase 4: Frontend UI
Task 4.1: Apply Form

File: frontend/applicants/job-detail.html

<form id="applyForm" enctype="multipart/form-data">
  <input type="file" name="resume" required />
  <input type="file" name="coverLetter" />
  <button type="submit">Apply</button>
</form>
JavaScript Submission
const formData = new FormData();
formData.append('jobId', jobId);
formData.append('resume', resumeFile);

if (coverLetterFile) {
  formData.append('coverLetter', coverLetterFile);
}

fetch('/applications', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`
  },
  body: formData
});
UX Behavior
Disable apply button if already applied
Show “Applied ✓” after submission
Display success/error messages
Phase 5: Integration & Testing
Test Cases
Successful application
Duplicate prevention
Missing resume rejection
Invalid file rejection
Employer views applications
Employer updates status
Unauthorized access blocked
5. Status Values
PENDING
ACCEPTED
REJECTED
6. Constraints
Unique (applicant_id, job_id)
Foreign key cascade delete
7. Key Decisions
MySQL ENUM for status
File upload (no URL-based submission)
Local disk storage
UUID stored as CHAR(36)
JWT authentication
8. Success Criteria
Users can upload and submit applications
Resume is required and validated
Duplicate applications prevented
Employers can view and manage applications
Secure role-based access control
Clear UI feedback
No data leaks between users