import Image from "next/image";
import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

interface BrandMarkProps {
  className?: string;
}

export function BrandMark({ className }: BrandMarkProps) {
  return (
    <Image
      alt=""
      aria-hidden="true"
      className={className}
      height={1004}
      src="/images/brand-logo.png"
      width={917}
    />
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
