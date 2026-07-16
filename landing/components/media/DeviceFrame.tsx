import type { ReactNode } from "react";

export function DeviceFrame({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`relative rounded-[2.2rem] border border-line/70 bg-ivory p-2.5 shadow-[0_30px_60px_-24px_rgba(45,33,27,0.45),0_8px_20px_-12px_rgba(45,33,27,0.3)] ${className}`}
    >
      {/* speaker slot */}
      <div className="absolute left-1/2 top-3 z-10 h-1 w-14 -translate-x-1/2 rounded-full bg-line/70" />
      <div className="overflow-hidden rounded-[1.7rem]">{children}</div>
    </div>
  );
}
