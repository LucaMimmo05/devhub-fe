import { useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { KeyRound, LayoutGrid, List, Loader2, LogOut, Mail, TriangleAlert } from "lucide-react";
import PageContainer from "@/layouts/PageContainer";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/context/AuthContext";
import { deleteMyAccount, getMyProfile, updateMyProfile, type MyProfile } from "@/services/userService";
import { resetPassword, sendPasswordCode } from "@/services/authService";
import { cn } from "@/lib/utils";
import { SiGithub } from "react-icons/si";
import ConnectGithubCard from "@/components/github/ConnectGithubCard";
import { useDisconnectGithub, useGithubStatus } from "@/hooks/queries/useGithub";
import { toast } from "sonner";

const ME_KEY = ["users", "me"] as const;
const VIEW_KEY = "devhub.projects.view"; // shared with the Projects page

const field =
  "h-9 w-full rounded-lg border border-border bg-background/40 px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground/50 focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60";
const label = "text-xs font-medium text-muted-foreground";

const errorMessage = (err: unknown, fallback: string) =>
  (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? fallback;

/** One settings block: title + explanation on the left, controls on the right (stacked on phones). */
const Section = ({
  title,
  description,
  children,
  tone,
}: {
  title: string;
  description: string;
  children: ReactNode;
  tone?: "danger";
}) => (
  <section
    className={cn(
      "grid gap-x-10 gap-y-4 border-t py-8 first:border-t-0 first:pt-2 md:grid-cols-[14rem_minmax(0,1fr)]",
      tone === "danger" ? "border-destructive/30" : "border-border/60"
    )}
  >
    <div>
      <h2 className={cn("text-sm font-semibold", tone === "danger" && "text-destructive")}>{title}</h2>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{description}</p>
    </div>
    <div className="min-w-0">{children}</div>
  </section>
);

const Avatar = ({ profile, url }: { profile?: MyProfile; url: string }) => {
  const [broken, setBroken] = useState<string | null>(null);
  const initials = `${profile?.firstName?.[0] ?? ""}${profile?.lastName?.[0] ?? ""}` || profile?.username?.slice(0, 2) || "?";
  return url && broken !== url ? (
    <img src={url} alt="" onError={() => setBroken(url)} className="h-16 w-16 shrink-0 rounded-xl object-cover" />
  ) : (
    <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-muted text-lg font-semibold uppercase text-foreground/80">
      {initials}
    </span>
  );
};

const ProfileSection = ({ profile }: { profile: MyProfile }) => {
  const queryClient = useQueryClient();
  const { updateUser } = useAuth();
  const [firstName, setFirstName] = useState(profile.firstName ?? "");
  const [lastName, setLastName] = useState(profile.lastName ?? "");
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl ?? "");

  const dirty =
    firstName.trim() !== (profile.firstName ?? "") ||
    lastName.trim() !== (profile.lastName ?? "") ||
    avatarUrl.trim() !== (profile.avatarUrl ?? "");
  const urlInvalid = avatarUrl.trim() !== "" && !/^https?:\/\/\S+$/i.test(avatarUrl.trim());
  const nameMissing = !firstName.trim() || !lastName.trim();

  const save = useMutation({
    mutationFn: () =>
      updateMyProfile({ firstName: firstName.trim(), lastName: lastName.trim(), avatarUrl: avatarUrl.trim() }),
    onSuccess: (updated: MyProfile) => {
      queryClient.setQueryData<MyProfile>(ME_KEY, (old) => ({ ...old, ...updated, email: old?.email }));
      // Keep the sidebar, greeting and session copy in sync.
      updateUser({ firstName: updated.firstName, lastName: updated.lastName, avatarUrl: updated.avatarUrl });
      toast.success("Profile saved");
    },
    onError: (err) => toast.error(errorMessage(err, "Couldn't save your profile.")),
  });

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={(e) => {
        e.preventDefault();
        if (dirty && !urlInvalid && !nameMissing) save.mutate();
      }}
    >
      <div className="flex items-center gap-4">
        <Avatar profile={{ ...profile, firstName, lastName }} url={avatarUrl.trim()} />
        <div className="min-w-0 flex-1">
          <label htmlFor="s-avatar" className={label}>Avatar URL</label>
          <input
            id="s-avatar"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            maxLength={255}
            placeholder="https://github.com/your-name.png"
            aria-invalid={urlInvalid}
            className={cn(field, "mt-1.5", urlInvalid && "border-destructive/60")}
          />
          <p className={cn("mt-1 text-xs", urlInvalid ? "text-destructive" : "text-muted-foreground/70")}>
            {urlInvalid ? "Use a full http(s) image link." : "Leave empty to show your initials."}
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="s-first" className={label}>First name</label>
          <input id="s-first" value={firstName} onChange={(e) => setFirstName(e.target.value)} maxLength={100} className={field} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="s-last" className={label}>Last name</label>
          <input id="s-last" value={lastName} onChange={(e) => setLastName(e.target.value)} maxLength={100} className={field} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="s-user" className={label}>Username</label>
          <input id="s-user" value={`@${profile.username}`} disabled className={field} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="s-email" className={label}>Email</label>
          <input id="s-email" value={profile.email ?? ""} disabled className={field} />
        </div>
      </div>
      {nameMissing && <p className="-mt-2 text-xs text-destructive">First and last name can't be empty.</p>}

      <div className="flex items-center justify-end gap-3">
        <p className="mr-auto text-xs text-muted-foreground/70">Username and email can't be changed.</p>
        {dirty && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setFirstName(profile.firstName ?? "");
              setLastName(profile.lastName ?? "");
              setAvatarUrl(profile.avatarUrl ?? "");
            }}
          >
            Discard
          </Button>
        )}
        <Button type="submit" size="sm" disabled={!dirty || urlInvalid || nameMissing || save.isPending}>
          {save.isPending && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
          Save profile
        </Button>
      </div>
    </form>
  );
};

