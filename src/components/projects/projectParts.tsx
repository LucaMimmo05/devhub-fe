import type { ProjectType, ProjectMemberSummary } from "@/types/projectType";
import type { TaskStats } from "./projectUtils";
import { Ellipsis, Loader2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const ProjectAvatar = ({ project, size = "md" }: { project: ProjectType; size?: "sm" | "md" }) => {
  const box = size === "md" ? "h-11 w-11 text-base" : "h-8 w-8 text-xs";
  return project.imageUrl ? (
    <img src={project.imageUrl} alt="" className={cn("shrink-0 rounded-lg object-cover", box)} />
  ) : (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-lg bg-muted font-semibold text-muted-foreground",
        box
      )}
    >
      {project.title.charAt(0).toUpperCase()}
    </span>
  );
};

export const TaskProgress = ({ stats, className }: { stats?: TaskStats; className?: string }) => {
  if (!stats) {
    return <div className={cn("h-1.5 animate-pulse rounded-full bg-primary/10", className)} aria-hidden />;
  }
  const pct = stats.total ? Math.round((stats.done / stats.total) * 100) : 0;
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div
        className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Completed tasks"
      >
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-500",
            pct === 100 ? "bg-emerald-400" : "bg-primary"
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
        {stats.done}/{stats.total}
      </span>
    </div>
  );
};

export const MemberStack = ({ members, max = 3 }: { members: ProjectMemberSummary[]; max?: number }) => {
  if (members.length === 0) return null;
  return (
    <span className="flex shrink-0 -space-x-1.5" title={members.map((m) => m.username).join(", ")}>
      {members.slice(0, max).map((m) =>
        m.avatarUrl ? (
          <img
            key={m.profileId}
            src={m.avatarUrl}
            alt={m.username}
            className="h-6 w-6 rounded-md object-cover ring-2 ring-card"
          />
        ) : (
          <span
            key={m.profileId}
            className="flex h-6 w-6 items-center justify-center rounded-md bg-muted text-[10px] font-semibold uppercase text-foreground/80 ring-2 ring-card"
          >
            {(m.firstName?.[0] ?? m.username[0]) + (m.lastName?.[0] ?? "")}
          </span>
        )
      )}
      {members.length > max && (
        <span className="flex h-6 min-w-6 items-center justify-center rounded-md bg-muted px-1 text-[10px] font-semibold ring-2 ring-card">
          +{members.length - max}
        </span>
      )}
    </span>
  );
};

export type ProjectActions = {
  onDelete?: (id: string) => void | Promise<void>;
  onArchive?: (id: string) => void | Promise<void>;
  onUnarchive?: (id: string) => void | Promise<void>;
};

// "…" menu with archive/unarchive and a delete confirmation dialog.
// Sits above the card's stretched link, hence relative z-10.
export const ProjectMenu = ({
  project,
  onDelete,
  onArchive,
  onUnarchive,
  className,
}: ProjectActions & { project: ProjectType; className?: string }) => {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const isArchived = project.status === "ARCHIVED";

  const run = async (fn: (() => void | Promise<void>) | undefined, setBusy: (b: boolean) => void) => {
    setBusy(true);
    try {
      await fn?.();
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Actions for ${project.title}`}
            className={cn("relative z-10 h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground", className)}
          >
            <Ellipsis size={16} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {!isArchived ? (
            <DropdownMenuItem onClick={() => run(() => onArchive?.(project.id), setArchiving)} disabled={archiving}>
              {archiving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Archive project
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={() => run(() => onUnarchive?.(project.id), setArchiving)} disabled={archiving}>
              {archiving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Unarchive project
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setConfirmDelete(true)}>
            Delete project
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete project</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{project.title}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleting}
              onClick={async () => {
                await run(() => onDelete?.(project.id), setDeleting);
                setConfirmDelete(false);
              }}
            >
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
