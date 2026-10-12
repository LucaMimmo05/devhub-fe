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
  project("1", "DevHub", "Personal developer dashboard: projects, tasks, notes", "IN_PROGRESS", "HIGH", 18, 3),
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
