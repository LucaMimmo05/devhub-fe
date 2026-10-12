import { CheckCircle2, Circle, FileText, GitPullRequest, Terminal } from "lucide-react";
import Logo from "@/assets/Logo";

// A frozen slice of the real app: what you get after signing in. Purely decorative.
const TASKS = [
  { title: "Fix token refresh race on cold start", done: true, tag: "High", tone: "text-red-400 bg-red-500/10" },
  { title: "Compact dashboard layout", done: false, tag: "Medium", tone: "text-amber-400 bg-amber-500/10" },
  { title: "Inbox for review requests", done: false, tag: "Low", tone: "text-emerald-400 bg-emerald-500/10" },
];

// 30 weeks × 7 days of a believable contribution rhythm.
const WEEKS = 30;
const LEVELS = ["bg-white/[0.05]", "bg-[#0e4429]", "bg-[#006d32]", "bg-[#26a641]", "bg-[#39d353]"];
const cells = Array.from({ length: WEEKS * 7 }, (_, i) => {
  const day = i % 7;
  const n = Math.abs(Math.sin(i * 12.9898) * 43758.5453) % 1;
  if (day === 0 || day === 6) return n > 0.7 ? 1 : 0;
  return n < 0.2 ? 0 : n < 0.45 ? 1 : n < 0.7 ? 2 : n < 0.9 ? 3 : 4;
});

const AuthShowcase = () => (
  <aside className="relative hidden overflow-hidden border-r border-border/60 bg-[#0b1220] lg:flex lg:flex-col" aria-hidden>
    {/* Ambient light + fine grid, fading toward the bottom */}
    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_20%_0%,rgba(59,130,246,0.18),transparent_60%),radial-gradient(ellipse_60%_50%_at_90%_100%,rgba(57,211,83,0.08),transparent_60%)]" />
    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:44px_44px] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />

    <div className="relative flex flex-1 flex-col px-12 py-10 xl:px-16">
      <Logo size="xs" className="h-auto w-24" />

      <div className="mt-auto max-w-lg pt-10">
        <h2 className="text-balance text-4xl font-semibold leading-[1.1] tracking-tight xl:text-[2.75rem]">
          Projects, tasks, notes and GitHub.
          <span className="text-muted-foreground"> In one place.</span>
        </h2>
        <p className="mt-4 max-w-md text-pretty text-[15px] leading-relaxed text-muted-foreground">
          Plan the work, keep the snippets you always forget, and see what needs your review — without
          switching between five tabs.
        </p>
      </div>

      {/* Product preview: overlapping cards in normal flow, so it never spills out of the panel */}
      <div className="relative mt-10 max-w-xl pb-2">
        <div className="relative z-0 mr-16 rounded-xl border border-white/10 bg-[#111a2c]/90 p-4 shadow-2xl shadow-black/40 backdrop-blur">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold">Today · DevHub</p>
            <span className="text-[11px] text-muted-foreground">1 of 3 done</span>
          </div>
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/[0.06]">
            <div className="h-full w-1/3 rounded-full bg-primary" />
          </div>
          <ul className="mt-3 flex flex-col gap-1">
            {TASKS.map((t) => (
              <li key={t.title} className="flex items-center gap-2.5 rounded-md px-1.5 py-1.5">
                {t.done ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <Circle className="h-4 w-4 text-muted-foreground/60" />}
                <span className={`flex-1 truncate text-[13px] ${t.done ? "text-muted-foreground line-through" : ""}`}>{t.title}</span>
                <span className={`rounded px-1.5 py-px text-[10px] font-medium ${t.tone}`}>{t.tag}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative z-10 -mt-5 ml-10 mr-4 rounded-xl border border-white/10 bg-[#111a2c]/95 p-4 shadow-2xl shadow-black/50 backdrop-blur">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-semibold">1,946 contributions</span>
            <span className="flex items-center gap-1 text-amber-400"><GitPullRequest className="h-3 w-3" /> 2 reviews waiting</span>
          </div>
          <div className="mt-2.5 grid grid-flow-col grid-rows-7 gap-[3px]" style={{ gridTemplateColumns: `repeat(${WEEKS}, minmax(0, 1fr))` }}>
            {cells.map((l, i) => (
              <span key={i} className={`aspect-square rounded-[2px] ${LEVELS[l]}`} />
            ))}
          </div>
        </div>

        <div className="absolute -right-2 top-16 z-20 w-44 rotate-2 rounded-xl border border-white/10 bg-[#111a2c] p-3 shadow-2xl shadow-black/50 xl:right-0">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold"><Terminal className="h-3 w-3 text-primary" /> Commands</p>
          <code className="mt-2 block truncate rounded bg-black/40 px-2 py-1 font-mono text-[10px] text-emerald-300">git rebase -i HEAD~3</code>
          <p className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground"><FileText className="h-3 w-3" /> 🚀 Release checklist</p>
        </div>
      </div>
    </div>
  </aside>
);

export default AuthShowcase;
