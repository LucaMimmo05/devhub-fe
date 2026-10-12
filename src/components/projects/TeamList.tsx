import type { ProjectType } from "@/types/projectType";
import { cn } from "@/lib/utils";

export const PersonAvatar = ({
  firstName,
  lastName,
  username,
  avatarUrl,
  className,
}: {
  firstName?: string;
  lastName?: string;
  username: string;
  avatarUrl?: string;
  className?: string;
}) =>
  avatarUrl ? (
    <img src={avatarUrl} alt="" className={cn("h-8 w-8 shrink-0 rounded-lg object-cover", className)} />
  ) : (
    <span
      className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-[11px] font-semibold uppercase text-foreground/80",
        className
      )}
    >
      {firstName ? `${firstName[0]}${lastName?.[0] ?? ""}` : username.slice(0, 2)}
    </span>
  );

// Owner first, then members — read-only list for the project sidebar.
const TeamList = ({ project }: { project: ProjectType }) => {
  const members = project.members.filter((m) => m.role !== "OWNER");
  return (
    <ul className="flex flex-col gap-0.5">
      {project.ownerUsername && (
        <li className="flex items-center gap-2.5 px-1 py-1.5">
          <PersonAvatar username={project.ownerUsername} avatarUrl={project.ownerAvatarUrl} className="h-7 w-7" />
          <span className="min-w-0 flex-1 truncate text-sm">@{project.ownerUsername}</span>
          <span className="text-[11px] text-muted-foreground">Owner</span>
        </li>
      )}
      {members.map((m) => (
        <li key={m.profileId} className="flex items-center gap-2.5 px-1 py-1.5">
          <PersonAvatar {...m} className="h-7 w-7" />
          <span className="min-w-0 flex-1 truncate text-sm">
            {m.firstName ? `${m.firstName} ${m.lastName ?? ""}` : `@${m.username}`}
          </span>
        </li>
      ))}
    </ul>
  );
};

export default TeamList;
