import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpDown, FolderGit2, LayoutGrid, List, Search, X } from "lucide-react";
import {
  useProjects,
  useDeleteProject,
  useUpdateProject,
} from "@/hooks/queries/useProjects";

import PageContainer from "@/layouts/PageContainer";
import ProjectCard, { ProjectCardSkeleton } from "@/components/ui/ProjectCard";
import ProjectRow, { ProjectListHeader } from "@/components/projects/ProjectRow";
import ProjectsOverview from "@/components/projects/ProjectsOverview";
import { InlinePicker } from "@/components/projects/InlineEdit";
import { projectHealth, taskStats, type Health } from "@/components/projects/projectUtils";
import type { ProjectType } from "@/types/projectType";
import { useProjectsTasks } from "@/hooks/queries/useTasks";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const TABS = ["Active", "Completed", "Archived"] as const;
type Tab = (typeof TABS)[number];

const inTab: Record<Tab, (p: ProjectType) => boolean> = {
  Active: (p) => p.status === "PENDING" || p.status === "IN_PROGRESS",
  Completed: (p) => p.status === "COMPLETED",
  Archived: (p) => p.status === "ARCHIVED",
};

type Sort = "attention" | "deadline" | "progress" | "updated" | "name";
const SORTS: { value: Sort; label: string }[] = [
  { value: "attention", label: "Needs attention" },
  { value: "deadline", label: "Deadline" },
  { value: "progress", label: "Progress" },
  { value: "updated", label: "Recently updated" },
  { value: "name", label: "Name" },
];
const HEALTH_RANK: Record<Health, number> = { overdue: 0, "at-risk": 1, idle: 2, "on-track": 3, done: 4 };

type View = "grid" | "list";
const VIEW_KEY = "devhub.projects.view";

const readView = (): View => {
  try {
    return localStorage.getItem(VIEW_KEY) === "list" ? "list" : "grid";
  } catch {
    return "grid";
  }
};

const GRID = "grid grid-cols-1 gap-4 md:grid-cols-2 min-[1800px]:grid-cols-3";

