"use client";

import type { HTMLAttributes, ReactNode } from "react";
import { createPortal } from "react-dom";

interface ToastProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  open: boolean;
}

export function Toast({ children, className, open, ...props }: ToastProps) {
  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      aria-atomic="true"
      aria-live="polite"
      className={className ? `app-toast ${className}` : "app-toast"}
      role="status"
      {...props}
    >
      {children}
    </div>,
    document.body,
  );
}
