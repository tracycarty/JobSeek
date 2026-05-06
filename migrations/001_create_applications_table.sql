-- JobSeek Applications Migration
-- Creates the applications table for job applications feature

CREATE TABLE IF NOT EXISTS applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  applicantId INT NOT NULL,
  jobId INT NOT NULL,
  status ENUM('PENDING', 'ACCEPTED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
  appliedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  resumePath VARCHAR(255) NOT NULL,
  coverLetterPath VARCHAR(255),
  fullName VARCHAR(255) NOT NULL,
  address VARCHAR(255) NOT NULL,
  age INT NOT NULL,
  phoneNumber VARCHAR(50) NOT NULL,

  CONSTRAINT fk_applications_applicant FOREIGN KEY (applicantId)
    REFERENCES users(id) ON DELETE CASCADE,

  CONSTRAINT fk_applications_job FOREIGN KEY (jobId)
    REFERENCES jobs(id) ON DELETE CASCADE,

  UNIQUE KEY unique_application (applicantId, jobId),
  INDEX idx_applicant_id (applicantId),
  INDEX idx_job_id (jobId),
  INDEX idx_status (status)
);
