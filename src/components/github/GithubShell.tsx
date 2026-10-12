import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { SiGithub } from "react-icons/si";
import { ExternalLink, LogOut, MoreHorizontal, RefreshCw } from "lucide-react";
import PageContainer from "@/layouts/PageContainer";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ConnectGithubCard from "./ConnectGithubCard";
import { ago } from "./githubUtils";
import { useDisconnectGithub, useGithubStatus } from "@/hooks/queries/useGithub";
import { queryKeys } from "@/hooks/queries/keys";
import { apiErrorMessage } from "@/utils/githubAuth";
import type { GithubStatus } from "@/types/githubType";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const TABS = [
  { to: "/github", label: "Overview", end: true },
  { to: "/github/repos", label: "Repositories", end: true },
];

/**
 * Frame for the GitHub pages: account strip, Overview/Repositories tabs, refresh and disconnect.
 * Shows the connect card instead of the children until an account is connected.
 */
const GithubShell = ({ children }: { children: (status: GithubStatus) => React.ReactNode }) => {
  const queryClient = useQueryClient();
  const { data: status, isLoading } = useGithubStatus();
  const disconnect = useDisconnectGithub();
  const [refreshing, setRefreshing] = useState(false);

  if (isLoading) {
    return (
      <PageContainer className="gap-5">
        <div className="flex items-center gap-3" aria-hidden>
          <div className="h-10 w-10 animate-pulse rounded-xl bg-primary/10" />
          <div className="h-4 w-40 animate-pulse rounded bg-primary/10" />
        </div>
        <div className="h-56 animate-pulse rounded-xl bg-primary/10" aria-hidden />
      </PageContainer>
    );
  }

  if (!status?.connected) {
    return (
      <PageContainer className="justify-center py-10">
        <ConnectGithubCard configured={!!status?.configured} />
      </PageContainer>
    );
  }

  const refresh = async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: queryKeys.github.all });
    setRefreshing(false);
  };

  return (
    <PageContainer className="gap-5">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3 border-b border-border/60 pb-0">
        <div className="flex min-w-0 items-center gap-3 pb-3">
          {status.avatarUrl ? (
            <img src={status.avatarUrl} alt={status.login ?? "GitHub avatar"} className="h-9 w-9 rounded-lg ring-1 ring-border" />
          ) : (
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
              <SiGithub className="h-5 w-5" />
            </span>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold leading-tight">{status.name || status.login}</p>
            <a
              href={status.profileUrl ?? `https://github.com/${status.login}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              @{status.login} <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>

        <nav aria-label="GitHub sections" className="order-last flex w-full gap-1 sm:order-none sm:w-auto sm:self-end">
          {TABS.map((t) => (
            <NavLink
              key={t.to}
              to={t.to}
              end={t.end}
              className={({ isActive }) =>
                cn(
                  "relative px-3 pb-3 pt-1 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-ring",
                  isActive
                    ? "text-foreground after:absolute after:inset-x-2 after:-bottom-px after:h-0.5 after:rounded-full after:bg-primary"
                    : "text-muted-foreground hover:text-foreground"
                )
              }
            >
              {t.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1 pb-3">
          <Button size="sm" variant="ghost" className="h-8 gap-1.5 text-muted-foreground" onClick={refresh} disabled={refreshing}>
            <RefreshCw className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-muted-foreground" aria-label="GitHub account options">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {status.connectedAt && (
                <>
                  <p className="px-2 py-1.5 text-xs text-muted-foreground">Connected {ago(status.connectedAt)}</p>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                disabled={disconnect.isPending}
                onSelect={() =>
                  disconnect.mutate(undefined, {
                    onSuccess: () => toast.success("GitHub disconnected"),
                    onError: (err) => toast.error(apiErrorMessage(err, "Couldn't disconnect GitHub.")),
                  })
                }
              >
                <LogOut className="h-4 w-4" /> Disconnect GitHub
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {children(status)}
    </PageContainer>
  );
};

export default GithubShell;
