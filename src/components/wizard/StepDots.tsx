import { cn } from "@/lib/utils";

const StepDots = ({ step, count }: { step: number; count: number }) => (
  <div className="flex items-center gap-1.5">
    {Array.from({ length: count }).map((_, i) => (
      <span
        key={i}
        className={cn(
          "h-1.5 rounded-full transition-all duration-300",
          i === step ? "w-5 bg-primary" : i < step ? "w-1.5 bg-primary/50" : "w-1.5 bg-muted"
        )}
      />
    ))}
  </div>
);

export default StepDots;
