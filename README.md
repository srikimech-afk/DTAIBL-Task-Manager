# Momentum — Task Manager

A simple, responsive task manager built with **Next.js 14, React, and TypeScript**. It is ready to run locally and deploy through GitHub + Vercel.

## Features

- Create, edit, and delete tasks
- Set start dates, due dates, priority, and status
- Track progress from 0–100% with a slider
- Dashboard totals for all, active, completed, and overdue tasks
- Overall workspace progress indicator
- Search and filter tasks
- Responsive desktop and mobile layout
- Automatically saves tasks in browser `localStorage`

## Run locally

1. Install **Node.js 18.17+**.
2. Extract this ZIP and open the project folder in a terminal.
3. Install dependencies:

   ```bash
   npm install
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open http://localhost:3000

## Deploy with GitHub and Vercel

1. Create a new repository on GitHub.
2. Upload/push the contents of this folder to the repository root.
3. Sign in to [Vercel](https://vercel.com) and choose **Add New → Project**.
4. Import your GitHub repository.
5. Keep the detected Next.js settings and click **Deploy**.

No environment variables are required for this starter.

## Important note about saving data

This starter stores tasks in the browser using `localStorage`. That means:
- Your tasks remain after refreshing the page in the same browser.
- Data is local to that browser/device.
- Clearing browser site data can remove saved tasks.
- Tasks do not sync across devices or between different users.

For cross-device sync, accounts, and shared workspaces, connect a database such as Supabase or Neon in a next iteration.

## Project structure

```text
task-manager-app/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── .env.example
├── .gitignore
├── next.config.mjs
├── package.json
├── tsconfig.json
└── README.md
```
