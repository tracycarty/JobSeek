# spec.md

You are a development agent. Your task is to set up a backend project using NestJS with TypeScript.

## Objective
Create and run a basic NestJS application using TypeScript that exposes a default HTTP endpoint.

## Requirements
- Use Node.js (v18 or higher)
- Use NestJS CLI
- Use TypeScript
- Package manager: npm

## Tasks

### 1. Install NestJS CLI
Run the following command globally:

npm install -g @nestjs/cli

Verify installation:

nest --version

Expected result:
The CLI version is displayed.

### 2. Create a New NestJS Project
Generate a new project using:

nest new job-seek

When prompted, select:
- Package manager: npm

Expected result:
A new NestJS project directory is created.

### 3. Start the Development Server
Navigate to the project folder:

cd aesp-app

Run the development server:

npm run start:dev

Expected result:
The application starts successfully and the server running on: http://localhost:3000

### 4. Verify the API
Open a browser or send a request to:

http://localhost:3000

Expected response:

Hello World!

## Success Criteria
- NestJS CLI installs successfully
- Project is generated without errors
- Development server runs successfully
- API responds at localhost:3000