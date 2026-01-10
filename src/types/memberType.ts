export type MemberType = {
  id: number;
  name: string;
  role: "OWNER" | "MEMBER";
  email: string;
  avatar: URL;
  projectId: number
};
