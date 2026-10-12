import { Link } from "react-router-dom";
import { addDays, differenceInCalendarDays, format } from "date-fns";
import type { ProjectType } from "@/types/projectType";
import { HEALTH, projectAccent, projectHealth, type TaskStats } from "./projectUtils";
import { cn } from "@/lib/utils";

const HORIZON = 60;

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

/**
 * Portfolio at a glance: how many projects are moving, which need attention, and a 60-day
 * runway of upcoming deadlines.
 */
const ProjectsOverview = ({ projects, statsFor }: { projects: ProjectType[]; statsFor: (id: string) => TaskStats | undefined }) => {
  const active = projects.filter((p) => p.status === "PENDING" || p.status === "IN_PROGRESS");
  const health = active.map((p) => ({ p, h: projectHealth(p, statsFor(p.id)) }));
  const attention = health.filter(({ h }) => h === "at-risk" || h === "overdue");
  const tasks = active.reduce(
    (acc, p) => {
      const s = statsFor(p.id);
      return s ? { done: acc.done + s.done, total: acc.total + s.total } : acc;
    },
    { done: 0, total: 0 }
  );
  const upcoming = active
    .filter((p) => p.dueDate)
    .map((p) => ({ p, days: differenceInCalendarDays(new Date(p.dueDate!), new Date()) }))
    .filter(({ days }) => days <= HORIZON)
    .sort((a, b) => a.days - b.days);
  const dueSoon = upcoming.filter(({ days }) => days >= 0 && days <= 30).length;

  const summary =
    active.length === 0
      ? "No active projects. Start one, or bring an archived one back."
      : attention.length > 0
        ? <>
            {plural(active.length, "active project")},{" "}
            <span className="font-medium text-amber-400">{attention.length} need{attention.length === 1 ? "s" : ""} attention</span>
            {dueSoon > 0 && <> and {dueSoon} due within a month</>}.
          </>
        : <>{plural(active.length, "active project")}, all on track{dueSoon > 0 && <> — {dueSoon} due within a month</>}.</>;

  const stats = [
    { label: "Active", value: active.length },
    { label: "Need attention", value: attention.length, tone: attention.length ? "text-amber-400" : "" },
    { label: "Due in 30 days", value: dueSoon },
    { label: "Tasks done", value: tasks.total ? `${Math.round((tasks.done / tasks.total) * 100)}%` : "–", hint: `${tasks.done}/${tasks.total}` },
  ];

  return (
    <section className="relative overflow-hidden rounded-2xl border border-border/80 bg-[#0d1526]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_90%_at_0%_0%,rgba(59,130,246,0.16),transparent_60%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:linear-gradient(to_right,black,transparent_70%)]" />

      <div className="relative grid gap-6 p-5 sm:p-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] xl:items-center">
        <div className="min-w-0">
          <p className="max-w-[55ch] text-pretty text-[15px] leading-relaxed text-muted-foreground">{summary}</p>
          <dl className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-white/[0.07] bg-white/[0.07] sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="flex flex-col-reverse bg-[#0f1729] px-3 py-3">
                <dt className="mt-1.5 truncate text-[11px] text-muted-foreground">
                  {s.label}
                  {s.hint && <span className="ml-1 tabular-nums opacity-60">{s.hint}</span>}
                </dt>
                <dd className={cn("text-2xl font-semibold leading-none tracking-tight tabular-nums", s.tone)}>{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Deadline runway: today on the left, 60 days out on the right */}
        <div className="min-w-0">
          <div className="flex items-baseline justify-between text-xs">
            <span className="font-medium">Upcoming deadlines</span>
            <span className="text-muted-foreground">next {HORIZON} days</span>
          </div>
          <div className="relative mt-4 h-8">
            <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-white/10" />
            {[0, 15, 30, 45, 60].map((d) => (
              <span key={d} className="absolute top-1/2 h-2 w-px -translate-y-1/2 bg-white/15" style={{ left: `${(d / HORIZON) * 100}%` }} />
            ))}
            {upcoming.map(({ p, days }) => {
              const left = Math.min(100, Math.max(0, (days / HORIZON) * 100));
              const accent = projectAccent(p.id);
              return (
                <Link
                  key={p.id}
                  to={`/projects/${p.id}`}
                  title={`${p.title} · ${format(new Date(p.dueDate!), "d MMM")}`}
                  className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-[#0d1526] transition-transform hover:scale-125"
                  style={{ left: `${left}%`, backgroundColor: days < 0 ? "#f87171" : accent }}
                />
              );
            })}
          </div>
          <div className="mt-1 flex justify-between text-[10px] tabular-nums text-muted-foreground">
            <span>Today</span>
            <span>{format(addDays(new Date(), 30), "d MMM")}</span>
            <span>{format(addDays(new Date(), HORIZON), "d MMM")}</span>
          </div>

          <ul className="mt-3 flex flex-col gap-1">
            {upcoming.slice(0, 3).map(({ p, days }) => {
              const h = HEALTH[projectHealth(p, statsFor(p.id))];
              return (
                <li key={p.id}>
                  <Link to={`/projects/${p.id}`} className="flex items-center gap-2.5 rounded-md px-1.5 py-1 text-sm transition-colors hover:bg-white/[0.04]">
                    <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: projectAccent(p.id) }} />
                    <span className="min-w-0 flex-1 truncate">{p.title}</span>
                    <span className={cn("text-[11px] font-medium", h.className.split(" ")[0])}>{h.label}</span>
                    <span className={cn("w-16 shrink-0 text-right text-xs tabular-nums", days < 0 ? "text-red-400" : days <= 7 ? "text-amber-400" : "text-muted-foreground")}>
                      {days < 0 ? `${-days}d late` : days === 0 ? "today" : `in ${days}d`}
                    </span>
                  </Link>
                </li>
              );
            })}
            {upcoming.length === 0 && <li className="px-1.5 py-1 text-sm text-muted-foreground">No deadlines in the next {HORIZON} days.</li>}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default ProjectsOverview;
