"use client";

import { useEffect, type MouseEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Download, X } from "lucide-react";

interface JsonPreviewModalProps {
  closeLabel: string;
  content: string;
  description: string;
  downloadLabel: string;
  eyebrow: string;
  onClose: () => void;
  onDownload: () => void;
  open: boolean;
  title: string;
  titleId?: string;
}

export function JsonPreviewModal({
  closeLabel,
  content,
  description,
  downloadLabel,
  eyebrow,
  onClose,
  onDownload,
  open,
  title,
  titleId = "json-preview-title",
}: JsonPreviewModalProps): ReactNode {
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

  if (!open || !content || typeof document === "undefined") return null;

  const closeOnBackdrop = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return createPortal(
    <div className="json-preview-modal" onMouseDown={closeOnBackdrop} role="presentation">
      <div
        aria-labelledby={titleId}
        aria-modal="true"
        className="json-preview-modal__panel"
        role="dialog"
      >
        <header className="json-preview-modal__header">
          <div>
            <span>{eyebrow}</span>
            <h3 id={titleId}>{title}</h3>
            <p>{description}</p>
          </div>
          <button
            aria-label={closeLabel}
            className="json-preview-modal__close"
            onClick={onClose}
            type="button"
          >
            <X aria-hidden="true" />
          </button>
        </header>
        <pre className="json-preview-modal__body">{content}</pre>
        <footer className="json-preview-modal__footer">
          <button className="json-preview-modal__ghost" onClick={onClose} type="button">
            {closeLabel}
          </button>
          <button className="json-preview-modal__download" onClick={onDownload} type="button">
            <Download aria-hidden="true" /> {downloadLabel}
          </button>
        </footer>
      </div>
    </div>,
    document.body,
  );
}
