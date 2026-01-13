import type { MemberType } from "@/types/memberType";
import type { ProjectType } from "@/types/projectType";
import type { TaskType } from "@/types/taskType";

export const taskMock: TaskType[] = [
  {
    id: 1,
    title: "Design new landing page",
    status: "IN_PROGRESS",
    priority: "MEDIUM",
    createdAt: new Date("2024-10-01"),
    updatedAt: new Date("2024-10-03"),
    project: 1,
    assignedTo: "d5186e4a-7bbb-43c5-af94-67d4d656ccfb",
  },
  {
    id: 2,
    title: "Fix login bug",
    status: "PENDING",
    priority: "HIGH",
    createdAt: new Date("2024-10-01"),
    updatedAt: new Date("2024-10-02"),
    project: 1,
    assignedTo: "d5186e4a-7bbb-43c5-af94-67d4d656ccfb",
  },
  {
    id: 3,
    title: "Implement task filters",
    status: "IN_PROGRESS",
    priority: "MEDIUM",
    createdAt: new Date("2024-09-29"),
    updatedAt: new Date("2024-10-02"),
    project: 1,
    assignedTo: "d5186e4a-7bbb-43c5-af94-67d4d656ccfb",
  },
  {
    id: 4,
    title: "Optimize database queries",
    status: "COMPLETED",
    priority: "LOW",
    createdAt: new Date("2024-09-25"),
    updatedAt: new Date("2024-09-30"),
    project: 1,
    assignedTo: "d5186e4a-7bbb-43c5-af94-67d4d656ccfb",
  },
  {
    id: 5,
    title: "Setup CI/CD pipeline",
    status: "IN_PROGRESS",
    priority: "HIGH",
    createdAt: new Date("2024-09-28"),
    updatedAt: new Date("2024-10-03"),
    project: 1,
        assignedTo: "d5186e4a-7bbb-43c5-af94-67d4d656ccfb"

  },
  {
    id: 6,
    title: "Perform code review for feature X",
    status: "IN_PROGRESS",
    priority: "HIGH",
    createdAt: new Date("2024-09-28"),
    updatedAt: new Date("2024-10-03"),
    project: 1,
    assignedTo: "d5186e4a-7bbb-43c5-af94-67d4d656ccfb",
  },
];

export const notesMock = [
  {
    id: 1,
    title: "Meeting Notes",
    content: "Remember to review the PR for the new feature.",
    createdAt: "2024-10-02",
  },
  {
    id: 2,
    title: "Ideas",
    content: "Consider adding a dark mode to the application.",
    createdAt: "2024-10-01",
  },
  {
    id: 3,
    title: "Bug Report",
    content: "Users are experiencing issues with password resets.",
    createdAt: "2024-09-30",
  },
  {
    id: 4,
    title: "Bug Report",
    content: "Users are experiencing issues with password resets.",
    createdAt: "2024-09-30",
  },
];

export const githubActivityMock = [
  {
    id: 1,
    type: "PushEvent",
    repo: "devHub/devhub-fe",
    date: new Date("2025-12-30T21:15:00Z"),
    text: "Pushed 3 commits to",
  },
  {
    id: 2,
    type: "PullRequestEvent",
    repo: "devHub/devhub-be",
    date: new Date("2025-12-30T12:15:00Z"),
    text: "Opened a pull request in ",
  },
  {
    id: 3,
    type: "IssueCommentEvent",
    repo: "devHub/devhub-fe",
    date: new Date("2025-12-29T09:45:00Z"),
    text: "Commented on issue #42 in ",
  },
];


export const membersMock: MemberType[] = [
  {
    id: 1,
    name: "John Doe",
    role: "OWNER",
    email: "john.doe@example.com",
    avatar: new URL("https://i.pravatar.cc/150?img=1"),
    projectId: 1,
  },
  {
    id: 2,
    name: "Sarah Smith",
    role: "MEMBER",
    email: "sarah.smith@example.com",
    avatar: new URL("https://i.pravatar.cc/150?img=2"),
    projectId: 1,
  },
  {
    id: 3,
    name: "Michael Brown",
    role: "MEMBER",
    email: "michael.brown@example.com",
    avatar: new URL("https://i.pravatar.cc/150?img=3"),
    projectId: 1,
  },
  {
    id: 4,
    name: "Emily Johnson",
    role: "MEMBER",
    email: "emily.johnson@example.com",
    avatar: new URL("https://i.pravatar.cc/150?img=4"),
    projectId: 1,
  },
];