const Projects = () => {
  const { data: projects = [], isError, isLoading } = useProjects();
  const tasksByProject = useProjectsTasks(projects.map((p) => p.id));
  const deleteProjectMutation = useDeleteProject();
  const updateProjectMutation = useUpdateProject();

  const [activeTab, setActiveTab] = useState<Tab>("Active");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("attention");
  const [view, setView] = useState<View>(readView);

  const changeView = (v: View) => {
    setView(v);
    try {
      localStorage.setItem(VIEW_KEY, v);
    } catch {
      // Storage unavailable: the choice just won't be remembered.
    }
  };

  useEffect(() => {
    if (isError) toast.error("Failed to load projects.");
  }, [isError]);

  const handleDelete = async (id: string) => {
    try {
      await deleteProjectMutation.mutateAsync(id);
      toast.success("Project deleted.");
    } catch {
      toast.error("Failed to delete project.");
    }
  };

  const handleArchive = async (id: string) => {
    const project = projects.find((p) => p.id === id);
    if (!project) return;
    try {
      await updateProjectMutation.mutateAsync({
        id,
        data: {
          title: project.title,
          description: project.description,
          imageUrl: project.imageUrl,
          priority: project.priority,
          status: "ARCHIVED",
          dueDate: project.dueDate,
          ownerId: project.ownerId,
        },
      });
      toast.success("Project archived.");
    } catch {
      toast.error("Failed to archive project.");
    }
  };

  const handleUnarchive = async (id: string) => {
    const project = projects.find((p) => p.id === id);
    if (!project) return;
    try {
      await updateProjectMutation.mutateAsync({
        id,
        data: {
          title: project.title,
          description: project.description,
          imageUrl: project.imageUrl,
          priority: project.priority,
          status: "PENDING",
          dueDate: project.dueDate,
          ownerId: project.ownerId,
        },
      });
      toast.success("Project unarchived.");
    } catch {
      toast.error("Failed to unarchive project.");
    }
  };

  const counts = Object.fromEntries(TABS.map((t) => [t, projects.filter(inTab[t]).length])) as Record<Tab, number>;
  const statsFor = (id: string) => taskStats(tasksByProject.get(id));
  const progress = (p: ProjectType) => {
    const st = statsFor(p.id);
    return st?.total ? st.done / st.total : 0;
  };
  const compare: Record<Sort, (a: ProjectType, b: ProjectType) => number> = {
    attention: (a, b) =>
      HEALTH_RANK[projectHealth(a, statsFor(a.id))] - HEALTH_RANK[projectHealth(b, statsFor(b.id))] ||
      (a.dueDate ?? "9999").localeCompare(b.dueDate ?? "9999"),
    deadline: (a, b) => (a.dueDate ?? "9999").localeCompare(b.dueDate ?? "9999"),
    progress: (a, b) => progress(b) - progress(a),
    updated: (a, b) => (b.updatedAt ?? "").localeCompare(a.updatedAt ?? ""),
    name: (a, b) => a.title.localeCompare(b.title),
  };

  const q = query.trim().toLowerCase();
  const displayed = projects
    .filter((p) => inTab[activeTab](p) && (!q || p.title.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q)))
    .sort(compare[sort]);

  return (
    <PageContainer className="gap-5">
      {!isLoading && projects.length > 0 && <ProjectsOverview projects={projects} statsFor={statsFor} />}

      {/* Toolbar: segmented tabs + filter */}
      <div className="flex flex-wrap items-center gap-2">
        <div role="tablist" className="flex h-9 rounded-lg border border-border bg-card/60 p-0.5">
          {TABS.map((tab) => (
            <button
              key={tab}
              role="tab"
              aria-selected={activeTab === tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-ring",
                activeTab === tab
                  ? "bg-muted text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab}
              <span className="text-xs tabular-nums text-muted-foreground">
                {isLoading ? "–" : counts[tab]}
              </span>
            </button>
          ))}
        </div>

        <div className="ml-auto flex w-full items-center gap-2 sm:w-auto">
        <InlinePicker
          label="sort order"
          value={sort}
          options={SORTS}
          onChange={setSort}
          triggerClassName="flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-border bg-card/60 px-2.5 text-xs font-medium text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowUpDown className="h-3.5 w-3.5" />
          <span className="hidden md:inline">{SORTS.find((x) => x.value === sort)?.label}</span>
        </InlinePicker>
        <label className="relative flex-1 sm:w-64 sm:flex-none">
          <span className="sr-only">Filter projects</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter projects…"
            className="h-9 w-full rounded-lg border border-border bg-card/60 pl-8 pr-8 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear filter"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </label>

        <div className="flex h-9 shrink-0 rounded-lg border border-border bg-card/60 p-0.5" role="group" aria-label="View">
          {([
            { id: "grid", icon: LayoutGrid, label: "Card view" },
            { id: "list", icon: List, label: "List view" },
          ] as const).map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => changeView(id)}
              aria-pressed={view === id}
              aria-label={label}
              title={label}
              className={cn(
                "flex w-8 items-center justify-center rounded-md transition-colors focus-visible:outline-2 focus-visible:outline-ring",
                view === id ? "bg-muted text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
            </button>
          ))}
        </div>
        </div>
      </div>

      {isLoading ? (
        <div className={GRID}>
          {Array.from({ length: 4 }).map((_, i) => (
            <ProjectCardSkeleton key={i} />
          ))}
        </div>
      ) : displayed.length > 0 ? (
        view === "grid" ? (
          <div className={GRID}>
            {displayed.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                stats={statsFor(project.id)}
                onDelete={handleDelete}
                onArchive={handleArchive}
                onUnarchive={handleUnarchive}
              />
            ))}
          </div>
        ) : (
          <div className="@container overflow-hidden rounded-xl border border-border bg-card/60">
            <ProjectListHeader />
            {displayed.map((project) => (
              <ProjectRow
                key={project.id}
                project={project}
                stats={statsFor(project.id)}
                onDelete={handleDelete}
                onArchive={handleArchive}
                onUnarchive={handleUnarchive}
              />
            ))}
          </div>
        )
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border px-6 py-12 text-center">
          <FolderGit2 className="h-6 w-6 text-muted-foreground/50" />
          <div>
            <p className="text-sm font-medium">
              {q
                ? `No projects match "${query.trim()}"`
                : activeTab === "Archived"
                  ? "No archived projects"
                  : activeTab === "Completed"
                    ? "Nothing completed yet"
                    : "No active projects"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {q
                ? "Try a different name, or check the other tab."
                : activeTab === "Archived"
                  ? "Projects you archive from the card menu end up here."
                  : activeTab === "Completed"
                    ? "Mark a project as completed from its page and it moves here."
                    : "Create one to start tracking tasks and deadlines."}
            </p>
          </div>
          {!q && activeTab === "Active" && (
            <Link
              to="/projects/new"
              className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 active:scale-[0.98]"
            >
              New project
            </Link>
          )}
        </div>
      )}
    </PageContainer>
  );
};

export default Projects;
