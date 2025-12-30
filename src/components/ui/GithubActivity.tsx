import {  timeSince } from "@/utils/getRelativeTime";

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
    <div className="flex justify-between items-center sm:min-w-120 px-2 py-1 rounded-md hover:bg-accent cursor-pointer">
      {/* Header */}
      <h3>{activity.text} <span className="font-semibold text-primary">{activity.repo}</span></h3>
      <p className="text-muted-foreground text-sm">{timeSince(activity.date.toString())}</p>
    </div>
  );
};

export default GithubActivity;
