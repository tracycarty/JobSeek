CREATE DATABASE IF NOT EXISTS jobseek;
USE jobseek;

CREATE TABLE IF NOT EXISTS jobs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  company VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  salary VARCHAR(100) NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO jobs (title, company, location, salary, description, created_at) VALUES
('Software Developer', 'Tech Corp', 'Cagayan de Oro', 'PHP 30,000', 'Build and maintain web applications for growing business teams.', '2026-04-30 12:00:00'),
('Frontend Engineer', 'Pixel Works', 'Manila', 'PHP 45,000', 'Create responsive interfaces using semantic HTML, CSS, and JavaScript.', '2026-04-29 09:30:00'),
('Backend Developer', 'Data Harbor', 'Cebu', NULL, 'Develop REST APIs, manage database queries, and support production services.', '2026-04-28 15:15:00'),
('QA Analyst', 'BrightPath Solutions', 'Davao', 'PHP 28,000', 'Test releases, document issues, and work closely with engineering teams.', '2026-04-27 10:00:00'),
('IT Support Specialist', 'Northstar Logistics', 'Iloilo', 'PHP 25,000', 'Support users, troubleshoot hardware and software, and maintain documentation.', '2026-04-26 08:45:00');
