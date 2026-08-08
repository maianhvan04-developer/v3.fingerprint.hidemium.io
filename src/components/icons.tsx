import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

interface BrandMarkProps {
  className?: string;
}

export function BrandMark({ className }: BrandMarkProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 120 120"
    >
      <path d="M16 59C18 33 34 16 58 12c17-3 34 3 45 16" />
      <circle cx="17" cy="76" r="4.5" fill="currentColor" stroke="none" />
      <path d="M31 60c0-18 12-31 29-33 16-2 31 7 37 21 4 8 5 16 4 25" />
      <path d="M31 61v21c0 7-1 13-4 19" />
      <path d="M47 58c0-10 7-18 17-19 12-1 22 8 22 20v22c0 8-1 15-4 22" />
      <path d="M49 61v22c0 11-2 21-6 30" />
      <path d="M63 60v22c0 15-3 27-7 37" />
      <path d="M76 60v23c0 14-2 25-6 34" />
      <path d="M99 51v25" />
    </svg>
  );
}

export function DottedField(props: IconProps) {
  return (
    <svg viewBox="0 0 120 76" fill="none" aria-hidden="true" {...props}>
      {Array.from({ length: 6 }, (_, row) =>
        Array.from({ length: 10 }, (_, column) => (
          <circle
            key={`${row}-${column}`}
            cx={6 + column * 12}
            cy={7 + row * 12}
            r="1.25"
            fill="#7FB0F9"
            opacity={Math.max(0.15, 0.72 - column * 0.055)}
          />
        )),
      )}
    </svg>
  );
}

export function ArrowRightMini(props: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" {...props}>
      <path d="M3 8h9M8.5 4.5 12 8l-3.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
