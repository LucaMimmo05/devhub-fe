import type { ElementType, ReactNode } from "react";

const MetaField = ({
  icon: Icon,
  label,
  children,
}: {
  icon: ElementType;
  label: string;
  children: ReactNode;
}) => (
  <div className="flex flex-col gap-1.5">
    <div className="flex items-center gap-1.5">
      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</span>
    </div>
    {children}
  </div>
);

export default MetaField;
