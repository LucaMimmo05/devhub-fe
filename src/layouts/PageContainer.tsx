import type { ReactNode } from "react";

type PageContainerProps = {
  children: ReactNode;
  className?: string;
};

const PageContainer = ({ children, className }: PageContainerProps) => {
  return (
    <div className={`px-6  sm:px-6 lg:px-8 ${className ?? ""}`}>{children}</div>
  );
};

export default PageContainer;
