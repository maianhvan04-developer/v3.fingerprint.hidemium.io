import type { HTMLAttributes, ReactNode } from "react";

interface ComingSoonBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
}

export function ComingSoonBadge({ children, className, ...props }: ComingSoonBadgeProps) {
  return (
    <span
      className={className ? `coming-soon-badge ${className}` : "coming-soon-badge"}
      {...props}
    >
      {children}
    </span>
  );
}
