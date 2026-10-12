import { useEffect, useMemo, useRef } from "react";
import { format, parseISO } from "date-fns";
import type { GithubContributions } from "@/types/githubType";
import { cn } from "@/lib/utils";

// GitHub's dark-theme greens, level 0 → 4.
const LEVELS = ["bg-[#161b22] border border-white/[0.04]", "bg-[#0e4429]", "bg-[#006d32]", "bg-[#26a641]", "bg-[#39d353]"];

type Day = { date: string; count: number; level: number };

const stats = (days: Day[]) => {
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
  const best = days.reduce<Day | null>((b, d) => (!b || d.count > b.count ? d : b), null);
  return { longest, current, best };
};

/** The contribution calendar from a GitHub profile: one column per week, Sunday on top. */
const ContributionGraph = ({ data }: { data: GithubContributions }) => {
  const scroller = useRef<HTMLDivElement>(null);
  const days = useMemo(() => data.weeks.flatMap((w) => w.days), [data]);
  const { longest, current, best } = useMemo(() => stats(days), [days]);

  // Month label above the first week of each month (skipping a cramped label at the very start).
  const months = data.weeks.map((w, i) => {
    const first = w.days[0];
    if (!first) return null;
    const m = parseISO(first.date).getMonth();
    const prev = i > 0 ? data.weeks[i - 1].days[0] : null;
    if (prev && parseISO(prev.date).getMonth() === m) return null;
    if (i === 0 && w.days.length < 7 && data.weeks.length > 1) return null;
    return format(parseISO(first.date), "MMM");
  });

  // Newest weeks are on the right: on narrow screens start scrolled to the end.
  useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollLeft = el.scrollWidth;
  }, [data]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
        <p className="text-sm">
          <span className="text-2xl font-semibold tabular-nums">{data.total.toLocaleString()}</span>{" "}
          <span className="text-muted-foreground">contributions in the last year</span>
        </p>
        <dl className="flex gap-5 text-xs text-muted-foreground">
          <div>
            <dt className="inline">Current streak </dt>
            <dd className="inline font-medium tabular-nums text-foreground">{current}d</dd>
          </div>
          <div>
            <dt className="inline">Longest </dt>
            <dd className="inline font-medium tabular-nums text-foreground">{longest}d</dd>
          </div>
          {best && best.count > 0 && (
            <div className="hidden sm:block">
              <dt className="inline">Best day </dt>
              <dd className="inline font-medium tabular-nums text-foreground">
                {best.count} on {format(parseISO(best.date), "d MMM")}
              </dd>
            </div>
          )}
        </dl>
      </div>

      <div ref={scroller} className="overflow-x-auto pb-1 [scrollbar-width:thin]">
        <div className="inline-flex flex-col gap-1">
          {/* Month labels */}
          <div className="ml-7 flex gap-[3px] text-[10px] text-muted-foreground">
            {months.map((m, i) => (
              <span key={i} className="w-[11px] shrink-0 overflow-visible whitespace-nowrap">
                {m}
              </span>
            ))}
          </div>
          <div className="flex gap-[3px]">
            {/* Weekday labels: Mon / Wed / Fri, like GitHub */}
            <div className="mr-1 flex w-6 shrink-0 flex-col gap-[3px] text-[10px] leading-[11px] text-muted-foreground">
              {["", "Mon", "", "Wed", "", "Fri", ""].map((d, i) => (
                <span key={i} className="h-[11px]">{d}</span>
              ))}
            </div>
            {data.weeks.map((w, wi) => {
              // Place days by weekday so a partial first/last week lines up.
              const slots: (Day | null)[] = Array(7).fill(null);
              w.days.forEach((d) => {
                slots[parseISO(d.date).getDay()] = d;
              });
              return (
                <div key={wi} className="flex flex-col gap-[3px]">
                  {slots.map((d, di) =>
                    d ? (
                      <span
                        key={di}
                        title={`${d.count === 0 ? "No" : d.count} contribution${d.count === 1 ? "" : "s"} on ${format(parseISO(d.date), "EEEE d MMMM yyyy")}`}
                        className={cn("h-[11px] w-[11px] rounded-[2px]", LEVELS[d.level] ?? LEVELS[0])}
                      />
                    ) : (
                      <span key={di} className="h-[11px] w-[11px]" />
                    )
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-1.5 text-[10px] text-muted-foreground">
        Less
        {LEVELS.map((l, i) => (
          <span key={i} className={cn("h-[11px] w-[11px] rounded-[2px]", l)} />
        ))}
        More
      </div>
    </div>
  );
};

export default ContributionGraph;