const PasswordSection = ({ email }: { email?: string }) => {
  const [step, setStep] = useState<"idle" | "code">("idle");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const send = useMutation({
    mutationFn: () => sendPasswordCode(email!),
    onSuccess: () => {
      setStep("code");
      toast.success(`Code sent to ${email}`);
    },
    onError: (err) => toast.error(errorMessage(err, "Couldn't send the code. Try again in a minute.")),
  });

  const tooShort = password.length > 0 && password.length < 8;
  const mismatch = confirm.length > 0 && confirm !== password;
  const canSubmit = /^\d{6}$/.test(code) && password.length >= 8 && confirm === password;

  const reset = useMutation({
    mutationFn: () => resetPassword(email!, code, password),
    onSuccess: () => {
      toast.success("Password updated");
      setStep("idle");
      setCode("");
      setPassword("");
      setConfirm("");
    },
    onError: (err) => toast.error(errorMessage(err, "Invalid or expired code.")),
  });

  if (step === "idle") {
    return (
      <div className="flex flex-col items-start gap-3 rounded-xl border border-border bg-card/60 p-4 sm:flex-row sm:items-center">
        <KeyRound className="h-5 w-5 shrink-0 text-muted-foreground" />
        <p className="flex-1 text-sm text-muted-foreground">
          We'll email a 6-digit code to <span className="font-medium text-foreground">{email ?? "your address"}</span> to confirm it's you.
        </p>
        <Button size="sm" variant="outline" onClick={() => send.mutate()} disabled={!email || send.isPending}>
          {send.isPending ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Mail className="mr-1.5 h-3.5 w-3.5" />}
          Send code
        </Button>
      </div>
    );
  }

  return (
    <form
      className="flex flex-col gap-4 rounded-xl border border-border bg-card/60 p-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (canSubmit) reset.mutate();
      }}
    >
      <div className="flex flex-col gap-1.5">
        <label htmlFor="s-code" className={label}>Code from the email</label>
        <input
          id="s-code"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          inputMode="numeric"
          autoComplete="one-time-code"
          autoFocus
          placeholder="123456"
          className={cn(field, "w-36 font-mono tracking-[0.3em]")}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="s-pass" className={label}>New password</label>
          <input
            id="s-pass"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={tooShort}
            className={cn(field, tooShort && "border-destructive/60")}
          />
          <p className={cn("text-xs", tooShort ? "text-destructive" : "text-muted-foreground/70")}>At least 8 characters.</p>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="s-confirm" className={label}>Repeat password</label>
          <input
            id="s-confirm"
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            aria-invalid={mismatch}
            className={cn(field, mismatch && "border-destructive/60")}
          />
          {mismatch && <p className="text-xs text-destructive">Passwords don't match.</p>}
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => send.mutate()}
          disabled={send.isPending}
          className="mr-auto text-xs font-medium text-muted-foreground transition-colors hover:text-foreground disabled:opacity-60"
        >
          {send.isPending ? "Sending…" : "Resend code"}
        </button>
        <Button type="button" variant="ghost" size="sm" onClick={() => setStep("idle")}>Cancel</Button>
        <Button type="submit" size="sm" disabled={!canSubmit || reset.isPending}>
          {reset.isPending && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
          Update password
        </Button>
      </div>
    </form>
  );
};

