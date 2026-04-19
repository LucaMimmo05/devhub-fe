import PageContainer from "@/layouts/PageContainer";
import { Github as GithubIcon, Wrench } from "lucide-react";

const Github = () => (
  <PageContainer>
    <div className="flex flex-col items-center justify-center h-[calc(100vh-160px)] gap-5 text-center">
      <div className="relative">
        <div className="h-20 w-20 rounded-2xl bg-muted/60 flex items-center justify-center">
          <GithubIcon className="h-10 w-10 text-muted-foreground/60" />
        </div>
        <div className="absolute -bottom-2 -right-2 h-7 w-7 rounded-full bg-yellow-500/15 border border-yellow-500/25 flex items-center justify-center">
          <Wrench className="h-3.5 w-3.5 text-yellow-400" />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <h2 className="text-xl font-semibold">GitHub Integration</h2>
        <p className="text-sm text-muted-foreground max-w-xs">
          This section is currently under development. GitHub activity, commits and pull requests will be available here soon.
        </p>
      </div>
      <span className="text-xs text-muted-foreground/50 border border-border rounded-full px-3 py-1">
        Coming soon
      </span>
    </div>
  </PageContainer>
);

export default Github;
