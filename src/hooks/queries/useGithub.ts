import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  disconnectGithub,
  getGithubCommits,
  getGithubContributions,
  getGithubInbox,
  getGithubRepo,
  getGithubRepos,
  getGithubStatus,
} from "@/services/githubService";
import { queryKeys } from "./keys";

// GitHub data changes slowly and the API is rate limited: keep it fresh for a few minutes.
const STALE = 5 * 60 * 1000;

export const useGithubStatus = () =>
  useQuery({ queryKey: queryKeys.github.status(), queryFn: getGithubStatus, staleTime: STALE });

/** Data queries only run once an account is connected. */
const useConnected = () => !!useGithubStatus().data?.connected;

export const useGithubRepos = () =>
  useQuery({ queryKey: queryKeys.github.repos(), queryFn: getGithubRepos, enabled: useConnected(), staleTime: STALE });

export const useGithubRepo = (fullName?: string | null) =>
  useQuery({
    queryKey: queryKeys.github.repo(fullName ?? ""),
    queryFn: () => getGithubRepo(fullName!),
    enabled: useConnected() && !!fullName,
    staleTime: STALE,
    retry: false,
  });

export const useGithubCommits = () =>
  useQuery({ queryKey: queryKeys.github.commits(), queryFn: getGithubCommits, enabled: useConnected(), staleTime: STALE });

export const useGithubContributions = () =>
  useQuery({
    queryKey: queryKeys.github.contributions(),
    queryFn: getGithubContributions,
    enabled: useConnected(),
    staleTime: STALE,
  });

export const useGithubInbox = () =>
  useQuery({ queryKey: queryKeys.github.inbox(), queryFn: getGithubInbox, enabled: useConnected(), staleTime: STALE });

export const useDisconnectGithub = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: disconnectGithub,
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: queryKeys.github.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.github.status() });
    },
  });
};
