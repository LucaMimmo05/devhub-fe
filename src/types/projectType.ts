import type { Priority, Status } from "./PriorityAndStatusType";
import type { ProjectMemberType } from "./projectMemberType";
import type { UserProfileType } from "./userProfileType";

export type ProjectType = {
  id: string;
  title: string;
  description: string;
  imgUrl?: string;
  status: Status;
  priority: Priority;
  dueDate?: Date;
  owner: UserProfileType;
  members: ProjectMemberType[];
  progress: number;
};

export type ProjectRequest = {
  title: string;
  description: string;
  imgUrl?: string;
  status: Status;
  priority: Priority;
  dueDate?: Date;
  owner: string;
  members: string[];
  progress: number;
};
