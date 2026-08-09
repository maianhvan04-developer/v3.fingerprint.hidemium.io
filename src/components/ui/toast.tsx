import type { HTMLAttributes, ReactNode } from "react";

interface ToastProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  open: boolean;
}

export function Toast({ children, className, open, ...props }: ToastProps) {
  if (!open) return null;

  return (
    <div
      aria-atomic="true"
      aria-live="polite"
      className={className ? `app-toast ${className}` : "app-toast"}
      role="status"
      {...props}
    >
      {children}
    </div>
  );
}
