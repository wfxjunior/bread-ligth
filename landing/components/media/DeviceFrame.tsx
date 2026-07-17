import type { ReactNode } from "react";

export function DeviceFrame({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`relative rounded-[2.3rem] border border-line/60 bg-gradient-to-b from-white to-ivory p-2.5 shadow-[0_28px_56px_-26px_rgba(45,33,27,0.34),0_10px_24px_-14px_rgba(45,33,27,0.22),inset_0_1px_0_rgba(255,255,255,0.7)] ${className}`}
    >
      {/* speaker slot */}
      <div className="absolute left-1/2 top-3 z-10 h-1 w-14 -translate-x-1/2 rounded-full bg-line/60" />
      <div className="overflow-hidden rounded-[1.8rem]">{children}</div>
    </div>
  );
}
