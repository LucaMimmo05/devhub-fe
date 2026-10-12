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
  labels: { name: string; color: string | null }[];
  comments: number;
  createdAt: string | null;
  updatedAt: string | null;
  htmlUrl: string;
};

export type GithubPullRequest = {
  number: number;
  title: string;
  authorLogin: string | null;
  authorAvatarUrl: string | null;
  draft: boolean;
  createdAt: string | null;
  htmlUrl: string;
};

export type GithubRepoDetail = {
  repo: GithubRepo;
  /** Bytes of code per language. */
  languages: Record<string, number>;
  commits: GithubCommit[];
  issues: GithubIssue[];
  pulls: GithubPullRequest[];
};

export type GithubContributions = {
  total: number;
  weeks: { days: { date: string; count: number; level: number }[] }[];
};
