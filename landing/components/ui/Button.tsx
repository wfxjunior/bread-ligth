"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "onDark";
type Size = "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "bg-burgundy text-[#F7F2E8] hover:bg-burgundy-hover shadow-[0_1px_2px_rgba(45,33,27,0.16)]",
  secondary:
    "bg-transparent text-ink border border-line hover:border-burgundy hover:text-burgundy",
  ghost: "bg-transparent text-ink hover:text-burgundy",
  onDark: "bg-[#F7F2E8] text-burgundy hover:bg-white",
};
const sizes: Record<Size, string> = {
  md: "h-11 px-5 text-[0.95rem]",
  lg: "h-[3.25rem] px-7 text-base",
};

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
}

export function Button({ variant = "primary", size = "md", className = "", children, ...rest }: Props) {
  return (
    <button
      className={`inline-flex select-none items-center justify-center gap-2 rounded-full font-sans font-medium transition-[background-color,color,border-color,transform] duration-200 ease-[var(--ease-out-soft)] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60 ${sizes[size]} ${variants[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

// Same look, rendered as a link.
export function ButtonLink({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...rest
}: { variant?: Variant; size?: Size; className?: string; children: ReactNode } & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a
      className={`inline-flex select-none items-center justify-center gap-2 rounded-full font-sans font-medium transition-[background-color,color,border-color,transform] duration-200 ease-[var(--ease-out-soft)] active:scale-[0.98] ${sizes[size]} ${variants[variant]} ${className}`}
      {...rest}
    >
      {children}
    </a>
  );
}
