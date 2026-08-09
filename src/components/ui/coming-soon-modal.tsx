"use client";

import { useEffect, type HTMLAttributes, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import { Rocket, X } from "lucide-react";

interface ComingSoonModalProps extends HTMLAttributes<HTMLDivElement> {
  actionLabel: string;
  description?: string;
  onClose: () => void;
  open: boolean;
  title: string;
}

export function ComingSoonModal({
  actionLabel,
  className,
  description,
  onClose,
  open,
  title,
  ...props
}: ComingSoonModalProps) {
  useEffect(() => {
    if (!open) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose, open]);

  if (!open || typeof document === "undefined") return null;

  const closeOnBackdrop = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return createPortal(
    <div
      className={className ? `coming-soon-modal ${className}` : "coming-soon-modal"}
      onMouseDown={closeOnBackdrop}
      role="presentation"
      {...props}
    >
      <div
        aria-labelledby="coming-soon-modal-title"
        aria-modal="true"
        className="coming-soon-modal__panel"
        role="dialog"
      >
        <button
          aria-label={actionLabel}
          className="coming-soon-modal__close"
          onClick={onClose}
          type="button"
        >
          <X aria-hidden="true" />
        </button>
        <span className="coming-soon-modal__icon" aria-hidden="true">
          <Rocket />
        </span>
        <h2 id="coming-soon-modal-title">{title}</h2>
        {description ? <p>{description}</p> : null}
        <button className="coming-soon-modal__action" onClick={onClose} type="button">
          {actionLabel}
        </button>
      </div>
    </div>,
    document.body,
  );
}
