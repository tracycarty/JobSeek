# JobSeek — Employer Job Posting Spec

**Feature Name:** Employer Job Posting  
**App Name:** JobSeek  
**Spec Path:** specs/employer-job-posting.md  

---

# 1. Goal

Provide employers with the ability to create, manage, and publish job listings through a REST API and a simple web interface, enabling jobs to appear in the applicant job browsing feature.

---

# 2. Scope

* Create new job listings via API  
* Retrieve employer-specific job listings  
* Update job details  
* Delete job listings  
* Control job visibility (Open / Closed)  
* Ensure jobs are linked to authenticated employers  

---

# 3. Non-Goals

* No job application functionality  
* No applicant tracking system  
* No admin moderation  
* No analytics or reporting  
* No file/image uploads  
* No frontend frameworks (React, Vue, Angular)  

---

# 4. Requirements

## Backend

* **REQ_001:** POST `/jobs` creates a new job  
* **REQ_002:** Job must be associated with authenticated employer  
* **REQ_003:** GET `/jobs/employer` returns jobs owned by employer  
* **REQ_004:** PUT `/jobs/:id` updates job details  
* **REQ_005:** DELETE `/jobs/:id` deletes a job  
* **REQ_006:** Only the job owner can update/delete the job  
* **REQ_007:** Job includes title, company, location, salary, description  
* **REQ_008:** Default job status is `Open`  
* **REQ_009:** Job status can be updated (Open / Closed)  
* **REQ_010:** Use MySQL via TypeORM  

## Frontend (Minimal / No Framework)

* **REQ_011:** Provide a form to create/edit job postings  
* **REQ_012:** Display list of employer’s jobs  
* **REQ_013:** Provide edit and delete controls  
* **REQ_014:** Show validation and error messages  
* **REQ_015:** Responsive layout using plain CSS  

---

# 5. API Contract

## POST /jobs

**Request:**
```json
{
  "title": "Software Developer",
  "company": "Tech Corp",
  "location": "Cagayan de Oro",
  "salary": "₱30,000",
  "description": "Develop web applications"
}

Response:

{
  "message": "Job created successfully",
  "jobId": 1
}
GET /jobs/employer

Response:

[
  {
    "id": 1,
    "title": "Software Developer",
    "status": "Open",
    "created_at": "2026-05-05T10:00:00.000Z"
  }
]
PUT /jobs/:id

Request:

{
  "title": "Updated Title",
  "location": "Remote",
  "status": "Closed"
}
DELETE /jobs/:id

Response:

{
  "message": "Job deleted successfully"
}
6. UI Design (No Framework)
6.1 Pages
1. Employer Dashboard (dashboard.html)
Button: "Post Job"
List of jobs
Edit/Delete actions
2. Job Form (job-form.html)
Input fields
Submit button
6.2 Layout Structure
Dashboard
<header>
  <h1>Employer Dashboard</h1>
  <a href="job-form.html">Post Job</a>
</header>

<main id="job-list"></main>
Job Form
<form id="job-form">
  <input name="title" required>
  <input name="company" required>
  <input name="location" required>
  <input name="salary">
  <textarea name="description" required></textarea>

  <button type="submit">Save Job</button>
</form>
7. Frontend Behavior (Vanilla JS)
Create Job Flow
Fill form
Submit via fetch() POST /jobs
Redirect to dashboard
Load Jobs
Call /jobs/employer
Render job list
Edit/Delete Flow
Edit → Load existing job data into form
Delete → Send DELETE request
Error Handling
Show validation errors
Show API error messages
8. CSS Design
Approach
Mobile-first design
Use Flexbox/Grid
Minimal and clean layout
9. Data Model
Job Entity
id (INT, PK)
employer_id (INT, FK)
title (VARCHAR)
company (VARCHAR)
location (VARCHAR)
salary (nullable)
description (TEXT)
status (Open / Closed)
created_at (TIMESTAMP)
10. Backend Design
Architecture
Controller → Service → Repository
Rules
Require authentication middleware
Extract employer ID from session/JWT
Validate ownership before update/delete
Use TypeORM repository pattern
11. Edge Cases
Unauthorized access
Editing non-owned job
Deleting non-existent job
Empty required fields
Invalid job ID
Invalid status value
Missing authentication
12. Acceptance Criteria
Employer can create a job
Employer can view their jobs
Employer can edit and delete jobs
Only job owner can modify job
Jobs marked Open appear in applicant browsing
API responses are correct
UI works without frontend frameworks
13. Folder Structure
/backend
  /src
    jobs/
    auth/

/frontend
  dashboard.html
  job-form.html
  styles.css
  script.js
14. Implementation Notes
Use DTOs for validation
Default status = Open
Use parameterized queries / ORM methods
Ensure compatibility with applicant browsing feature
Sanitize all inputs
15. Status

Status: ACCEPTED FOR IMPLEMENTATION