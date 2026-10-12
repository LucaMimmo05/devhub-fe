import type { Priority, Status } from "./PriorityAndStatusType";

export type ProjectMemberSummary = {
  profileId: string;
  username: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  role: "OWNER" | "MEMBER";
};

export type ProjectType = {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  status: Status;
  priority: Priority;
  dueDate?: string;
  ownerId: string;
  ownerProfileId?: string;
  ownerUsername?: string;
  ownerAvatarUrl?: string;
  members: ProjectMemberSummary[];
  createdAt?: string;
  updatedAt?: string;
};

export type ProjectRequest = {
  title: string;
  description: string;
  imageUrl?: string;
  status: Status;
  priority: Priority;
  dueDate?: string;
  /** Updates only: removes the due date (a missing dueDate leaves it unchanged). */
  clearDueDate?: boolean;
  ownerId: string;
  memberIds?: string[];
};
