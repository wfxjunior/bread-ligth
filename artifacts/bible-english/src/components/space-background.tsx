import { useEffect, useRef, useState } from 'react';
import { gradientCss, type ReadingSpaceData } from '../lib/reading-spaces';

/**
 * Renders the active Reading Space's background gradient and smoothly
 * crossfades to a new gradient whenever the space changes — mirrors
 * artifacts/mobile/components/SpaceBackground.tsx so switching atmospheres
 * never produces a hard flash. Absolutely fills its positioned parent.
 */
export function SpaceBackground({
  space,
  className = '',
  duration = 420,
}: {
  space: ReadingSpaceData;
  className?: string;
  duration?: number;
}) {
  const [base, setBase] = useState(space);
  const [incoming, setIncoming] = useState<ReadingSpaceData | null>(null);
  const [fadeIn, setFadeIn] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (space.gradient[0] === base.gradient[0] && space.gradient[1] === base.gradient[1] && space.gradient[2] === base.gradient[2]) {
      return;
    }
    setIncoming(space);
    setFadeIn(false);
    // Trigger the transition on the next frame so the opacity actually animates.
    const raf = requestAnimationFrame(() => setFadeIn(true));
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setBase(space);
      setIncoming(null);
      setFadeIn(false);
    }, duration);
    return () => {
      cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [space.gradient[0], space.gradient[1], space.gradient[2]]);

  useEffect(() => () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); }, []);

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`} aria-hidden>
      <div className="absolute inset-0" style={{ background: gradientCss(base.gradient) }} />
      {incoming && (
        <div
          className="absolute inset-0 transition-opacity"
          style={{ background: gradientCss(incoming.gradient), opacity: fadeIn ? 1 : 0, transitionDuration: `${duration}ms` }}
        />
      )}
    </div>
  );
}
