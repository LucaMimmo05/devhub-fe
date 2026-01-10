import type { MemberType } from "@/types/memberType";
import { Badge } from "./badge";
import { cn } from "@/lib/utils";

type MemberProps = {
    member : MemberType
}

const Member = ({ member }: MemberProps) => {
  return (
    <div className="flex justify-between items-center">
        <div className="flex gap-2 items-center">
            <img src={member.avatar.href} alt="member profile" width={50} className="rounded-full" />
      <div className="flex flex-col">
        <h3>{member.name}</h3>
        <p className="text-sm text-muted-foreground">{member.email}</p>
      </div>
        </div>
      <Badge className={cn(
        "hover:bg-inset text-xs shrink-0 h-fit",
        (member.role === "MEMBER") && "bg-muted text-muted-foreground",
        (member.role === "OWNER") && "bg-primary text-primary-foreground"
      )}>{member.role === "MEMBER" ? "Member" : "Owner"}</Badge>
    </div>
  );
};

export default Member;
