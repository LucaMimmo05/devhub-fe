import { format, isToday } from "date-fns";
import type { TaskType } from "@/types/taskType";
import { cn } from "@/lib/utils";

/** The next seven days, with a dot per open task due on each (hover for titles). */
const WeekStrip = ({ days }: { days: { day: Date; tasks: TaskType[] }[] }) => {
  const max = 4;
  return (
    <ol className="grid grid-cols-7 gap-1.5" aria-label="Open tasks due in the next 7 days">
      {days.map(({ day, tasks }) => {
        const today = isToday(day);
        return (
          <li
            key={day.toISOString()}
            title={tasks.map((t) => `• ${t.title}`).join("\n") || "Nothing due"}
            className={cn(
              "flex flex-col items-center gap-1 rounded-lg px-1 py-1.5 text-center",
              today ? "bg-primary/10 ring-1 ring-inset ring-primary/30" : "bg-muted/30"
            )}
          >
            <span className={cn("text-[10px] font-medium leading-tight", today ? "text-primary" : "text-muted-foreground")}>
              {today ? "Today" : format(day, "EEE")}
              <span className={cn("block text-xs font-semibold tabular-nums", today ? "text-primary" : "text-foreground")}>{format(day, "d")}</span>
            </span>
            {/* One dot per task (up to 4), red for high priority */}
            <span className="flex h-1.5 items-center gap-0.5" aria-label={`${tasks.length} due`}>
              {tasks.length === 0 ? (
                <span className="h-1 w-1 rounded-full bg-muted-foreground/25" />
              ) : (
                tasks.slice(0, Math.min(max, 4)).map((t) => (
                  <span key={t.id} className={cn("h-1.5 w-1.5 rounded-full", t.priority === "HIGH" ? "bg-red-400" : "bg-primary")} />
                ))
              )}
            </span>
          </li>
        );
      })}
    </ol>
  );
};

export default WeekStrip;
