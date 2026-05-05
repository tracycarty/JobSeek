# JobSeek — Login & Registration Feature Spec

**Feature Name:** Authentication (Login & Registration)
**Spec Path:** specs/login-registration.md

---

## 1. Goal

Provide a secure authentication system for JobSeek that allows users to register as **applicants**, log in, and access role-based data using JWT authentication.

---

## 2. Roles

The system supports three roles:

* **applicant** → default registered user (job seekers)
* **employee** → reserved for future expansion (company users)
* **admin** → seeded system administrator (not created via API)

---

## 3. Scope

### Included

* User registration
* User login
* Password hashing
* JWT authentication
* Role-based user structure
* Admin seeding

### Not Included

* Password reset
* Email verification
* OAuth (Google/Facebook)
* Role management UI
* Admin dashboard

---

## 4. Requirements

### Registration

* **REQ_001:** Users can register with email and password
* **REQ_002:** Default role is `applicant`
* **REQ_003:** Email must be unique
* **REQ_004:** Password must be hashed using bcrypt
* **REQ_005:** Invalid input returns 400

---

### Login

* **REQ_006:** Users can log in using email and password
* **REQ_007:** System validates credentials
* **REQ_008:** Successful login returns JWT token
* **REQ_009:** Login fails with 401 if credentials are invalid

---

### Admin

* **REQ_010:** Admin user is created via seed only
* **REQ_011:** Admin cannot be created via API
* **REQ_012:** Admin has role `admin`

---

## 5. API Contract

---

## POST /auth/register

Registers a new applicant user.

### Request:

```json id="r1a2b3"
{
  "email": "user@mail.com",
  "password": "123456"
}
```

### Response (201):

```json id="r1a2b4"
{
  "id": 1,
  "email": "user@mail.com",
  "role": "applicant"
}
```

### Errors:

* 400 → validation error
* 409 → email already exists

---

## POST /auth/login

Authenticates user and returns token.

### Request:

```json id="l1o2g3"
{
  "email": "user@mail.com",
  "password": "123456"
}
```

### Response (200):

```json id="l1o2g4"
{
  "access_token": "jwt_token_here",
  "user": {
    "id": 1,
    "email": "user@mail.com",
    "role": "applicant"
  }
}
```

### Errors:

* 401 → invalid credentials

---

## 6. Database Model

### User Entity

* id (Primary Key)
* email (VARCHAR, unique)
* password (VARCHAR, hashed)
* role (ENUM: applicant | employee | admin)
* created_at (TIMESTAMP)

---

## 7. Admin Seeding

Admin is created automatically during application setup.

### Default Admin:

```text id="a1d2m3"
email: admin@jobseek.com
password: admin123
role: admin
```

---

### Seeder Logic

```ts id="s1e2e3"
async function seedAdmin(userRepository) {
  const exists = await userRepository.findOne({
    where: { email: "admin@jobseek.com" }
  });

  if (!exists) {
    const hashed = await bcrypt.hash("admin123", 10);

    await userRepository.save({
      email: "admin@jobseek.com",
      password: hashed,
      role: "admin"
    });
  }
}
```

---

## 8. Backend Design (NestJS)

### Modules

* AuthModule
* UsersModule

### Services

* AuthService (login, register)
* UsersService (database operations)

### Security

* bcrypt for password hashing
* JWT for authentication
* environment-based secret key

---

## 9. Frontend Design (No Framework)

---

### 9.1 Login Page (`login.html`)

```html id="f1o2r3"
<form id="loginForm">
  <h2>Login</h2>

  <input type="email" id="email" placeholder="Email" required>
  <input type="password" id="password" placeholder="Password" required>

  <button type="submit">Login</button>

  <p id="error"></p>
</form>
```

---

### 9.2 Register Page (`register.html`)

```html id="f4r5g6"
<form id="registerForm">
  <h2>Register</h2>

  <input type="email" id="email" placeholder="Email" required>
  <input type="password" id="password" placeholder="Password" required>

  <button type="submit">Create Account</button>

  <p id="error"></p>
</form>
```

---

## 10. Frontend Behavior (Vanilla JS)

### Login Flow

```js id="j1s2t3"
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const res = await fetch("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();

  if (!res.ok) {
    document.getElementById("error").innerText = data.message;
    return;
  }

  localStorage.setItem("token", data.access_token);
  localStorage.setItem("role", data.user.role);

  window.location.href = "/index.html";
});
```

---

### Register Flow

```js id="j4r5g6"
document.getElementById("registerForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const res = await fetch("/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  if (res.ok) {
    window.location.href = "/login.html";
  } else {
    const data = await res.json();
    document.getElementById("error").innerText = data.message;
  }
});
```

---

## 11. Validation Rules

* Email must be valid format
* Password minimum 6 characters
* Email must be unique
* Role cannot be set via API

---

## 12. Security Rules

* Passwords must be hashed (bcrypt)
* Never return password in responses
* JWT must be used for authentication
* Admin account must never be exposed in frontend
* Role must be validated server-side

---

## 13. Edge Cases

* Duplicate email registration
* Invalid login credentials
* Missing fields
* Invalid email format
* Database connection failure

---

## 14. Acceptance Criteria

* User can register as applicant
* Login returns valid JWT token
* Admin is created via seed only
* Passwords are stored hashed
* Duplicate emails are rejected
* Invalid login returns 401
* Frontend works with plain HTML + JS

---

## 15. Status

**Status:** IMPLEMENTED
