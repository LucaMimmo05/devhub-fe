import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type PageContainerProps = {
  children: ReactNode;
  className?: string;
};

const PageContainer = ({ children, className }: PageContainerProps) => {
  return (
    <div
      className={cn(
        "w-full mx-auto px-4 md:px-4 lg:px-6 py-4 xl:min-h-[calc(100vh-4rem)]",
        className
      )}
    >
      {children}
    </div>
  );
};

export default PageContainer;
