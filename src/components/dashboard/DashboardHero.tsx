import { Link } from "react-router-dom";
import { format } from "date-fns";
import { FilePlus2, ListPlus, Search } from "lucide-react";
import { cn } from "@/lib/utils";

type Stat = { label: string; value?: number; tone?: "danger" | "primary" | "success"; to: string };

const toneClass = { danger: "text-red-400", primary: "text-primary", success: "text-emerald-400" };

const openSearch = () => window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true }));

/**
 * Top of the home: greeting, a one-line read of the day, quick actions and the key numbers,
 * on the same ambient surface as the sign-in page.
 */
const DashboardHero = ({
  name,
  summary,
  stats,
  weekDone,
  weekTotal,
}: {
  name?: string;
  summary: React.ReactNode;
  stats: Stat[];
  weekDone: number;
  weekTotal: number;
}) => {
  const now = new Date();
  const hour = now.getHours();
  const hello = hour < 5 ? "Working late" : hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const pct = weekTotal ? Math.round((weekDone / weekTotal) * 100) : 0;

  return (
    <section className="relative overflow-hidden rounded-2xl border border-border/80 bg-[#0d1526]">
      {/* Ambient light + fine grid, like the auth showcase */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_90%_at_0%_0%,rgba(59,130,246,0.20),transparent_60%),radial-gradient(ellipse_40%_70%_at_100%_100%,rgba(57,211,83,0.07),transparent_60%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:linear-gradient(to_right,black,transparent_75%)]" />

      <div className="relative grid gap-6 p-5 sm:p-7 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">{format(now, "EEEE d MMMM")}</p>
          <h1 className="mt-2 text-balance text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            {hello}
            {name ? <>, <span className="text-primary">{name}</span></> : null}.
          </h1>
          <p className="mt-2 max-w-[60ch] text-pretty text-[15px] leading-relaxed text-muted-foreground">{summary}</p>

          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              to="/tasks/new"
              className="flex h-9 items-center gap-2 rounded-lg bg-primary px-3.5 text-sm font-medium text-primary-foreground shadow-sm shadow-primary/25 transition-all hover:bg-primary/90 active:scale-[0.98]"
            >
              <ListPlus className="h-4 w-4" /> New task
            </Link>
            <Link
              to="/notes/new"
              className="flex h-9 items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3.5 text-sm font-medium transition-all hover:bg-white/[0.08] active:scale-[0.98]"
            >
              <FilePlus2 className="h-4 w-4" /> New note
            </Link>
            <button
              type="button"
              onClick={openSearch}
              className="hidden h-9 items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3.5 text-sm text-muted-foreground sm:flex transition-all hover:bg-white/[0.08] hover:text-foreground active:scale-[0.98]"
            >
              <Search className="h-4 w-4" /> Search
              <kbd className="ml-1 rounded border border-white/10 px-1.5 font-sans text-[10px]">Ctrl K</kbd>
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-4 lg:min-w-[22rem]">
          {/* 1px gaps over a tinted backdrop draw the dividers, in 2×2 or 1×4 */}
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-white/[0.07] bg-white/[0.07] sm:grid-cols-4">
            {stats.map((s) => (
              <Link key={s.label} to={s.to} className="group bg-[#0f1729] px-3 py-3 transition-colors hover:bg-[#141e33]">
                <dd className={cn("text-2xl font-semibold leading-none tracking-tight tabular-nums", s.value && s.tone ? toneClass[s.tone] : "")}>
                  {s.value ?? <span className="inline-block h-6 w-6 animate-pulse rounded bg-white/10 align-middle" />}
                </dd>
                <dt className="mt-1.5 truncate text-[11px] text-muted-foreground group-hover:text-foreground">{s.label}</dt>
              </Link>
            ))}
          </dl>
          <div>
            <div className="flex items-baseline justify-between text-xs">
              <span className="text-muted-foreground">Done this week</span>
              <span className="tabular-nums text-muted-foreground">
                <span className="font-semibold text-foreground">{weekDone}</span> / {weekTotal}
              </span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
              <div className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-400 transition-[width] duration-700" style={{ width: `${pct}%` }} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DashboardHero;
