export type GithubStatus = {
  /** False when the server has no OAuth app configured. */
  configured: boolean;
  connected: boolean;
  login: string | null;
  name: string | null;
  avatarUrl: string | null;
  profileUrl: string | null;
  connectedAt: string | null;
};

export type GithubRepo = {
  id: number;
  name: string;
  fullName: string;
  owner: string;
  description: string | null;
  isPrivate: boolean;
  fork: boolean;
  archived: boolean;
  language: string | null;
  stars: number;
  forks: number;
  watchers: number;
  openIssues: number;
  defaultBranch: string | null;
  htmlUrl: string;
  homepage: string | null;
  topics: string[];
  pushedAt: string | null;
  updatedAt: string | null;
  createdAt: string | null;
  sizeKb: number;
  license: string | null;
};

export type GithubCommit = {
  sha: string;
  shortSha: string;
  message: string;
  repo: string;
  authorLogin: string | null;
  authorName: string | null;
  authorAvatarUrl: string | null;
  date: string | null;
  htmlUrl: string;
};

export type GithubIssue = {
  number: number;
  title: string;
  state: string;
  authorLogin: string | null;
  authorAvatarUrl: string | null;
  labels: GithubLabel[];
  comments: number;
  createdAt: string | null;
  updatedAt: string | null;
  htmlUrl: string;
};

export type GithubLabel = { name: string; color: string | null };

export type GithubPullRequest = {
  number: number;
  title: string;
  authorLogin: string | null;
  authorAvatarUrl: string | null;
  draft: boolean;
  branch: string | null;
  labels: GithubLabel[];
  createdAt: string | null;
  updatedAt: string | null;
  htmlUrl: string;
};

export type GithubRelease = { tag: string; name: string | null; publishedAt: string | null; htmlUrl: string };

export type GithubWorkflowRun = {
  id: number;
  name: string | null;
  title: string | null;
  status: "queued" | "in_progress" | "completed" | string | null;
  conclusion: "success" | "failure" | "cancelled" | "skipped" | string | null;
  branch: string | null;
  event: string | null;
  createdAt: string | null;
  htmlUrl: string;
};

export type GithubContributor = { login: string; avatarUrl: string | null; contributions: number };

export type GithubRepoDetail = {
  repo: GithubRepo;
  /** Bytes of code per language. */
  languages: Record<string, number>;
  commits: GithubCommit[];
  issues: GithubIssue[];
  pulls: GithubPullRequest[];
  /** README Markdown, null when the repository has none. */
  readme: string | null;
  latestRelease: GithubRelease | null;
  runs: GithubWorkflowRun[];
  contributors: GithubContributor[];
  /** Commits per week over the last year, oldest first; empty while GitHub computes it. */
  weeklyCommits: number[];
};

export type GithubInboxItem = {
  kind: "PR" | "ISSUE";
  number: number;
  title: string;
  /** "owner/name" */
  repo: string;
  htmlUrl: string;
  authorLogin: string | null;
  authorAvatarUrl: string | null;
  labels: GithubLabel[];
  comments: number;
  draft: boolean;
  reviewDecision: "APPROVED" | "CHANGES_REQUESTED" | "REVIEW_REQUIRED" | null;
  checks: "SUCCESS" | "FAILURE" | "PENDING" | null;
  additions: number;
  deletions: number;
  createdAt: string | null;
  updatedAt: string | null;
};

export type GithubInbox = {
  reviewRequests: GithubInboxItem[];
  pullRequests: GithubInboxItem[];
  issues: GithubInboxItem[];
};

export type GithubContributions = {
  total: number;
  weeks: { days: { date: string; count: number; level: number }[] }[];
  totals: { commits: number; pullRequests: number; reviews: number; issues: number; privateContributions: number };
  /** Repositories with the most commits by the viewer this year. */
  topRepos: { repo: string; commits: number }[];
};
