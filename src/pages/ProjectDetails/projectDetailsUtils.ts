import type { LoaderFunctionArgs } from "react-router-dom";
import { getProjectById } from "@/services/projectService";
import { queryClient } from "@/lib/queryClient";
import { queryKeys } from "@/hooks/queries/keys";

export type HeaderType = {
  label: string;
  id: number;
};

export async function projectDetailsLoader({ params }: LoaderFunctionArgs) {
  if (!params.projectId) {
    throw new Response("Not Found", { status: 404 });
  }
  const projectId = params.projectId;
  return {
    project: await queryClient.ensureQueryData({
      queryKey: queryKeys.projects.detail(projectId),
      queryFn: () => getProjectById(projectId),
    }),
  };
}
