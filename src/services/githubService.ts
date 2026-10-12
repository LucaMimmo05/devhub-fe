import { mainCallApi } from ".";
import type {
  GithubCommit,
  GithubContributions,
  GithubRepo,
  GithubRepoDetail,
  GithubStatus,
} from "@/types/githubType";

export const getGithubStatus = async (): Promise<GithubStatus> => (await mainCallApi.get("/github/status")).data;

/** URL of GitHub's authorize page for linking the signed-in account. */
export const getGithubConnectUrl = async (): Promise<string> => (await mainCallApi.get("/github/connect")).data.url;

export const completeGithubConnect = async (code: string, state: string): Promise<GithubStatus> =>
  (await mainCallApi.post("/github/callback", { code, state })).data;

export const disconnectGithub = async () => {
  await mainCallApi.delete("/github/connection");
};

export const getGithubRepos = async (): Promise<GithubRepo[]> => (await mainCallApi.get("/github/repos")).data;

export const getGithubRepo = async (fullName: string): Promise<GithubRepoDetail> =>
  (await mainCallApi.get(`/github/repos/${fullName}`)).data;

export const getGithubCommits = async (): Promise<GithubCommit[]> => (await mainCallApi.get("/github/commits")).data;

export const getGithubContributions = async (): Promise<GithubContributions> =>
  (await mainCallApi.get("/github/contributions")).data;
