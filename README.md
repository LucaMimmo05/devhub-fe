# DevHub — Frontend

> Developer dashboard built with React 19 and Vite. Manage projects, tasks, notes and CLI commands from a single interface.

---

## Tech Stack

| Layer | Library / Tool |
|---|---|
| Framework | React 19 + Vite 7 |
| Language | TypeScript 5.9 |
| Routing | React Router v7 |
| Styling | Tailwind CSS v4 |
| UI Components | shadcn/ui (Radix UI primitives) |
| Icons | Lucide React |
| HTTP | Axios |
| Toasts | Sonner |
| Markdown | react-markdown + remark-gfm |
| Animations | Framer Motion |
| Tables | TanStack Table v8 |
| Command palette | cmdk |
| Date utilities | date-fns |

---

## Project Structure

```
src/
├── app/
│   └── Router.tsx              # All client-side routes
├── components/
│   └── ui/                     # Shared UI components (cards, modals, badges…)
├── context/
│   ├── AuthContext.tsx          # Current user + token state
│   └── HeaderActionsContext.tsx # Connects page-level handlers to header buttons
├── hooks/                      # Custom React hooks
├── layouts/
│   ├── AppLayout.tsx           # Authenticated shell (sidebar + header + footer)
│   ├── AppSidebar.tsx
│   ├── AuthLayout.tsx          # Unauthenticated wrapper
│   └── PageHeader.tsx
├── pages/
│   ├── Authentication/         # Login, Register, VerifyEmail, ForgotPassword, ResetPassword
│   ├── Dashboard/              # Stats bar, live clock, latest projects, quick notes
│   ├── Projects/               # Project list with archive/unarchive
│   ├── ProjectDetails/         # Single project: tasks + members
│   ├── Tasks/                  # Global task list
│   ├── Notes/                  # Markdown editor with live preview
│   ├── Commands/               # CLI snippet manager
│   ├── Settings/               # User profile settings
│   └── Github/                 # GitHub integration (coming soon)
├── services/                   # Axios API calls (one file per domain)
├── types/                      # TypeScript interfaces
└── utils/                      # Helpers (date formatting, route guards…)
```

---

## Features

### Authentication
- Register with email verification (OTP)
- Login / Logout with HttpOnly JWT cookies
- Refresh token rotation
- Forgot password → OTP → reset password flow

### Dashboard
- Real-time clock and date
- Stats bar: active projects, tasks, notes, commands
- Latest projects mini-cards (priority, status, members, due date)
- Quick Notes panel
- Recent tasks list
- GitHub activity placeholder

### Projects
- Create, update, delete projects
- Archive / Unarchive
- Priority (`Low` / `Medium` / `High`) and Status (`Pending` / `In Progress` / `Completed` / `Archived`)
- Due date
- Members management (add / remove collaborators)

### Tasks
- Create tasks linked to a project
- Priority and status tracking
- View all tasks or filter by project

### Notes
- Markdown editor with live side-by-side preview (GFM supported)
- Auto-save (1 s debounce) + manual save
- Full-text search in sidebar

### Commands
- Store CLI snippets with title, command body, and category
- Copy to clipboard in one click

### Global search
- `Ctrl + K` opens a command palette to quickly navigate anywhere

---

## Getting Started

### Prerequisites
- Node.js ≥ 20
- pnpm (or npm / yarn)

### Installation

```bash
pnpm install
```

### Environment variables

Create a `.env.local` file in the project root:

```env
VITE_API_URL=http://localhost:8080
```

For production create `.env.production`:

```env
VITE_API_URL=https://<your-backend>.onrender.com
```

### Development

```bash
pnpm dev
```

The app will be available at `http://localhost:5173`.

### Build

```bash
pnpm build      # type-check + Vite production build
pnpm preview    # serve the production build locally
```

---

## Deployment (Vercel)

1. Import the repo on [vercel.com](https://vercel.com).
2. Framework preset: **Vite**.
3. Add environment variable `VITE_API_URL` pointing to the backend URL.
4. Add a `vercel.json` at the project root for SPA routing:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/" }]
}
```

---

## Environment Variables Reference

| Variable | Description | Example |
|---|---|---|
| `VITE_API_URL` | Base URL of the DevHub backend | `https://devhub-be.onrender.com` |

---

## Authors

Crafted by [Luca Mimmo](https://github.com/LucaMimmo05) × Claude (Anthropic).
