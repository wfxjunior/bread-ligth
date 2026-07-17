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
      {/* Side buttons — proportional to the frame so every size (Hero large,
          App Preview small) keeps realistic, discreet hardware */}
      <div aria-hidden className="absolute -left-[2px] top-[17.5%] h-[3.2%] w-[2.5px] rounded-l-md bg-[#3A3A3E]" />
      <div aria-hidden className="absolute -left-[2px] top-[24.5%] h-[5.5%] w-[2.5px] rounded-l-md bg-[#3A3A3E]" />
      <div aria-hidden className="absolute -left-[2px] top-[31.5%] h-[5.5%] w-[2.5px] rounded-l-md bg-[#3A3A3E]" />
      <div aria-hidden className="absolute -right-[2px] top-[26%] h-[8%] w-[2.5px] rounded-r-md bg-[#3A3A3E]" />

      {/* Chassis: titanium edge → near-black body (radii scale with width) */}
      <div
        className="rounded-[15.5%_/_7.5%] p-[1.1%] shadow-[0_34px_64px_-28px_rgba(20,14,10,0.5),0_12px_28px_-14px_rgba(20,14,10,0.35)]"
        style={{ background: "linear-gradient(145deg, #4A4A4F 0%, #17171A 30%, #26262B 65%, #4A4A4F 100%)" }}
      >
        <div className="rounded-[15%_/_7.2%] bg-[#101012] p-[3%]">
          {/* Screen — thin black bezel, content clipped to the display radius */}
          <div className="relative overflow-hidden rounded-[12.5%_/_6%] bg-black">
            {/* Dynamic Island (with camera dot) — proportional */}
            <div aria-hidden className="absolute left-1/2 top-[1.6%] z-10 aspect-[86/24] w-[29%] -translate-x-1/2 rounded-full bg-black">
              <span className="absolute right-[16%] top-1/2 aspect-square w-[9%] -translate-y-1/2 rounded-full bg-[#16161A]" />
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
