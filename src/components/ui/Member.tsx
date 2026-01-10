import type { MemberType } from "@/types/memberType";
import { Badge } from "./badge";
import { cn } from "@/lib/utils";

type MemberProps = {
    member : MemberType
}

const Member = ({ member }: MemberProps) => {
  return (
    <div className="flex justify-between items-center gap-2">
      <div className="flex gap-2 items-center min-w-0">
        <img
          src={member.avatar.href}
          alt="member profile"
          width={40}
          height={40}
          className="rounded-full shrink-0"
        />
        <div className="flex flex-col min-w-0">
          <h3 className="truncate text-sm font-medium">{member.name}</h3>
          <p className="text-xs text-muted-foreground truncate">{member.email}</p>
        </div>
      </div>
      <Badge
        className={cn(
          "hover:bg-inset text-xs shrink-0 h-fit",
          member.role === "MEMBER" && "bg-muted text-muted-foreground",
          member.role === "OWNER" && "bg-primary text-primary-foreground"
        )}
      >
        {member.role === "MEMBER" ? "Member" : "Owner"}
      </Badge>
    </div>
  );
};

export default Member;