const PreferencesSection = () => {
  const read = () => {
    try {
      return localStorage.getItem(VIEW_KEY) === "list" ? "list" : "grid";
    } catch {
      return "grid";
    }
  };
  const [view, setView] = useState<"grid" | "list">(read);
  const choose = (v: "grid" | "list") => {
    setView(v);
    try {
      localStorage.setItem(VIEW_KEY, v);
    } catch {
      // Storage unavailable: the choice just won't persist.
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      <span className={label}>Projects page</span>
      <div role="radiogroup" aria-label="Projects view" className="flex h-9 w-fit rounded-lg border border-border bg-card/60 p-0.5">
        {([
          { id: "grid", label: "Cards", icon: LayoutGrid },
          { id: "list", label: "List", icon: List },
        ] as const).map(({ id, label: text, icon: Icon }) => (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={view === id}
            onClick={() => choose(id)}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-ring",
              view === id ? "bg-muted text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="h-3.5 w-3.5" /> {text}
          </button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground/70">Saved on this device. You can also switch from the Projects page.</p>
    </div>
  );
};

const GithubAccountRow = () => {
  const { data: status, isLoading } = useGithubStatus();
  const disconnect = useDisconnectGithub();
  if (isLoading) return <div className="h-14 animate-pulse rounded-xl bg-primary/10" />;
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card/60 p-4">
      {status?.connected && status.avatarUrl ? (
        <img src={status.avatarUrl} alt="" className="h-9 w-9 rounded-full" />
      ) : (
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-muted"><SiGithub className="h-4.5 w-4.5" /></span>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">GitHub</p>
        <p className="truncate text-xs text-muted-foreground">
          {status?.connected ? `Connected as @${status.login}` : status?.configured ? "Not connected" : "Not available on this server"}
        </p>
      </div>
      {status?.connected ? (
        <Button
          size="sm"
          variant="outline"
          disabled={disconnect.isPending}
          onClick={() =>
            disconnect.mutate(undefined, {
              onSuccess: () => toast.success("GitHub disconnected"),
              onError: (err) => toast.error(errorMessage(err, "Couldn't disconnect GitHub.")),
            })
          }
        >
          Disconnect
        </Button>
      ) : status?.configured ? (
        <ConnectGithubCard configured compact />
      ) : null}
    </div>
  );
};

const DangerSection = ({ username }: { username: string }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");

  const remove = useMutation({
    mutationFn: deleteMyAccount,
    onSuccess: async () => {
      toast.success("Your account has been deleted");
      await logout();
      navigate("/auth/login", { replace: true });
    },
    onError: (err) => toast.error(errorMessage(err, "Couldn't delete the account.")),
  });

  return (
    <>
      <div className="flex flex-col items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 sm:flex-row sm:items-center">
        <TriangleAlert className="h-5 w-5 shrink-0 text-destructive" />
        <p className="flex-1 text-sm text-muted-foreground">
          Deletes your account with all your projects, tasks, notes and commands. This can't be undone.
        </p>
        <Button size="sm" variant="destructive" onClick={() => { setTyped(""); setOpen(true); }}>
          Delete account
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[calc(100%-2rem)] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete your account?</DialogTitle>
            <DialogDescription>
              Everything you own in DevHub is removed for good. Type <span className="font-mono font-medium text-foreground">{username}</span> to confirm.
            </DialogDescription>
          </DialogHeader>
          <input
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            autoFocus
            aria-label="Type your username to confirm"
            placeholder={username}
            className={cn(field, "font-mono")}
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="destructive" disabled={typed !== username || remove.isPending} onClick={() => remove.mutate()}>
              {remove.isPending && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
              Delete everything
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

const Settings = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { data: profile, isLoading, isError } = useQuery({ queryKey: ME_KEY, queryFn: getMyProfile });

  return (
    <PageContainer>
      <div className="mx-auto w-full max-w-4xl">
        <Section title="Profile" description="How you appear to teammates on shared projects and tasks.">
          {isLoading ? (
            <div className="flex flex-col gap-4" aria-hidden>
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 animate-pulse rounded-xl bg-primary/10" />
                <div className="h-9 flex-1 animate-pulse rounded-lg bg-primary/10" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-9 animate-pulse rounded-lg bg-primary/10" />)}
              </div>
            </div>
          ) : isError || !profile ? (
            <p className="text-sm text-destructive">Couldn't load your profile. Refresh the page to try again.</p>
          ) : (
            <ProfileSection key={profile.id + (profile.firstName ?? "") + (profile.avatarUrl ?? "")} profile={profile} />
          )}
        </Section>

        <Section title="Password" description="Change it any time. We confirm by email first, so nobody at your keyboard can do it for you.">
          <PasswordSection email={profile?.email} />
        </Section>

        <Section title="Connected accounts" description="Sign in with GitHub and bring its repositories into your projects.">
          <GithubAccountRow />
        </Section>

        <Section title="Preferences" description="Small defaults that make the app work the way you like.">
          <PreferencesSection />
        </Section>

        <Section title="Session" description="Sign out of DevHub on this browser.">
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              await logout();
              navigate("/auth/login", { replace: true });
            }}
          >
            <LogOut className="mr-1.5 h-3.5 w-3.5" /> Sign out
          </Button>
        </Section>

        <Section title="Danger zone" description="Irreversible actions on your account." tone="danger">
          {profile ? <DangerSection username={profile.username} /> : <div className="h-16 animate-pulse rounded-xl bg-primary/10" />}
        </Section>

      </div>
    </PageContainer>
  );
};

export default Settings;
