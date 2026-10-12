import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { format, parseISO } from "date-fns";
import type { GithubContributions } from "@/types/githubType";
import { repoName } from "./githubUtils";
import { cn } from "@/lib/utils";

// GitHub's dark-theme greens, level 0 → 4.
const LEVELS = ["bg-[#161b22] ring-1 ring-inset ring-white/[0.04]", "bg-[#0e4429]", "bg-[#006d32]", "bg-[#26a641]", "bg-[#39d353]"];

type Day = { date: string; count: number; level: number };

const streaks = (days: Day[]) => {
  let longest = 0;
  let run = 0;
  for (const d of days) {
    run = d.count > 0 ? run + 1 : 0;
    longest = Math.max(longest, run);
  }
  // Current streak: today may still be empty, so start from yesterday in that case.
  let current = 0;
  let i = days.length - 1;
  if (i >= 0 && days[i].count === 0) i--;
  for (; i >= 0 && days[i].count > 0; i--) current++;
  return { longest, current };
};

const Heatmap = ({ data, onHover }: { data: GithubContributions; onHover: (d: Day | null) => void }) => {
  const scroller = useRef<HTMLDivElement>(null);
  const weeks = data.weeks.length;

  // Month label above the first week of each month (skipping a cramped label at the very start).
  const months = data.weeks.map((w, i) => {
    const first = w.days[0];
    if (!first) return null;
    const m = parseISO(first.date).getMonth();
    const prev = i > 0 ? data.weeks[i - 1].days[0] : null;
    if (prev && parseISO(prev.date).getMonth() === m) return null;
    if (i === 0 && w.days.length < 7 && weeks > 1) return null;
    return format(parseISO(first.date), "MMM");
  });

  // Newest weeks are on the right: on narrow screens start scrolled to the end.
  useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollLeft = el.scrollWidth;
  }, [data]);

  const columns = { gridTemplateColumns: `repeat(${weeks}, minmax(0, 1fr))` };

  return (
    <div ref={scroller} className="overflow-x-auto pb-1 [scrollbar-width:thin]">
      {/* Cells stretch with the card; below ~10px each it scrolls instead */}
      <div className="flex gap-2" style={{ minWidth: `calc(2rem + ${weeks} * 13px)` }}>
        <div className="grid w-6 shrink-0 grid-rows-7 gap-[3px] pt-5 text-[10px] text-muted-foreground">
          {["", "Mon", "", "Wed", "", "Fri", ""].map((d, i) => (
            <span key={i} className="flex items-center leading-none">{d}</span>
          ))}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <div className="grid h-3.5 gap-[3px] text-[10px] leading-none text-muted-foreground" style={columns}>
            {months.map((m, i) => (
              <span key={i} className="overflow-visible whitespace-nowrap">{m}</span>
            ))}
          </div>
          <div className="grid grid-flow-col grid-rows-7 gap-[3px]" style={columns} onMouseLeave={() => onHover(null)}>
            {data.weeks.flatMap((w, wi) => {
              // Place days by weekday so a partial first/last week lines up.
              const slots: (Day | null)[] = Array(7).fill(null);
              w.days.forEach((d) => {
                slots[parseISO(d.date).getDay()] = d;
              });
              return slots.map((d, di) =>
                d ? (
                  <span
                    key={`${wi}-${di}`}
                    aria-label={`${d.count} contributions on ${d.date}`}
                    onMouseEnter={() => onHover(d)}
                    className={cn(
                      "aspect-square rounded-[3px] outline outline-1 outline-transparent transition-[outline-color] hover:outline-foreground/60",
                      LEVELS[d.level] ?? LEVELS[0]
                    )}
                  />
                ) : (
                  <span key={`${wi}-${di}`} className="aspect-square" />
                )
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * The viewer's last year on GitHub: contributions by kind, the profile calendar, streaks and the
 * repositories they committed to most.
 */
const ContributionGraph = ({ data }: { data: GithubContributions }) => {
  const days = useMemo(() => data.weeks.flatMap((w) => w.days), [data]);
  const { longest, current } = useMemo(() => streaks(days), [days]);
  const [hovered, setHovered] = useState<Day | null>(null);
  const maxRepo = data.topRepos[0]?.commits ?? 1;

  const totals = [
    { label: "Commits", value: data.totals.commits },
    { label: "Pull requests", value: data.totals.pullRequests },
    { label: "Reviews", value: data.totals.reviews },
    { label: "Issues", value: data.totals.issues },
  ];

  return (
    <div className="grid gap-x-8 gap-y-6 xl:grid-cols-[minmax(0,1fr)_17rem]">
      <div className="flex min-w-0 flex-col gap-4">
        <div className="flex flex-wrap items-end gap-x-8 gap-y-3">
          <div>
            <p className="text-3xl font-semibold leading-none tracking-tight tabular-nums">{data.total.toLocaleString()}</p>
            <p className="mt-1.5 text-xs text-muted-foreground">contributions in the last year</p>
          </div>
          <dl className="flex flex-wrap gap-x-6 gap-y-2">
            {totals.map((t) => (
              <div key={t.label} className="flex flex-col-reverse">
                <dt className="mt-1.5 text-xs text-muted-foreground">{t.label}</dt>
                <dd className="text-base font-semibold leading-none tabular-nums">{t.value.toLocaleString()}</dd>
              </div>
            ))}
          </dl>
        </div>

        <Heatmap data={data} onHover={setHovered} />

        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-xs text-muted-foreground">
          <p className="tabular-nums" aria-live="polite">
            {hovered ? (
              <>
                <span className="font-medium text-foreground">
                  {hovered.count === 0 ? "No contributions" : `${hovered.count} contribution${hovered.count === 1 ? "" : "s"}`}
                </span>{" "}
                on {format(parseISO(hovered.date), "EEEE d MMMM")}
              </>
            ) : (
              <>
                Streak <span className={cn("font-medium", current > 0 ? "text-[#39d353]" : "text-foreground")}>{current}d</span>
                <span className="mx-2 text-border">|</span>
                Longest <span className="font-medium text-foreground">{longest}d</span>
                {data.totals.privateContributions > 0 && (
                  <>
                    <span className="mx-2 text-border">|</span>
                    <span className="font-medium text-foreground">{data.totals.privateContributions.toLocaleString()}</span> in private repos
                  </>
                )}
              </>
            )}
          </p>
          <span className="flex items-center gap-1 text-[10px]">
            Less
            {LEVELS.map((l, i) => (
              <span key={i} className={cn("h-2.5 w-2.5 rounded-[2px]", l)} />
            ))}
            More
          </span>
        </div>
      </div>

      {data.topRepos.length > 0 && (
        <div className="min-w-0 border-t border-border/60 pt-5 xl:border-l xl:border-t-0 xl:pl-6 xl:pt-0">
          <h3 className="text-xs font-medium text-muted-foreground">Most commits this year</h3>
          <ol className="mt-3 flex flex-col gap-2.5">
            {data.topRepos.map((r) => (
              <li key={r.repo} className="text-xs">
                <div className="flex items-baseline justify-between gap-2">
                  <Link to={`/github/repos/${r.repo}`} className="truncate font-medium transition-colors hover:text-primary">
                    {repoName(r.repo)}
                  </Link>
                  <span className="shrink-0 tabular-nums text-muted-foreground">{r.commits.toLocaleString()}</span>
                </div>
                <div className="mt-1 h-1 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-[#26a641]" style={{ width: `${(r.commits / maxRepo) * 100}%` }} />
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
};

export default ContributionGraph;
