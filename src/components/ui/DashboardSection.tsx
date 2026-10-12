import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "./skeleton";

type DashboardSectionProps = {
  title: string;
  count?: number;
  action?: { label: string; to: string; icon?: ReactNode };
  className?: string;
  children: ReactNode;
};

// Compact panel used on the home: a thin header row (title, count, link) and a
// body that sizes to its content instead of stretching to fill the viewport.
const DashboardSection = ({ title, count, action, className, children }: DashboardSectionProps) => (
  <section className={cn("rounded-xl border border-border bg-card/60 min-w-0", className)}>
    <header className="flex h-11 items-center justify-between gap-3 border-b border-border/60 px-4">
      <div className="flex min-w-0 items-baseline gap-2">
        <h2 className="truncate text-sm font-semibold">{title}</h2>
        {count !== undefined && (
          <span className="text-xs tabular-nums text-muted-foreground">{count}</span>
        )}
      </div>
      {action && (
        <Link
          to={action.to}
          className="group -mr-1.5 flex shrink-0 items-center gap-1 rounded-md px-1.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
        >
          {action.icon}
          {action.label}
          {!action.icon && (
            <ArrowRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" />
          )}
        </Link>
      )}
    </header>
    <div className="@container p-1.5">{children}</div>
  </section>
);

export const SectionRowsSkeleton = ({ rows = 4 }: { rows?: number }) => (
  <div className="flex flex-col gap-1 p-1.5" aria-hidden>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex h-9 items-center gap-3 px-1">
        <Skeleton className="h-4 w-4 rounded" />
        <Skeleton className="h-3 flex-1" style={{ maxWidth: `${70 - i * 9}%` }} />
        <Skeleton className="h-3 w-10" />
      </div>
    ))}
  </div>
);

export const SectionEmpty = ({
  icon,
  text,
  cta,
}: {
  icon: ReactNode;
  text: string;
  cta?: { label: string; to: string };
}) => (
  <div className="flex items-center gap-3 px-2.5 py-3">
    <span className="text-muted-foreground/50">{icon}</span>
    <p className="flex-1 text-sm text-muted-foreground">{text}</p>
    {cta && (
      <Link
        to={cta.to}
        className="shrink-0 rounded-md border border-border px-2 py-1 text-xs font-medium transition-colors hover:bg-muted active:scale-[0.98]"
      >
        {cta.label}
      </Link>
    )}
  </div>
);

export default DashboardSection;
