# JobSeek

JobSeek is a single NestJS project with a plain HTML frontend for applicant job browsing, employer job posting, and application tracking.

## Project structure

```text
job-seek/
  src/                NestJS backend
  frontend/           Static applicant and employer pages
  test/               E2E and unit tests
  migrations/         SQL migrations
  specs/              Feature specs and notes
  uploads/            Local development uploads
```

## Main commands

```bash
npm install
npm run build
npm run start:dev
npm run test
```

## Notes

- `src/` is the only backend source used by the build, start scripts, and tests.
- File uploads are written to `uploads/` during local development.
- Generated logs and uploaded files are ignored so the repo stays clean.
