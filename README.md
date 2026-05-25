# TaskM Frontend

React + Vite task management UI for the TaskManager app.

## Local development

```bash
npm install
cp .env.example .env
# Edit .env — set VITE_API_URL to your backend (e.g. http://localhost:5001/api)
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Deploy (Vercel — recommended)

1. Push this repo to GitHub.
2. Import the project at [vercel.com](https://vercel.com) → **Add New Project** → select this repository.
3. Framework preset: **Vite**. Root directory: `.` (repo root).
4. Add environment variable:
   - `VITE_API_URL` = your deployed backend URL with `/api` (e.g. `https://your-api.example.com/api`)
5. Deploy. `vercel.json` handles client-side routing for React Router.

## Environment variables

| Variable        | Description                          |
|----------------|--------------------------------------|
| `VITE_API_URL` | Backend API base URL (must end with `/api`) |

Do not commit `.env` — use `.env.example` as a template.
