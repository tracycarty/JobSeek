# JobSeek — Applicant Job Browsing Spec

**Feature Name:** Applicant Job Browsing
**App Name:** JobSeek
**Spec Path:** specs/applicant-job-browsing.md

---

# 1. Goal

Provide applicants with the ability to browse, search, and view job listings through a web interface, enabling them to discover relevant job opportunities.

---

# 2. Scope

* Browse paginated job listings
* Search jobs by keywords
* View detailed job information
* Navigate between job listings and details
* Responsive web interface for job browsing

---

# 3. Non-Goals

* Job application functionality
* User accounts or profiles for applicants
* Job saving/bookmarking
* Advanced filtering (location, salary ranges)
* Job alerts or notifications
* Mobile app development

---

# 4. Requirements

## Frontend

* **REQ_001:** GET `/jobs` displays paginated job listings
* **REQ_002:** Job listings show title, company, location, and salary
* **REQ_003:** Search form allows keyword search via GET `/jobs/search?q={query}`
* **REQ_004:** Job detail page displays full job information
* **REQ_005:** Navigation between jobs list and job detail pages
* **REQ_006:** Responsive design for desktop and mobile
* **REQ_007:** Clean, professional UI with consistent styling

## Backend API

* **REQ_008:** GET `/jobs` returns paginated jobs (limit/offset or page-based)
* **REQ_009:** GET `/jobs/search?q={query}` returns filtered jobs
* **REQ_010:** GET `/jobs/:id` returns single job details
* **REQ_011:** Jobs include: id, title, company, location, salary, description, created_at
* **REQ_012:** Search matches title, company, and description fields
* **REQ_013:** Pagination supports limit and offset parameters
* **REQ_014:** Proper error handling for invalid requests

## Data

* **REQ_015:** Jobs stored in MySQL database via TypeORM
* **REQ_016:** Job entity includes all required fields
* **REQ_017:** Database seeded with sample job data

---

# 5. User Stories

* As an applicant, I want to see a list of available jobs so I can browse opportunities
* As an applicant, I want to search for jobs by keywords so I can find relevant positions
* As an applicant, I want to view detailed job information so I can learn about the role
* As an applicant, I want to navigate easily between job listings so I can explore multiple opportunities

---

# 6. Technical Notes

* Frontend: Vanilla HTML/CSS/JavaScript (no frameworks)
* Backend: NestJS with TypeORM and MySQL
* Authentication: Not required for browsing (public access)
* Pagination: Implement basic offset-based pagination
* Search: Simple text search across relevant fields 