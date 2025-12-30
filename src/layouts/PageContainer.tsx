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
        "w-full h-full max-h-screen mx-auto px-4 md:px-4 lg:px-6 py-6 overflow-x-hidden",
        className
      )}
    >
      {" "}
      {children}
    </div>
  );
};

export default PageContainer;
