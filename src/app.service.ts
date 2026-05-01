import { Injectable } from '@nestjs/common';
import { createHash, randomUUID } from 'crypto';

export type Role = 'applicant' | 'employee' | 'admin';

interface User {
  id: number;
  email: string;
  passwordHash: string;
  role: Role;
  created_at: string;
}

export interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  salary: string | null;
  description: string;
  created_at: string;
}

@Injectable()
export class AppService {
  private readonly users: User[] = [
    {
      id: 1,
      email: 'admin@jobseek.com',
      passwordHash: this.hashPassword('admin123'),
      role: 'admin',
      created_at: new Date('2026-04-30T12:00:00.000Z').toISOString(),
    },
  ];

  private readonly jobs: Job[] = [
    {
      id: 1,
      title: 'Software Developer',
      company: 'Tech Corp',
      location: 'Cagayan de Oro',
      salary: 'PHP 30,000',
      description:
        'Build and maintain web applications with a small product team focused on reliable hiring tools.',
      created_at: new Date('2026-04-30T12:00:00.000Z').toISOString(),
    },
    {
      id: 2,
      title: 'Customer Support Specialist',
      company: 'Northstar Careers',
      location: 'Remote',
      salary: 'PHP 24,000',
      description:
        'Help applicants and employers resolve account, posting, and interview scheduling questions.',
      created_at: new Date('2026-04-29T09:30:00.000Z').toISOString(),
    },
    {
      id: 3,
      title: 'Junior QA Tester',
      company: 'BrightByte',
      location: 'Davao City',
      salary: 'PHP 22,000',
      description:
        'Test new releases, write clear bug reports, and support regression checks before launch.',
      created_at: new Date('2026-04-28T08:15:00.000Z').toISOString(),
    },
  ];

  getHello(): string {
    return 'Hello World!';
  }

  register(email: string, password: string) {
    this.validateAuthInput(email, password);

    const normalizedEmail = email.trim().toLowerCase();
    if (this.users.some((user) => user.email === normalizedEmail)) {
      const error = new Error('Email already exists');
      error.name = 'Conflict';
      throw error;
    }

    const user: User = {
      id: this.users.length + 1,
      email: normalizedEmail,
      passwordHash: this.hashPassword(password),
      role: 'applicant',
      created_at: new Date().toISOString(),
    };

    this.users.push(user);

    return this.toPublicUser(user);
  }

  login(email: string, password: string) {
    this.validateAuthInput(email, password);

    const normalizedEmail = email.trim().toLowerCase();
    const user = this.users.find(
      (candidate) => candidate.email === normalizedEmail,
    );

    if (!user || user.passwordHash !== this.hashPassword(password)) {
      const error = new Error('Invalid credentials');
      error.name = 'Unauthorized';
      throw error;
    }

    return {
      access_token: `jobseek-${randomUUID()}`,
      user: this.toPublicUser(user),
      redirectTo: user.role === 'applicant' ? '/index.html' : '/',
    };
  }

