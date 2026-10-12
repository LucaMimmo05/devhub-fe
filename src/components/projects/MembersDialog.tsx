import { useEffect, useRef, useState } from "react";
import { Check, Loader2, Search, UserPlus, X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { searchUsers, type UserSearchResult } from "@/services/userService";
import { useAddProjectMember, useRemoveProjectMember } from "@/hooks/queries/useProjects";
import type { ProjectType } from "@/types/projectType";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { PersonAvatar } from "./TeamList";

type Props = {
  project: ProjectType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const MIN_QUERY = 2;

const MembersDialog = ({ project, open, onOpenChange }: Props) => {
  const addMember = useAddProjectMember();
  const removeMember = useRemoveProjectMember();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserSearchResult[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (open) {
      setQuery("");
      setResults(null);
    }
  }, [open]);

  const memberIds = new Set(project.members.map((m) => m.profileId));
  if (project.ownerProfileId) memberIds.add(project.ownerProfileId);

  const onSearch = (value: string) => {
    setQuery(value);
    if (timer.current) clearTimeout(timer.current);
    if (value.trim().length < MIN_QUERY) {
      setResults(null);
      setSearching(false);
      return;
    }
    setSearching(true);
    timer.current = setTimeout(async () => {
      try {
        setResults(await searchUsers(value.trim()));
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
  };

  const add = async (user: UserSearchResult) => {
    setBusyId(user.id);
    try {
      await addMember.mutateAsync({ projectId: project.id, profileId: user.id });
      toast.success(`@${user.username} added`);
    } catch {
      toast.error("Couldn't add the member.");
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (profileId: string, username: string) => {
    setBusyId(profileId);
    try {
      await removeMember.mutateAsync({ projectId: project.id, profileId });
      toast.success(`@${username} removed`);
    } catch {
      toast.error("Couldn't remove the member.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85dvh] w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-md">
        <DialogHeader className="px-5 pb-4 pt-5 text-left">
          <DialogTitle>Team</DialogTitle>
          <DialogDescription>Invite people by username. Members can add and edit their own tasks.</DialogDescription>
        </DialogHeader>

        <div className="px-5 pb-4">
          <label className="relative block">
            <span className="sr-only">Search users</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => onSearch(e.target.value)}
              placeholder="Search by username…"
              autoFocus
              className="h-10 w-full rounded-lg border border-border bg-background/40 pl-9 pr-9 text-sm outline-none placeholder:text-muted-foreground/60 focus-visible:ring-1 focus-visible:ring-ring"
            />
            {searching && (
              <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
            )}
          </label>
        </div>

        <div className="flex-1 overflow-y-auto border-t border-border/60">
          {/* Search results replace the member list while a query is active */}
          {results !== null ? (
            results.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-muted-foreground">No users match “{query.trim()}”.</p>
            ) : (
              <ul className="p-2">
                {results.map((u) => {
                  const already = memberIds.has(u.id);
                  return (
                    <li key={u.id} className="flex items-center gap-3 rounded-lg px-3 py-2">
                      <PersonAvatar firstName={u.firstName} lastName={u.lastName} username={u.username} avatarUrl={u.avatarUrl} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{u.firstName} {u.lastName}</p>
                        <p className="truncate text-xs text-muted-foreground">@{u.username}</p>
                      </div>
                      {already ? (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Check className="h-3.5 w-3.5" /> In team
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => add(u)}
                          disabled={busyId === u.id}
                          className="flex h-8 items-center gap-1.5 rounded-lg border border-border px-2.5 text-xs font-medium transition-colors hover:bg-muted active:scale-[0.98] disabled:opacity-60"
                        >
                          {busyId === u.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UserPlus className="h-3.5 w-3.5" />}
                          Add
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            )
          ) : (
            <ul className="p-2">
              {project.ownerUsername && (
                <li className="flex items-center gap-3 rounded-lg px-3 py-2">
                  <PersonAvatar username={project.ownerUsername} avatarUrl={project.ownerAvatarUrl} />
                  <p className="min-w-0 flex-1 truncate text-sm font-medium">@{project.ownerUsername}</p>
                  <span className="text-xs text-muted-foreground">Owner</span>
                </li>
              )}
              {project.members
                .filter((m) => m.role !== "OWNER")
                .map((m) => (
                  <li key={m.profileId} className="group flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-muted/40">
                    <PersonAvatar {...m} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{m.firstName} {m.lastName}</p>
                      <p className="truncate text-xs text-muted-foreground">@{m.username}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(m.profileId, m.username)}
                      disabled={busyId === m.profileId}
                      aria-label={`Remove @${m.username}`}
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive",
                        "sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
                      )}
                    >
                      {busyId === m.profileId ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                    </button>
                  </li>
                ))}
              {project.members.filter((m) => m.role !== "OWNER").length === 0 && (
                <li className="px-3 pb-4 pt-2 text-sm text-muted-foreground">
                  Just you so far. Search above to invite someone.
                </li>
              )}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MembersDialog;
