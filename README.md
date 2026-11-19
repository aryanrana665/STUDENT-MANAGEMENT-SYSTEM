# EduTrack – Smart Student Management System

EduTrack is a full-stack academic management dashboard built with React, TypeScript, Tailwind CSS, Express, and the `@google/genai` SDK.

## Features

- **Dashboard**: Cohort KPIs, interactive attendance trend chart, course performance bars, assignment schedule, and activity log.
- **Student Management**: Add, edit, delete, search, filter, and inspect student academic profiles.
- **Attendance Register**: Mark Present, Late, or Absent by date and course with live attendance percentage calculation.
- **Assignments & Marks**: Publish coursework assignments, enter student scores and feedback, and auto-calculate percentages and letter grades.
- **AI Academic Assistant**: Concept tutoring, study plan generation, and assignment breakdowns via a secure server-side Gemini endpoint.
- **Prompt Engineering Lab**: Side-by-side interactive comparison of Zero-Shot, Few-Shot, Role-Based, and Context-Based prompting.
- **Demo Roles**: One-click sign-in as Admin, Faculty, or Student, persisted in `localStorage`.

## Local Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Set environment variables in `.env` (see `.env.example`):
   ```bash
   GEMINI_API_KEY="your_gemini_api_key"
   ```
   > If `GEMINI_API_KEY` is omitted, all CRUD modules remain fully functional and AI modules display a configuration notice instead of generating mock replies.
3. Start the development server (Express + Vite on port 3000):
   ```bash
   npm run dev
   ```
4. Type-check and build for production:
   ```bash
   npm run lint
   npm run build
   ```

## Vercel Deployment

The repository includes `vercel.json` and serverless endpoints under `/api/ai/`:

1. Push the project to GitHub and import it into Vercel.
2. Keep the default Vite framework preset (`npm run build` outputting to `dist`).
3. Add `GEMINI_API_KEY` under **Project Settings → Environment Variables**.
4. Deploy. Serverless routes `/api/ai/status`, `/api/ai/assistant`, and `/api/ai/compare` will run automatically alongside the built SPA.
