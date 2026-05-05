# JobSeek — Employer Job Posting Spec

**Feature Name:** Employer Job Posting  
**App Name:** JobSeek  
**Spec Path:** specs/employer-job-posting.md  
**Spec Status:** Review / Not Ready for Development  

---

# 1. Goal

Provide authenticated employers with a dedicated landing page where they can post new job listings, review the status of existing postings, and manage jobs for applicant visibility.

---

# 2. Scope

* Employer login redirects to an employer dashboard landing page
* Create new job listings via API and UI  
* Retrieve employer-specific job listings  
* View job posting status for review (Open / Closed / Pending)  
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
* **REQ_009:** Job status can be updated (Open / Closed / Pending)  
* **REQ_010:** Use MySQL via TypeORM  

## Frontend (Minimal / No Framework)

* **REQ_011:** Employer login redirects to the employer dashboard landing page  
* **REQ_012:** Dashboard displays a clear "Post Job" action  
* **REQ_013:** Dashboard shows employer job posting statuses for review  
* **REQ_014:** Provide a form to create/edit job postings  
* **REQ_015:** Display list of employer’s jobs  
* **REQ_016:** Provide edit and delete controls  
* **REQ_017:** Show validation and error messages  
* **REQ_018:** Responsive layout using plain CSS  

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
  "description": "Develop web applications",
  "status": "Open"
}
```

**Response:**
```json
{
  "message": "Job created successfully",
  "jobId": 1
}
```

## GET /jobs/employer

**Response:**
```json
[
  {
    "id": 1,
    "title": "Software Developer",
    "status": "Open",
    "created_at": "2026-05-05T10:00:00.000Z"
  }
]
```

## PUT /jobs/:id

**Request:**
```json
{
  "title": "Updated Title",
  "location": "Remote",
  "status": "Closed"
}
```

## DELETE /jobs/:id

**Response:**
```json
{
  "message": "Job deleted successfully"
}
```

---

# 6. UI Design (No Framework)

## 6.1 Pages

1. Employer Dashboard (`dashboard.html`)
   * Visible after employer login
   * Uses the same clean card-based layout as the applicant jobs page
   * Includes a header with page title, employer landing message, and a prominent "Post Job" button
   * Displays employer job postings in a responsive grid with status badges and action controls
   * Includes a logout button styled like the applicant page
2. Job Form (`job-form.html`)
   * Create and edit job postings using a form with the same plain UI style
   * Fields: title, company, location, salary, description, status
   * Buttons styled consistently with applicant page controls
   * Shows validation and error messages in the same inline UI style

## 6.2 Layout Structure

**Dashboard**
```html
<div class="header">
  <h1>Employer Dashboard</h1>
  <div>
    <a class="primary-btn" href="job-form.html">Post Job</a>
    <button class="logout-btn" onclick="logout()">Logout</button>
  </div>
</div>
<div id="job-list"></div>
```

**Job Form**
```html
<form id="job-form">
  <input name="title" placeholder="Job Title" required>
  <input name="company" placeholder="Company" required>
  <input name="location" placeholder="Location" required>
  <input name="salary" placeholder="Salary">
  <textarea name="description" placeholder="Job Description" required></textarea>
  <select name="status">
    <option value="Open">Open</option>
    <option value="Closed">Closed</option>
    <option value="Pending">Pending</option>
  </select>
  <button type="submit">Save Job</button>
  <button type="button" onclick="cancel()">Cancel</button>
</form>
```

---

# 7. Frontend Behavior (Vanilla JS)

* On employer login, redirect to `dashboard.html`  
* Load employer jobs from `/jobs/employer`  
* Render jobs using the same responsive card grid style as the applicant page  
* Display visible status badges for each job card  
* "Post Job" navigates to `job-form.html`  
* Submit new job via `POST /jobs` and return to dashboard  
* Edit loads existing job data into the form  
* Delete sends `DELETE /jobs/:id` and refreshes the dashboard  
* Display API errors and form validation feedback inline using the same error presentation as the applicant page  

---

# 8. CSS Design

* Use the same color palette, spacing, and card styling as the applicant jobs page  
* Maintain the same responsive page width and centered container  
* Use a header panel with white background, rounded corners, and subtle shadow  
* Use button styles consistent with applicant search and logout buttons  
* Render job cards with matching box shadow, rounded corners, and hover lift effect  

---

# 9. Data Model

**Job Entity**
* `id` (INT, PK)  
* `employer_id` (INT, FK)  
* `title` (VARCHAR)  
* `company` (VARCHAR)  
* `location` (VARCHAR)  
* `salary` (nullable)  
* `description` (TEXT)  
* `status` (`Open` / `Closed` / `Pending`)  
* `created_at` (TIMESTAMP)  

---

# 10. Backend Design

* Architecture: Controller → Service → Repository  
* Require authentication middleware  
* Extract employer ID from session/JWT  
* Validate ownership before update/delete  
* Return employer-specific jobs for dashboard  
* Support status review values: `Open`, `Closed`, `Pending`  

---

# 11. Edge Cases

* Unauthorized access  
* Editing non-owned job  
* Deleting non-existent job  
* Empty required fields  
* Invalid job ID  
* Invalid status value  
* Missing authentication  

---

# 12. Acceptance Criteria

* Employer login redirects to the employer landing page/dashboard  
* Employer can post a new job from the dashboard  
* Employer can see posting statuses for review  
* Employer can edit and delete jobs  
* Only job owner can modify job  
* Jobs marked Open appear in applicant browsing  
* API responses are correct  
* UI works without frontend frameworks  

---

# 13. Folder Structure

```
/backend
  /src
    jobs/
    auth/

/frontend
  dashboard.html
  job-form.html
  styles.css
```

  script.js
14. Implementation Notes
Use DTOs for validation
Default status = Open
Use parameterized queries / ORM methods
Ensure compatibility with applicant browsing feature
Sanitize all inputs
15. Status

Status: ACCEPTED FOR IMPLEMENTATION