  listJobs(page = 1, limit = 10, query?: string) {
    const safePage = Math.max(1, Math.floor(page) || 1);
    const safeLimit = Math.max(1, Math.min(50, Math.floor(limit) || 10));
    const normalizedQuery = query?.trim().toLowerCase();
    const filteredJobs = normalizedQuery
      ? this.jobs.filter((job) =>
          [job.title, job.company, job.location].some((field) =>
            field.toLowerCase().includes(normalizedQuery),
          ),
        )
      : this.jobs;
    const start = (safePage - 1) * safeLimit;
    const data = filteredJobs.slice(start, start + safeLimit);

    return {
      data,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total: filteredJobs.length,
        totalPages: Math.ceil(filteredJobs.length / safeLimit),
      },
    };
  }

  getJob(id: number) {
    return this.jobs.find((job) => job.id === id);
  }

  getLoginPage(): string {
    return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Login | JobSeek</title>
  <style>${this.getStyles()}</style>
</head>
<body class="auth-page">
  <main class="auth-shell">
    <section class="panel">
      <form id="loginForm" class="auth-form">
        <h1>JobSeek</h1>
        <label>Email <input type="email" id="email" placeholder="Email" required></label>
        <label>Password <input type="password" id="password" placeholder="Password" required minlength="6"></label>
        <button type="submit">Login</button>
        <p id="error" class="error" role="alert"></p>
      </form>
      <a class="secondary-action" href="/index.html" id="browseJobsLink">Browse Jobs</a>
      <p class="muted">No account yet? <a href="/register.html">Register</a></p>
    </section>
  </main>
  <script>
    document.getElementById("browseJobsLink").addEventListener("click", (event) => {
      event.preventDefault();
      window.location.assign("/index.html");
    });

    document.getElementById("loginForm").addEventListener("submit", async (event) => {
      event.preventDefault();
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;
      const error = document.getElementById("error");
      error.innerText = "";

      const response = await fetch("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();

      if (!response.ok) {
        error.innerText = data.message || "Login failed";
        return;
      }

      localStorage.setItem("token", data.access_token);
      localStorage.setItem("role", data.user.role);
      window.location.href = data.user.role === "applicant" ? "/index.html" : (data.redirectTo || "/");
    });
  </script>
</body>
</html>`;
  }

  getRegisterPage(): string {
    return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Register | JobSeek</title>
  <style>${this.getStyles()}</style>
</head>
<body class="auth-page">
  <main class="auth-shell">
    <form id="registerForm" class="panel">
      <h1>Create Account</h1>
      <label>Email <input type="email" id="email" placeholder="Email" required></label>
      <label>Password <input type="password" id="password" placeholder="Password" required minlength="6"></label>
      <button type="submit">Create Account</button>
      <p id="error" class="error" role="alert"></p>
      <p class="muted">Already registered? <a href="/login.html">Login</a></p>
    </form>
  </main>
  <script>
    document.getElementById("registerForm").addEventListener("submit", async (event) => {
      event.preventDefault();
      const response = await fetch("/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: document.getElementById("email").value,
          password: document.getElementById("password").value
        })
      });

      if (response.ok) {
        window.location.href = "/login.html";
        return;
      }

      const data = await response.json();
      document.getElementById("error").innerText = data.message || "Registration failed";
    });
  </script>
</body>
</html>`;
  }

  getJobsPage(): string {
    return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Browse Jobs | JobSeek</title>
  <style>${this.getStyles()}</style>
</head>
<body>
  <header class="site-header">
    <div>
      <p class="eyebrow">Applicant jobs</p>
      <h1>Browse Jobs</h1>
    </div>
    <form id="searchForm" class="search">
      <input name="q" id="q" placeholder="Search jobs..." autocomplete="off">
      <button>Search</button>
    </form>
  </header>
  <main id="job-list" class="job-list" aria-live="polite">Loading jobs...</main>
  <footer id="pagination" class="pagination"></footer>
  <script>
    const params = new URLSearchParams(window.location.search);
    const page = Number(params.get("page") || "1");
    const q = params.get("q") || "";
    document.getElementById("q").value = q;

    document.getElementById("searchForm").addEventListener("submit", (event) => {
      event.preventDefault();
      const next = new URLSearchParams();
      const value = document.getElementById("q").value.trim();
      if (value) next.set("q", value);
      window.location.href = "/index.html" + (next.toString() ? "?" + next.toString() : "");
    });

    async function loadJobs() {
      const endpoint = q
        ? "/ui/jobs/search?q=" + encodeURIComponent(q) + "&page=" + page
        : "/ui/jobs?page=" + page;
      const list = document.getElementById("job-list");

      try {
        const response = await fetch(endpoint);
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || "Unable to load jobs");
        if (!result.data.length) {
          list.innerHTML = '<p class="empty">No jobs found</p>';
          document.getElementById("pagination").innerHTML = "";
          return;
        }

        list.innerHTML = result.data.map((job) => \`
          <article class="job-card">
            <h2>\${job.title}</h2>
            <p>\${job.company} - \${job.location}</p>
            <strong>\${job.salary || "Salary not listed"}</strong>
            <a href="/job.html?id=\${job.id}">View Details</a>
          </article>
        \`).join("");

        const pagination = result.pagination;
        const footer = document.getElementById("pagination");
        footer.innerHTML = "";
        if (pagination.page > 1) footer.appendChild(pageLink("Previous", pagination.page - 1));
        if (pagination.page < pagination.totalPages) footer.appendChild(pageLink("Next", pagination.page + 1));
      } catch (error) {
        list.innerHTML = '<p class="error">' + error.message + '</p>';
      }
    }

    function pageLink(label, targetPage) {
      const link = document.createElement("a");
      const next = new URLSearchParams(window.location.search);
      next.set("page", targetPage);
      link.href = "/index.html?" + next.toString();
      link.textContent = label;
      return link;
    }

    loadJobs();
  </script>
</body>
</html>`;
  }

  getJobPage(): string {
    return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Job Details | JobSeek</title>
  <style>${this.getStyles()}</style>
</head>
<body>
  <main class="detail-shell">
    <a href="/index.html">Back</a>
    <article id="job" class="panel">Loading job...</article>
  </main>
  <script>
    async function loadJob() {
      const id = new URLSearchParams(window.location.search).get("id");
      const article = document.getElementById("job");
      if (!id) {
        article.innerHTML = '<p class="error">Job ID is required</p>';
        return;
      }

      const response = await fetch("/ui/jobs/" + encodeURIComponent(id));
      const job = await response.json();
      if (!response.ok) {
        article.innerHTML = '<p class="error">' + (job.message || "Job not found") + '</p>';
        return;
      }

      article.innerHTML = \`
        <h1>\${job.title}</h1>
        <p>\${job.company} - \${job.location}</p>
        <strong>\${job.salary || "Salary not listed"}</strong>
        <section>
          <h2>Description</h2>
          <p>\${job.description}</p>
        </section>
      \`;
    }
    loadJob();
  </script>
</body>
</html>`;
  }

  private validateAuthInput(email: string, password: string) {
    const hasValidEmail =
      typeof email === 'string' && /\S+@\S+\.\S+/.test(email);
    const hasValidPassword =
      typeof password === 'string' && password.length >= 6;

    if (!hasValidEmail || !hasValidPassword) {
      const error = new Error(
        'Valid email and password of at least 6 characters are required',
      );
      error.name = 'BadRequest';
      throw error;
    }
  }

  private hashPassword(password: string): string {
    return createHash('sha256').update(password).digest('hex');
  }

  private toPublicUser(user: User) {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };
  }

  private getStyles(): string {
    return `
      * { box-sizing: border-box; }
      body { margin: 0; background: #f6f7f9; color: #17202a; font-family: Arial, sans-serif; }
      a { color: #0f766e; font-weight: 700; }
      input, button { min-height: 44px; border-radius: 6px; font: inherit; }
      input { width: 100%; border: 1px solid #c9d2dc; padding: 0 12px; }
      button { border: 0; background: #0f766e; color: white; padding: 0 18px; font-weight: 700; cursor: pointer; }
      .secondary-action { min-height: 44px; border: 1px solid #0f766e; border-radius: 6px; display: inline-grid; place-items: center; padding: 0 18px; text-decoration: none; }
      .auth-page { min-height: 100vh; display: grid; place-items: center; padding: 24px; }
      .auth-shell, .detail-shell { width: min(100%, 760px); margin: 40px auto; padding: 0 20px; }
      .panel, .job-card { background: white; border: 1px solid #dfe5eb; border-radius: 8px; padding: 24px; box-shadow: 0 10px 30px rgba(23, 32, 42, 0.06); }
      .panel, .auth-form { display: grid; gap: 16px; }
      .muted, .eyebrow { color: #667085; }
      .error { color: #b42318; font-weight: 700; }
      .empty { color: #667085; }
      .site-header { display: flex; gap: 20px; align-items: end; justify-content: space-between; padding: 32px 20px; max-width: 1000px; margin: 0 auto; }
      .site-header h1, .panel h1 { margin: 0; }
      .eyebrow { margin: 0 0 6px; text-transform: uppercase; font-size: 12px; font-weight: 700; letter-spacing: 0; }
      .search { display: flex; gap: 8px; width: min(100%, 440px); }
      .job-list { display: grid; gap: 16px; max-width: 1000px; margin: 0 auto; padding: 0 20px 24px; }
      .job-card { display: grid; gap: 8px; }
      .job-card h2 { margin: 0; font-size: 20px; }
      .job-card p { margin: 0; color: #4a5563; }
      .pagination { display: flex; gap: 12px; max-width: 1000px; margin: 0 auto 40px; padding: 0 20px; }
      @media (max-width: 720px) {
        .site-header, .search { display: grid; }
      }
    `;
  }
}
