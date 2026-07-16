import type { SVGProps } from "react";

// Minimal, consistent line icons (1.5 stroke, round caps). No emoji, no fills.
type IconProps = SVGProps<SVGSVGElement>;
const base = {
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  focusable: false,
};

export const IconRead = (p: IconProps) => (
  <svg {...base} {...p}><path d="M12 6c-1.7-1.2-4-1.8-6-1.8V18c2 0 4.3.6 6 1.8 1.7-1.2 4-1.8 6-1.8V4.2c-2 0-4.3.6-6 1.8Z" /><path d="M12 6v13.8" /></svg>
);
export const IconListen = (p: IconProps) => (
  <svg {...base} {...p}><path d="M4 14v-2a8 8 0 0 1 16 0v2" /><path d="M4 15a2 2 0 0 1 2-2h1v5H6a2 2 0 0 1-2-2Z" /><path d="M20 15a2 2 0 0 0-2-2h-1v5h1a2 2 0 0 0 2-2Z" /></svg>
);
export const IconLearn = (p: IconProps) => (
  <svg {...base} {...p}><path d="M3 6.5 12 3l9 3.5L12 10 3 6.5Z" /><path d="M7 8.5V13c0 1.4 2.2 2.5 5 2.5s5-1.1 5-2.5V8.5" /><path d="M21 6.5v5" /></svg>
);
export const IconSpeak = (p: IconProps) => (
  <svg {...base} {...p}><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M6 11a6 6 0 0 0 12 0" /><path d="M12 17v4" /></svg>
);
export const IconReflect = (p: IconProps) => (
  <svg {...base} {...p}><path d="M4 5h11a3 3 0 0 1 3 3v11l-3-2H7a3 3 0 0 1-3-3V5Z" /><path d="M8 9h6M8 12.5h4" /></svg>
);
export const IconGrow = (p: IconProps) => (
  <svg {...base} {...p}><path d="M4 19V9M10 19V5M16 19v-6M20 19H3" /></svg>
);
export const IconArrow = (p: IconProps) => (
  <svg {...base} {...p}><path d="M5 12h13M13 6l6 6-6 6" /></svg>
);
export const IconChevron = (p: IconProps) => (
  <svg {...base} {...p}><path d="m6 9 6 6 6-6" /></svg>
);
export const IconCheck = (p: IconProps) => (
  <svg {...base} {...p}><path d="m5 12 4.5 4.5L19 7" /></svg>
);
export const IconGlobe = (p: IconProps) => (
  <svg {...base} {...p}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18" /></svg>
);
export const IconPlay = (p: IconProps) => (
  <svg {...base} {...p}><path d="M8 5.5v13l11-6.5-11-6.5Z" /></svg>
);
export const IconApple = (p: IconProps) => (
  <svg {...base} {...p} strokeWidth={0} fill="currentColor"><path d="M16.3 12.9c0-2 1.6-3 1.7-3-.9-1.4-2.4-1.5-2.9-1.6-1.2-.1-2.4.7-3 .7-.6 0-1.6-.7-2.6-.7-1.3 0-2.6.8-3.3 2-1.4 2.4-.4 6 1 8 .7 1 1.4 2 2.4 2 .9 0 1.3-.6 2.4-.6s1.4.6 2.4.6c1 0 1.6-.9 2.3-1.9.5-.7.7-1.1 1.1-2-2.8-1-3-4.9 0-4.9ZM14.6 6.6c.5-.6.9-1.5.8-2.4-.8 0-1.7.5-2.2 1.2-.5.5-.9 1.4-.8 2.3.9 0 1.8-.5 2.2-1.1Z" /></svg>
);
export const IconPlayStore = (p: IconProps) => (
  <svg {...base} {...p} strokeWidth={0} fill="currentColor"><path d="M4 3.2 13.5 12 4 20.8c-.3-.2-.5-.6-.5-1V4.2c0-.4.2-.8.5-1Z" opacity=".9" /><path d="m15.3 10.2 2.9 1.6c.9.5.9 1.9 0 2.4l-2.9 1.6L12.6 12l2.7-1.8Z" /><path d="M4 3.2c.3-.2.7-.2 1.1 0l9.2 5.2L12.6 12 4 3.2Z" opacity=".7" /><path d="m14.3 15.6-9.2 5.2c-.4.2-.8.2-1.1 0L12.6 12l1.7 3.6Z" opacity=".8" /></svg>
);
export const IconMenu = (p: IconProps) => (
  <svg {...base} {...p}><path d="M4 7h16M4 12h16M4 17h16" /></svg>
);
export const IconClose = (p: IconProps) => (
  <svg {...base} {...p}><path d="M6 6l12 12M18 6 6 18" /></svg>
);
export const IconInstagram = (p: IconProps) => (
  <svg {...base} {...p}><rect x="3.5" y="3.5" width="17" height="17" rx="4.5" /><circle cx="12" cy="12" r="3.6" /><circle cx="16.8" cy="7.2" r="1" fill="currentColor" stroke="none" /></svg>
);
export const IconYouTube = (p: IconProps) => (
  <svg {...base} {...p}><rect x="3" y="6" width="18" height="12" rx="3.5" /><path d="m10.5 9.5 4.5 2.5-4.5 2.5v-5Z" fill="currentColor" stroke="none" /></svg>
);
