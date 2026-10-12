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
        "w-full max-w-[1600px] mx-auto px-4 lg:px-6 py-4 lg:py-5 flex flex-col",
        className
      )}
    >
      {children}
    </div>
  );
};

export default PageContainer;
