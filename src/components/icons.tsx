import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

export function BrandMark(props: IconProps) {
  return (
    <svg viewBox="0 0 44 36" fill="none" aria-hidden="true" {...props}>
      <path d="M22 1.8 39 8v19.8L22 34.2 5 27.8V8L22 1.8Z" fill="url(#brand-gradient)" />
      <path d="M14.2 21.5c0-5.4 3.3-9.1 7.8-9.1s7.8 3.7 7.8 9.1" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M17 22c0-3.8 2-6.5 5-6.5s5 2.7 5 6.5c0 3.1-.8 5.2-1.9 7" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M19.7 22.5c0-2.2.8-3.8 2.3-3.8s2.3 1.6 2.3 3.8c0 2.8-.7 4.9-1.6 6.7M14.5 25.1c.5 2 1.2 3.6 2.1 5M29.4 25.1c-.5 2-1.2 3.6-2.1 5" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
      <defs>
        <linearGradient id="brand-gradient" x1="7" y1="4" x2="38" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2F82FF" />
          <stop offset="1" stopColor="#0C52E7" />
        </linearGradient>
      </defs>
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
