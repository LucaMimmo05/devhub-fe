import { timeSince } from "@/utils/getRelativeTime";

type GithubActivityProps = {
  activity: {
    id: number;
    type: string;
    repo: string;
    date: Date;
    text: string;
  };
};
const GithubActivity = ({ activity }: GithubActivityProps) => {
  return (
    <div className="flex justify-between items-start gap-4 w-full px-2 py-1.5 rounded-md hover:bg-accent/50 cursor-pointer transition-colors">
      <div className="flex flex-col gap-0.5 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">
          {activity.text}{" "}
          <span className="font-semibold text-primary/90 hover:underline">
            {activity.repo}
          </span>
        </p>
      </div>
      <span className="text-muted-foreground text-xs whitespace-nowrap shrink-0 mt-0.5 font-mono">
        {timeSince(activity.date.toString())}
      </span>
    </div>
  );
};

export default GithubActivity;
