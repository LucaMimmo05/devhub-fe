// Dev-only mock backend. Open any page with `?mock` to turn it on (persists in
// localStorage), `?mock=off` to turn it off. Every request made through
// mainCallApi/authApi is answered from the in-memory data below, so the whole
// app works without a backend or an account. Loaded from main.tsx only when
// import.meta.env.DEV, so none of this ships in the production build.
import type { AxiosAdapter, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { mainCallApi } from "@/services";
import { authApi } from "@/services/authService";
import type { TaskType } from "@/types/taskType";
import type { ProjectType, ProjectMemberSummary } from "@/types/projectType";
import type { NoteType } from "@/types/noteType";
import type { CommandType } from "@/types/commandType";

const STORAGE_KEY = "devhubMock";

const day = 24 * 60 * 60 * 1000;
const at = (offsetDays: number, hour = 10) => {
  const d = new Date(Date.now() + offsetDays * day);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
};

const user = {
  id: "mock-user",
  firstName: "Luca",
  lastName: "Mimmo",
  username: "lucamimmo",
};

const members: ProjectMemberSummary[] = [
  { profileId: "mock-user", username: "lucamimmo", firstName: "Luca", lastName: "Mimmo", role: "OWNER" },
  { profileId: "m2", username: "giulia.r", firstName: "Giulia", lastName: "Ricci", role: "MEMBER" },
  { profileId: "m3", username: "tkowalski", firstName: "Tomasz", lastName: "Kowalski", role: "MEMBER" },
  { profileId: "m4", username: "amara.o", firstName: "Amara", lastName: "Okafor", role: "MEMBER" },
];

const project = (
  id: string,
  title: string,
  description: string,
  status: ProjectType["status"],
  priority: ProjectType["priority"],
  due: number | null,
  memberCount: number
): ProjectType => ({
  id,
  title,
  description,
  status,
  priority,
  dueDate: due === null ? undefined : at(due),
  ownerId: "mock-user",
  ownerProfileId: "mock-user",
  ownerUsername: "lucamimmo",
  members: members.slice(0, memberCount),
  createdAt: at(-60 + Number(id)),
  updatedAt: at(-Number(id)),
});

const projects: ProjectType[] = [
  { ...project("1", "DevHub", "Personal developer dashboard: projects, tasks, notes", "IN_PROGRESS", "HIGH", 18, 3), githubRepo: "lucamimmo/devhub-fe" },
  project("2", "Billing service", "Stripe webhooks and invoice generation for the SaaS", "IN_PROGRESS", "HIGH", 6, 4),
  project("3", "Portfolio v3", "Rewrite in Astro with case studies", "PENDING", "MEDIUM", 41, 1),
  project("4", "CLI toolkit", "Small Go utilities for daily scripts", "IN_PROGRESS", "LOW", null, 2),
  project("5", "Mobile app spike", "Evaluate Expo vs Flutter for the companion app", "PENDING", "MEDIUM", 27, 2),
  project("6", "Infra migration", "Move staging from Heroku to Fly.io", "COMPLETED", "MEDIUM", -9, 3),
  project("7", "Old blog", "Jekyll blog, kept for redirects", "ARCHIVED", "LOW", null, 1),
];

const projectTitle = (id: string) => projects.find((p) => p.id === id)?.title;

let taskSeq = 0;
const task = (
  title: string,
  projectId: string,
  status: TaskType["status"],
  priority: TaskType["priority"],
  due: number | null
): TaskType => {
  taskSeq += 1;
  return {
    id: `t${taskSeq}`,
    title,
    description: "",
    status,
    priority,
    dueDate: due === null ? undefined : at(due),
    createdAt: at(-20 + taskSeq),
    updatedAt: at(-taskSeq / 3),
    projectId,
    projectTitle: projectTitle(projectId),
    assignedToProfileId: "mock-user",
    assignedToUsername: "lucamimmo",
    createdByProfileId: "mock-user",
  };
};

let tasks: TaskType[] = [
  task("Handle invoice.payment_failed webhook", "2", "IN_PROGRESS", "HIGH", -3),
  task("Fix token refresh race on cold start", "1", "PENDING", "HIGH", -1),
  task("Review Giulia's PR on dunning emails", "2", "PENDING", "MEDIUM", 0),
  task("Compact dashboard layout", "1", "IN_PROGRESS", "MEDIUM", 0),
  task("Write migration for invoice_lines", "2", "PENDING", "HIGH", 0),
  task("Add retry with backoff to sync job", "4", "PENDING", "LOW", 1),
  task("Benchmark Expo cold start on Android", "5", "PENDING", "MEDIUM", 3),
  task("Task filters: persist in URL", "1", "PENDING", "LOW", 4),
  task("Draft case study: Billing service", "3", "PENDING", "MEDIUM", 9),
  task("Set up Plausible analytics", "3", "PENDING", "LOW", 15),
  task("Rename `dh` binary to `devhub`", "4", "PENDING", "LOW", null),
  task("Collect feedback on wizard flows", "1", "PENDING", "MEDIUM", null),
  task("Upgrade to Tailwind 4.1", "1", "COMPLETED", "LOW", -5),
  task("Point staging DNS to Fly", "6", "COMPLETED", "HIGH", -10),
  task("Export notes as Markdown", "1", "COMPLETED", "MEDIUM", -2),
];

let notes: NoteType[] = [
  {
    id: "n1",
    title: "Stripe webhook checklist",
    emoji: "💳",
    content: "## Events\n- invoice.paid\n- invoice.payment_failed\n- customer.subscription.deleted\nVerify signature **before** parsing.",
    createdAt: at(-6),
    updatedAt: at(0, 9),
  },
  {
    id: "n2",
    title: "Standup notes",
    content: "Blocked on DB credentials for staging. Giulia picks up dunning emails, I take the webhook retries.",
    createdAt: at(-1),
    updatedAt: at(-1, 11),
  },
  {
    id: "n3",
    title: "Fly.io deploy gotchas",
    emoji: "🚀",
    content: "`fly deploy --strategy rolling` — remember to scale the worker process separately.",
    createdAt: at(-12),
    updatedAt: at(-3),
  },
  {
    id: "n4",
    title: "Ideas for portfolio",
    content: "Case studies with before/after screenshots. Keep it to three projects max.",
    createdAt: at(-20),
    updatedAt: at(-7),
  },
  {
    id: "n5",
    title: "Postgres index cheatsheet",
    content: "Use `CREATE INDEX CONCURRENTLY` on big tables. Partial indexes for soft-deleted rows.",
    createdAt: at(-30),
    updatedAt: at(-14),
  },
  {
    id: "n6",
    title: "Books to read",
    content: "Designing Data-Intensive Applications, A Philosophy of Software Design",
    createdAt: at(-40),
    updatedAt: at(-22),
  },
];

let commands: CommandType[] = [
  ["Undo last commit, keep changes", "git reset --soft HEAD~1", "Git"],
  ["Prune merged branches", "git branch --merged | grep -v main | xargs git branch -d", "Git"],
  ["Remove dangling images", "docker image prune -f", "Docker"],
  ["Shell into container", "docker exec -it <container> sh", "Docker"],
  ["Find large files", "du -ah . | sort -rh | head -20", "Bash"],
  ["Kill process on port", "lsof -ti:5173 | xargs kill -9", "Bash"],
  ["Table sizes", "SELECT relname, pg_size_pretty(pg_total_relation_size(relid)) FROM pg_catalog.pg_statio_user_tables ORDER BY 2 DESC;", "SQL"],
  ["Check outdated deps", "pnpm outdated", "NPM"],
].map(([title, command, category], i) => ({
  id: `c${i + 1}`,
  title,
  command,
  category,
  createdAt: at(-30 + i),
  updatedAt: at(-30 + i),
}));

// Base64url JWT with a far-future exp so AuthProvider treats the session as valid.
const b64 = (o: object) => btoa(JSON.stringify(o)).replace(/=+$/, "");
const fakeToken = `${b64({ alg: "none" })}.${b64({ sub: user.id, exp: Math.floor(Date.now() / 1000) + 365 * 24 * 3600 })}.mock`;


// ── GitHub (mock) ─────────────────────────────────────────────────────────────
let githubConnected = true;

const ghRepo = (
  id: number, name: string, description: string, language: string, stars: number, forks: number,
  issues: number, pushedDaysAgo: number, extra: Partial<Record<string, unknown>> = {}
) => ({
  id, name, fullName: `lucamimmo/${name}`, owner: "lucamimmo", description, isPrivate: false, fork: false,
  archived: false, language, stars, forks, watchers: Math.max(1, Math.round(stars / 4)), openIssues: issues,
  defaultBranch: "main", htmlUrl: `https://github.com/lucamimmo/${name}`, homepage: null, topics: [],
  pushedAt: at(-pushedDaysAgo, 15), updatedAt: at(-pushedDaysAgo, 15), createdAt: at(-400 + id * 20),
  sizeKb: 1200 + id * 300, license: "MIT", ...extra,
});

const ghRepos = [
  ghRepo(1, "devhub-fe", "Frontend for DevHub: React 19, TanStack Query, Tailwind", "TypeScript", 42, 6, 3, 0, { topics: ["react", "tailwind", "dashboard"], homepage: "https://devhub.example.dev" }),
  ghRepo(2, "devhub-be", "DevHub REST API: Quarkus, PostgreSQL, JWT", "Java", 31, 4, 2, 0, { topics: ["quarkus", "java", "api"] }),
  ghRepo(3, "billing-service", "Stripe webhooks and invoice generation", "Go", 12, 1, 5, 2, { isPrivate: true }),
  ghRepo(4, "cli-toolkit", "Small Go utilities for daily scripts", "Go", 87, 9, 1, 6),
  ghRepo(5, "portfolio", "Personal site, built with Astro", "Astro", 5, 0, 0, 21),
  ghRepo(6, "dotfiles", "zsh, neovim, tmux", "Shell", 19, 3, 0, 40),
  ghRepo(7, "old-blog", "Jekyll blog, kept for redirects", "HTML", 2, 0, 0, 700, { archived: true }),
];

const commitMessages = [
  "feat(github): connect accounts with OAuth",
  "fix(notes): flush pending edits before closing",
  "refactor(tasks): share TaskRow between pages",
  "feat(search): command palette with actions",
  "chore(deps): bump vite to 7.2",
  "fix(api): return fresh timestamps from updates",
  "docs: explain the GitHub OAuth setup",
  "feat(projects): inline editing on the project page",
];

const ghCommits = (repo: string, n: number, offset = 0) =>
  Array.from({ length: n }, (_, i) => {
    const sha = (Math.abs(Math.sin((i + offset + repo.length) * 9301)) * 1e16).toString(16).padStart(14, "0").slice(0, 40).padEnd(40, "a");
    return {
      sha, shortSha: sha.slice(0, 7), message: commitMessages[(i + offset) % commitMessages.length], repo,
      authorLogin: "lucamimmo", authorName: "Luca Mimmo", authorAvatarUrl: null,
      date: new Date(Date.now() - (i * 7 + offset * 3 + 1) * 3600 * 1000).toISOString(),
      htmlUrl: `https://github.com/${repo}/commit/${sha}`,
    };
  });

// A year of contributions with a weekday rhythm and a few hot streaks, deterministic per day.
const ghContributions = () => {
  const today = new Date();
  const start = new Date(today);
  start.setDate(start.getDate() - 364 - start.getDay());
  const weeks: { days: { date: string; count: number; level: number }[] }[] = [];
  let total = 0;
  for (let d = new Date(start); d <= today; d.setDate(d.getDate() + 1)) {
    if (d.getDay() === 0) weeks.push({ days: [] });
    const seed = Math.abs(Math.sin(d.getTime() / 8.64e7) * 10000) % 1;
    const weekday = d.getDay() > 0 && d.getDay() < 6;
    const count = seed < (weekday ? 0.25 : 0.65) ? 0 : Math.round(seed * (weekday ? 14 : 5));
    total += count;
    const level = count === 0 ? 0 : count < 3 ? 1 : count < 6 ? 2 : count < 10 ? 3 : 4;
    if (!weeks.length) weeks.push({ days: [] });
    weeks[weeks.length - 1].days.push({ date: d.toISOString().slice(0, 10), count, level });
  }
  return {
    total, weeks,
    totals: { commits: Math.round(total * 0.71), pullRequests: 64, reviews: 38, issues: 17, privateContributions: Math.round(total * 0.22) },
    topRepos: [
      { repo: "lucamimmo/devhub-fe", commits: 412 }, { repo: "lucamimmo/devhub-be", commits: 268 },
      { repo: "lucamimmo/cli-toolkit", commits: 97 }, { repo: "lucamimmo/billing-service", commits: 61 },
      { repo: "lucamimmo/portfolio", commits: 23 },
    ],
  };
};

const ghReadme = (repo: { name: string; description: string }) => `# ${repo.name}

${repo.description}.

## Getting started

\`\`\`bash
pnpm install
pnpm dev
\`\`\`

The dev server runs on \`http://localhost:5173\` and talks to the API configured in \`VITE_API_URL\`.

## Features

- Projects with tasks, due dates and a team
- Markdown notes with emoji
- A command palette (\`Ctrl K\`) over everything
- GitHub: inbox, contribution graph, linked repositories

| Script | What it does |
| --- | --- |
| \`pnpm build\` | Type-check and build for production |
| \`pnpm lint\` | ESLint over the whole project |

> Mock mode: append \`?mock\` to any URL to browse with sample data.
`;

const inboxItem = (kind: "PR" | "ISSUE", number: number, title: string, repo: string, extra: Record<string, unknown> = {}) => ({
  kind, number, title, repo, htmlUrl: `https://github.com/${repo}/${kind === "PR" ? "pull" : "issues"}/${number}`,
  authorLogin: "lucamimmo", authorAvatarUrl: null, labels: [], comments: 0, draft: false, reviewDecision: null,
  checks: null, additions: 0, deletions: 0, createdAt: at(-2), updatedAt: at(0, 8), ...extra,
});

const ghInbox = () => ({
  reviewRequests: [
    inboxItem("PR", 44, "fix(auth): refresh token rotation on concurrent tabs", "lucamimmo/devhub-be", { authorLogin: "giulia-r", reviewDecision: "REVIEW_REQUIRED", checks: "SUCCESS", additions: 86, deletions: 31, comments: 3, updatedAt: at(0, 9) }),
    inboxItem("PR", 19, "Add retry with backoff to the webhook consumer", "lucamimmo/billing-service", { authorLogin: "tkowalski", reviewDecision: "REVIEW_REQUIRED", checks: "PENDING", additions: 142, deletions: 12, updatedAt: at(-1, 16) }),
  ],
  pullRequests: [
    inboxItem("PR", 41, "feat: GitHub integration", "lucamimmo/devhub-fe", { reviewDecision: "APPROVED", checks: "SUCCESS", additions: 1840, deletions: 312, comments: 5, labels: [{ name: "feature", color: "0e8a16" }], updatedAt: at(0, 11) }),
    inboxItem("PR", 17, "chore: bump Quarkus to 3.30", "lucamimmo/devhub-be", { reviewDecision: "CHANGES_REQUESTED", checks: "FAILURE", additions: 24, deletions: 24, comments: 2, updatedAt: at(-1, 10) }),
    inboxItem("PR", 9, "WIP: subcommand for bulk renames", "lucamimmo/cli-toolkit", { draft: true, checks: "PENDING", additions: 210, deletions: 4, updatedAt: at(-4) }),
    inboxItem("PR", 39, "refactor(notes): extract the autosave queue", "lucamimmo/devhub-fe", { reviewDecision: "REVIEW_REQUIRED", checks: "SUCCESS", additions: 133, deletions: 97, updatedAt: at(-5) }),
    inboxItem("PR", 6, "Astro 5 upgrade", "lucamimmo/portfolio", { checks: "FAILURE", additions: 58, deletions: 41, comments: 1, updatedAt: at(-9) }),
  ],
  issues: [
    inboxItem("ISSUE", 40, "Dark mode flicker on first load", "lucamimmo/devhub-fe", { authorLogin: "giulia-r", labels: [{ name: "bug", color: "d73a4a" }], comments: 2, updatedAt: at(0, 7) }),
    inboxItem("ISSUE", 12, "Invoices: PDF totals rounded twice", "lucamimmo/billing-service", { authorLogin: "amara-o", labels: [{ name: "bug", color: "d73a4a" }, { name: "billing", color: "fbca04" }], comments: 6, updatedAt: at(-2) }),
  ],
});

const githubRoute = (method: string, seg: string[]): [number, unknown] | null => {
  if (seg[0] === "auth" && seg[1] === "github") return [503, { message: "Mock mode: GitHub sign-in needs a real OAuth app." }];
  if (seg[0] !== "github") return null;
  const status = githubConnected
    ? { configured: true, connected: true, login: "lucamimmo", name: "Luca Mimmo", avatarUrl: null, profileUrl: "https://github.com/lucamimmo", connectedAt: at(-3) }
    : { configured: true, connected: false, login: null, name: null, avatarUrl: null, profileUrl: null, connectedAt: null };
  if (seg[1] === "status") return [200, status];
  if (seg[1] === "connection" && method === "delete") { githubConnected = false; return [204, null]; }
  if (seg[1] === "connect") return [503, { message: "Mock mode: connecting needs a real OAuth app." }];
  if (!githubConnected) return [409, { message: "Connect your GitHub account first." }];
  if (seg[1] === "repos" && seg[2]) {
    const repo = ghRepos.find((r) => r.fullName === `${seg[2]}/${seg[3]}`);
    if (!repo) return [404, { message: "Not found on GitHub, or your account can't access it." }];
    return [200, {
      repo,
      languages: repo.language === "TypeScript" ? { TypeScript: 412000, CSS: 18000, HTML: 3100, JavaScript: 2400 } : { [repo.language]: 220000, Dockerfile: 1800, Shell: 900 },
      commits: ghCommits(repo.fullName, 12),
      issues: Array.from({ length: repo.openIssues }, (_, i) => ({
        number: 40 - i * 3, title: ["Dark mode flicker on first load", "Contribution graph should respect week start", "Add pagination to repositories", "Rate limit message is unclear", "Support GitLab too?"][i % 5],
        state: "open", authorLogin: ["giulia-r", "tkowalski", "amara-o"][i % 3], authorAvatarUrl: null,
        labels: [[{ name: "bug", color: "d73a4a" }], [{ name: "enhancement", color: "a2eeef" }], [{ name: "good first issue", color: "7057ff" }, { name: "ui", color: "fbca04" }]][i % 3],
        comments: i * 2, createdAt: at(-(i + 1) * 4), updatedAt: at(-i), htmlUrl: `${repo.htmlUrl}/issues/${40 - i * 3}`,
      })),
      pulls: repo.openIssues > 1 ? [
        { number: 41, title: "feat: GitHub integration", authorLogin: "lucamimmo", authorAvatarUrl: null, draft: false, branch: "feat/github-integration", labels: [{ name: "feature", color: "0e8a16" }], createdAt: at(-1, 9), updatedAt: at(0, 9), htmlUrl: `${repo.htmlUrl}/pull/41` },
        { number: 38, title: "WIP: move settings into tabs", authorLogin: "giulia-r", authorAvatarUrl: null, draft: true, branch: "settings-tabs", labels: [], createdAt: at(-5), updatedAt: at(-2), htmlUrl: `${repo.htmlUrl}/pull/38` },
      ] : [],
      readme: repo.id === 6 ? null : ghReadme(repo),
      latestRelease: repo.id <= 4 ? { tag: `v1.${repo.id + 3}.0`, name: `v1.${repo.id + 3}.0`, publishedAt: at(-6 - repo.id), htmlUrl: `${repo.htmlUrl}/releases` } : null,
      runs: repo.id <= 3 ? [
        { id: 5, name: "CI", title: "feat(github): connect accounts with OAuth", status: "in_progress", conclusion: null, branch: "main", event: "push", createdAt: at(0, 11), htmlUrl: `${repo.htmlUrl}/actions` },
        { id: 4, name: "CI", title: "fix(notes): flush pending edits before closing", status: "completed", conclusion: "success", branch: "main", event: "push", createdAt: at(0, 8), htmlUrl: `${repo.htmlUrl}/actions` },
        { id: 3, name: "CI", title: "chore: bump Quarkus to 3.30", status: "completed", conclusion: "failure", branch: "chore/quarkus", event: "pull_request", createdAt: at(-1, 10), htmlUrl: `${repo.htmlUrl}/actions` },
        { id: 2, name: "Deploy", title: "refactor(tasks): share TaskRow between pages", status: "completed", conclusion: "success", branch: "main", event: "push", createdAt: at(-1, 9), htmlUrl: `${repo.htmlUrl}/actions` },
      ] : [],
      contributors: [
        { login: "lucamimmo", avatarUrl: null, contributions: 412 },
        { login: "giulia-r", avatarUrl: null, contributions: 57 },
        { login: "tkowalski", avatarUrl: null, contributions: 21 },
        { login: "amara-o", avatarUrl: null, contributions: 6 },
      ].slice(0, repo.id <= 2 ? 4 : 1),
      weeklyCommits: Array.from({ length: 52 }, (_, i) => Math.max(0, Math.round(Math.sin(i / 4 + repo.id) * 6 + (i > 40 ? 9 : 4)))),
    }];
  }
  if (seg[1] === "repos") return [200, ghRepos];
  if (seg[1] === "commits") return [200, [...ghCommits("lucamimmo/devhub-fe", 8), ...ghCommits("lucamimmo/devhub-be", 5, 3), ...ghCommits("lucamimmo/cli-toolkit", 3, 9)]
    .sort((a, b) => b.date.localeCompare(a.date))];
  if (seg[1] === "contributions") return [200, ghContributions()];
  if (seg[1] === "inbox") return [200, ghInbox()];
  return null;
};

const body = (config: InternalAxiosRequestConfig) => {
  if (!config.data) return {};
  return typeof config.data === "string" ? JSON.parse(config.data) : config.data;
};

const route = (config: InternalAxiosRequestConfig): [number, unknown] => {
  const method = (config.method ?? "get").toLowerCase();
  const path = (config.url ?? "").replace(/^https?:\/\/[^/]+/, "").split("?")[0];
  const seg = path.split("/").filter(Boolean);
  const data = body(config);
  const now = new Date().toISOString();

  const gh = githubRoute(method, seg);
  if (gh) return gh;

  // Auth
  if (seg[0] === "auth") {
    if (seg[1] === "logout") {
      localStorage.removeItem(STORAGE_KEY);
      return [200, {}];
    }
    return [200, { accessToken: fakeToken, userProfile: user }];
  }
  if (seg[0] === "email") return [200, {}];

  // Tasks
  if (seg[0] === "tasks") {
    if (method === "get") return [200, tasks];
    if (method === "post") {
      const created: TaskType = {
        id: `t${Date.now()}`,
        status: "PENDING",
        priority: "MEDIUM",
        ...data,
        projectTitle: data.projectId ? projectTitle(data.projectId) : undefined,
        createdByProfileId: user.id,
        createdAt: now,
        updatedAt: now,
      };
      tasks = [created, ...tasks];
      return [201, created];
    }
    if (method === "put") {
      const { clearDueDate, ...fields } = data;
      tasks = tasks.map((t) =>
        t.id === seg[1] ? { ...t, ...fields, ...(clearDueDate ? { dueDate: undefined } : {}), updatedAt: now } : t
      );
      return [200, tasks.find((t) => t.id === seg[1])];
    }
    if (method === "delete") {
      tasks = tasks.filter((t) => t.id !== seg[1]);
      return [204, null];
    }
  }

  // Projects
  if (seg[0] === "projects") {
    if (seg[2] === "tasks") return [200, tasks.filter((t) => t.projectId === seg[1])];
    if (seg[2] === "members") return [200, projects.find((p) => p.id === seg[1])];
    if (seg[1]) {
      const p = projects.find((x) => x.id === seg[1]);
      if (method === "get") return p ? [200, p] : [404, { message: "Not found" }];
      if (method === "put" && p) {
        const { clearDueDate, ...fields } = data;
        Object.assign(p, fields, { updatedAt: now });
        if (clearDueDate) p.dueDate = undefined;
        return [200, p];
      }
      if (method === "delete") {
        projects.splice(projects.findIndex((x) => x.id === seg[1]), 1);
        return [204, null];
      }
    }
    if (method === "post") {
      const created = { ...project(String(Date.now()), "", "", "PENDING", "MEDIUM", null, 1), ...data };
      projects.unshift(created);
      return [201, created];
    }
    return [200, projects];
  }

  // Notes
  if (seg[0] === "notes") {
    if (method === "get") return seg[1] ? [200, notes.find((n) => n.id === seg[1])] : [200, notes];
    if (method === "post") {
      const created: NoteType = { id: `n${Date.now()}`, ...data, createdAt: now, updatedAt: now };
      notes = [created, ...notes];
      return [201, created];
    }
    if (method === "put") {
      notes = notes.map((n) => (n.id === seg[1] ? { ...n, ...data, updatedAt: now } : n));
      return [200, notes.find((n) => n.id === seg[1])];
    }
    if (method === "delete") {
      notes = notes.filter((n) => n.id !== seg[1]);
      return [204, null];
    }
  }

  // Commands
  if (seg[0] === "commands") {
    if (method === "get") return [200, commands];
    if (method === "post") {
      const created: CommandType = { id: `c${Date.now()}`, ...data, createdAt: now, updatedAt: now };
      commands = [created, ...commands];
      return [201, created];
    }
    if (method === "put") {
      commands = commands.map((c) => (c.id === seg[1] ? { ...c, ...data, updatedAt: now } : c));
      return [200, commands.find((c) => c.id === seg[1])];
    }
    if (method === "delete") {
      commands = commands.filter((c) => c.id !== seg[1]);
      return [204, null];
    }
  }

  // Users
  if (seg[0] === "users") {
    if (seg[1] === "search") return [200, members.slice(1).map((m) => ({ ...m, id: m.profileId }))];
    if (method === "put") return [200, { ...user, ...data }];
    if (method === "delete") return [200, { deletionScheduledFor: new Date(Date.now() + 7 * 86_400_000).toISOString() }];
    return [200, user];
  }

  console.warn("[devMock] unhandled request", method.toUpperCase(), path);
  return [200, []];
};

const mockAdapter: AxiosAdapter = async (config) => {
  // A short delay so loading skeletons are visible for a moment.
  await new Promise((r) => setTimeout(r, 250));
  const [status, data] = route(config);
  const response: AxiosResponse = { data, status, statusText: String(status), headers: {}, config };
  if (status >= 400) {
    return Promise.reject(Object.assign(new Error(`Mock ${status}`), { response, config, isAxiosError: true }));
  }
  return response;
};

export const setupDevMock = () => {
  const param = new URLSearchParams(window.location.search).get("mock");
  if (param !== null) {
    if (param === "off" || param === "0") localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, "1");
  }
  if (localStorage.getItem(STORAGE_KEY) !== "1") return;

  mainCallApi.defaults.adapter = mockAdapter;
  authApi.defaults.adapter = mockAdapter;

  const badge = document.createElement("a");
  badge.href = "?mock=off";
  badge.title = "Mock data is on. Click to turn it off.";
  badge.textContent = "Mock data · off";
  badge.style.cssText =
    "position:fixed;bottom:8px;left:50%;transform:translateX(-50%);z-index:60;font:500 11px/1 system-ui;padding:5px 9px;border-radius:6px;background:oklch(0.55 0.2 265);color:white;text-decoration:none;opacity:.85";
  document.body.appendChild(badge);
  console.info("[devMock] mock backend enabled — open with ?mock=off to disable");
};
