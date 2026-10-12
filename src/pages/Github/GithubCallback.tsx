import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { SiGithub } from "react-icons/si";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { completeGithubConnect } from "@/services/githubService";
import { queryKeys } from "@/hooks/queries/keys";
import { apiErrorMessage, takeGithubReturnTo } from "@/utils/githubAuth";
import { toast } from "sonner";

/**
 * Where GitHub sends the user back after authorizing. Public route: the "login" flow has no session yet.
 * The flow is the first segment of the signed state ("connect" | "login").
 */
const GithubCallback = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { loginWithGithub } = useAuth();
  const [error, setError] = useState<string | null>(null);
  // An OAuth code works once; StrictMode runs effects twice in dev.
  const started = useRef(false);

  const code = params.get("code");
  const state = params.get("state") ?? "";
  const mode = state.split(".")[0] === "login" ? "login" : "connect";
  const denied = params.get("error");
  // Problems visible in the URL itself don't need the API round-trip.
  const urlError = denied === "access_denied"
    ? "You cancelled the authorization on GitHub."
    : denied || !code
      ? "GitHub didn't send an authorization code."
      : null;

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    if (urlError || !code) return;

    (async () => {
      try {
        if (mode === "login") {
          await loginWithGithub(code, state);
          toast.success("Signed in with GitHub");
          navigate("/", { replace: true });
        } else {
          const status = await completeGithubConnect(code, state);
          queryClient.setQueryData(queryKeys.github.status(), status);
          toast.success(`GitHub connected as @${status.login}`);
          navigate(takeGithubReturnTo("/github"), { replace: true });
        }
      } catch (err) {
        setError(apiErrorMessage(err, "Couldn't finish connecting to GitHub."));
      }
    })();
  }, [code, state, mode, urlError, loginWithGithub, navigate, queryClient]);

  const shownError = urlError ?? error;

  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card/60 p-6 text-center">
        <SiGithub className="mx-auto h-8 w-8 text-foreground/80" />
        {!shownError ? (
          <>
            <p className="mt-4 text-sm font-medium">
              {mode === "login" ? "Signing you in with GitHub…" : "Connecting your GitHub account…"}
            </p>
            <Loader2 className="mx-auto mt-4 h-5 w-5 animate-spin text-muted-foreground" />
          </>
        ) : (
          <>
            <p className="mt-4 text-sm font-medium">{mode === "login" ? "Couldn't sign in with GitHub" : "Couldn't connect GitHub"}</p>
            <p className="mt-1.5 text-sm text-muted-foreground">{shownError}</p>
            <Link
              to={mode === "login" ? "/auth/login" : "/github"}
              replace
              className="mt-5 inline-flex h-9 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {mode === "login" ? "Back to sign in" : "Back to GitHub"}
            </Link>
          </>
        )}
      </div>
    </main>
  );
};

export default GithubCallback;
