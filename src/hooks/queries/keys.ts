import type { TaskFilters } from "@/services/taskService";

export const queryKeys = {
  projects: {
    all: ["projects"] as const,
    list: (limit?: number) => ["projects", "list", limit ?? null] as const,
    detail: (id: string) => ["projects", "detail", id] as const,
  },
  tasks: {
    all: ["tasks"] as const,
    mine: (filters?: TaskFilters) => ["tasks", "mine", filters ?? {}] as const,
    project: (projectId: string) => ["tasks", "project", projectId] as const,
  },
  notes: {
    all: ["notes"] as const,
    list: () => ["notes", "list"] as const,
  },
  github: {
    all: ["github"] as const,
    status: () => ["github", "status"] as const,
    repos: () => ["github", "repos"] as const,
    repo: (fullName: string) => ["github", "repo", fullName] as const,
    commits: () => ["github", "commits"] as const,
    contributions: () => ["github", "contributions"] as const,
    inbox: () => ["github", "inbox"] as const,
  },
  commands: {
    all: ["commands"] as const,
    list: (category?: string, search?: string) =>
      ["commands", "list", category ?? null, search ?? null] as const,
  },
};
