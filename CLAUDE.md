# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

DevHub frontend — a developer dashboard (projects, tasks, notes, CLI command snippets) built with React 19 + Vite. Pairs with a separate DevHub backend (`VITE_API_URL`, default `http://localhost:8080`).

## Commands

```bash
pnpm install     # install deps
pnpm dev         # start dev server at http://localhost:5173
pnpm build       # tsc -b (type-check) + vite build
pnpm lint        # eslint .
pnpm preview     # serve the production build locally
```

There is no test suite/framework configured in this repo — do not assume `pnpm test` exists.

Env vars: copy `.env.example` to `.env.local` and set `VITE_API_URL` to point at the backend.

## Architecture

**Routing** (`src/app/Router.tsx`): a single `createBrowserRouter` tree. `/auth/*` routes render inside `AuthLayout`; everything else is nested under a `PrivateRoute`-guarded `AppLayout`. Each route has a `handle: RouteHandle` object (`title`, and `header.showSearch` / `header.actions`) that `AppLayout` reads via `useMatches()` to drive the page header — this is how the shared header/title/action-buttons get wired per-page without prop drilling. Route-level data loading uses React Router loaders (see `ProjectDetails` + `projectDetailsLoader` in `src/pages/ProjectDetails/projectDetailsUtils.ts`) rather than component-level fetch-on-mount for that page.

**Header actions indirection**: `AppLayout` holds refs (`onCreateProjectRef`, etc.) exposed to child pages through `HeaderActionsProvider` (`src/context/HeaderActionsContext.ts`). A page registers its "create" handler via that context; `src/utils/HeaderActions.tsx` maps route `handle.header.actions` ids (e.g. `"add"`, `"addDropdown"`, `"sync"`) to the actual header buttons that invoke those refs. When adding a new page action button, wire it through this ref/context system rather than passing callbacks through route params.

**Auth** (`src/context/AuthContext.ts` + `AuthProvider.tsx`): access token + user profile are kept in `localStorage` (`accessToken`, `userData`) and mirrored onto `axios.defaults.headers.common["Authorization"]`. Refresh tokens are httpOnly cookies handled server-side via `withCredentials: true`. On mount, `AuthProvider` calls `refreshAuth()`; if the refresh call fails but the stored access token's JWT `exp` is still valid, it restores the session from `localStorage` instead of forcing logout (defends against a flaky/cold backend). `PrivateRoute` (`src/utils/PrivateRoute.tsx`) reads `status` (`"loading" | "authenticated" | "unauthenticated"`) from this context to gate the private route tree.

**API layer** (`src/services/`): one file per domain (`authService`, `projectService`, `taskService`, `noteService`, `commandService`, `userService`), all built on the shared `mainCallApi` axios instance from `src/services/index.ts`. That instance auto-attaches the bearer token on every request and, on any `401` response, clears local auth state and hard-redirects to `/auth/login`. New API calls should go through `mainCallApi`, not a bare `axios` import.

**Backend cold-start handling**: `useBackendWakeup` (`src/hooks/useBackendWakeup.ts`) pings a public endpoint with a 90s timeout to detect a sleeping free-tier backend; `BackendWakeupBanner` surfaces this in the UI. Relevant when debugging "first request after idle is slow/fails" reports.

**UI components**: `src/components/ui/` is shadcn/ui (Radix primitives, "new-york" style, see `components.json`) plus custom composed components in the same folder (PascalCase filenames like `ProjectCard.tsx`, `TaskTable.tsx` vs. lowercase shadcn primitives like `button.tsx`, `dialog.tsx`). Use the `@/*` path alias (maps to `src/*`) for imports; styling is Tailwind CSS v4 with `cn()` from `src/lib/utils.ts` (clsx + tailwind-merge) for conditional classes.

**Global search**: `Ctrl+K` toggles `SearchCommand` (cmdk-based), wired up as a keydown listener in `AppLayout`.

**Types** (`src/types/`) and **mock data** (`src/mock/`) are separate from services — check `src/types/*Type.ts` for the shape backend responses are expected to have.
