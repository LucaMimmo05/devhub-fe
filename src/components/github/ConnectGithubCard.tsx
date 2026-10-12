import { useState } from "react";
import { SiGithub } from "react-icons/si";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiErrorMessage, startGithubConnect } from "@/utils/githubAuth";
import { toast } from "sonner";

/** Shown when GitHub isn't connected yet (or the server has no OAuth app configured). */
const ConnectGithubCard = ({ configured, compact = false }: { configured: boolean; compact?: boolean }) => {
  const [busy, setBusy] = useState(false);

  const connect = async () => {
    setBusy(true);
    try {
      await startGithubConnect();
    } catch (err) {
      setBusy(false);
      toast.error(apiErrorMessage(err, "Couldn't start the GitHub connection."));
    }
  };

  if (!configured) {
    return (
      <div className="mx-auto w-full max-w-lg rounded-xl border border-dashed border-border px-5 py-6 text-sm text-muted-foreground">
        <p className="font-medium text-foreground">GitHub isn't configured on this server</p>
        <p className="mt-1">
          Register an OAuth app on GitHub and set <code className="rounded bg-muted px-1 font-mono text-xs">GITHUB_CLIENT_ID</code> and{" "}
          <code className="rounded bg-muted px-1 font-mono text-xs">GITHUB_CLIENT_SECRET</code> on the backend.
        </p>
      </div>
    );
  }

  if (compact) {
    return (
      <Button size="sm" variant="outline" onClick={connect} disabled={busy} className="gap-2">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <SiGithub className="h-4 w-4" />}
        Connect GitHub
      </Button>
    );
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center rounded-xl border border-border bg-card/60 px-6 py-10 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
        <SiGithub className="h-7 w-7" />
      </span>
      <h2 className="mt-4 text-lg font-semibold">Connect your GitHub account</h2>
      <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
        Bring your repositories, commits and issues into DevHub, and link repos to your projects.
      </p>
      <ul className="mt-5 flex flex-col gap-2 text-left text-sm">
        {[
          "Your contribution graph and latest commits",
          "Repository details: languages, issues, pull requests",
          "Link a repository to a project and see it there",
        ].map((t) => (
          <li key={t} className="flex items-center gap-2">
            <Check className="h-4 w-4 shrink-0 text-emerald-400" /> {t}
          </li>
        ))}
      </ul>
      <Button onClick={connect} disabled={busy} className="mt-6 gap-2">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <SiGithub className="h-4 w-4" />}
        Connect GitHub
      </Button>
      <p className="mt-3 text-xs text-muted-foreground/70">
        Read access to your profile, email and repositories. You can disconnect at any time.
      </p>
    </div>
  );
};

export default ConnectGithubCard;
