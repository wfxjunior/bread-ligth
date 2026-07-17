import type { ReactNode } from "react";

/**
 * DeviceFrame — a realistic modern iPhone, drawn in CSS.
 * Titanium-dark chassis with a metallic edge highlight, thin black bezel,
 * Dynamic Island, and side buttons. The screenshot (or placeholder) fills the
 * screen edge-to-edge under the island, exactly like the real device.
 */
export function DeviceFrame({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`relative ${className}`}>
      {/* Side buttons — part of the chassis, just proud of the rounded body */}
      <div aria-hidden className="absolute -left-[2.5px] top-[19%] h-7 w-[3px] rounded-l-md bg-[#3A3A3E]" />
      <div aria-hidden className="absolute -left-[2.5px] top-[28%] h-12 w-[3px] rounded-l-md bg-[#3A3A3E]" />
      <div aria-hidden className="absolute -left-[2.5px] top-[41%] h-12 w-[3px] rounded-l-md bg-[#3A3A3E]" />
      <div aria-hidden className="absolute -right-[2.5px] top-[30%] h-16 w-[3px] rounded-r-md bg-[#3A3A3E]" />

      {/* Chassis: titanium edge → near-black body */}
      <div
        className="rounded-[3.2rem] p-[3px] shadow-[0_34px_64px_-28px_rgba(20,14,10,0.5),0_12px_28px_-14px_rgba(20,14,10,0.35)]"
        style={{ background: "linear-gradient(145deg, #4A4A4F 0%, #17171A 30%, #26262B 65%, #4A4A4F 100%)" }}
      >
        <div className="rounded-[3rem] bg-[#101012] p-[9px]">
          {/* Screen — thin black bezel, content clipped to the display radius */}
          <div className="relative overflow-hidden rounded-[2.45rem] bg-black">
            {/* Dynamic Island (with camera dot) */}
            <div aria-hidden className="absolute left-1/2 top-[11px] z-10 h-[24px] w-[86px] -translate-x-1/2 rounded-full bg-black">
              <span className="absolute right-[14px] top-1/2 h-[8px] w-[8px] -translate-y-1/2 rounded-full bg-[#16161A]" />
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
