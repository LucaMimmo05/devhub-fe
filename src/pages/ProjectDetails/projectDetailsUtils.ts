import type { LoaderFunctionArgs } from "react-router-dom";
import { getProjectById } from "@/services/projectService";

export type HeaderType = {
  label: string;
  id: number;
};

export async function projectDetailsLoader({ params }: LoaderFunctionArgs) {
  if (!params.projectId) {
    throw new Response("Not Found", { status: 404 });
  }
  return {
    project: await getProjectById(params.projectId),
  };
}
