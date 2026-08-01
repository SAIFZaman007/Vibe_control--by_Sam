import { useRef, useState, useCallback } from "react";

/**
 * Draggable before/after comparison. `before` and `after` are React nodes
 * (usually <img> / <AuthImage>). This is the satisfying "reveal" moment after a
 * style is applied.
 */
export default function CompareSlider({ before, after }) {
  const containerRef = useRef(null);
  const [pos, setPos] = useState(50); // percent revealed of the "after" layer

  const setFromClientX = useCallback((clientX) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.max(0, Math.min(100, pct)));
  }, []);

  const onPointerDown = (e) => {
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setFromClientX(e.clientX);
  };
  const onPointerMove = (e) => {
    if (e.buttons !== 1) return;
    setFromClientX(e.clientX);
  };

  return (
    <div
      ref={containerRef}
      className="relative aspect-[4/3] w-full cursor-ew-resize select-none overflow-hidden rounded-2xl border border-line bg-ink/5 touch-none"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
    >
      {/* Base layer: the stylized "after" */}
      <div className="absolute inset-0">{after}</div>

      {/* Top layer: the original "before", clipped to the slider position */}
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        {before}
      </div>

      {/* Labels */}
      <span className="absolute bottom-2 left-2 rounded-md bg-ink/70 px-2 py-0.5 text-[11px] font-semibold text-white">
        Before
      </span>
      <span className="absolute bottom-2 right-2 rounded-md bg-vibe-gradient px-2 py-0.5 text-[11px] font-semibold text-white">
        After
      </span>

      {/* Handle */}
      <div
        className="pointer-events-none absolute inset-y-0 flex items-center"
        style={{ left: `calc(${pos}% - 1px)` }}
      >
        <div className="h-full w-0.5 bg-white/90 shadow" />
        <div className="absolute left-1/2 grid h-8 w-8 -translate-x-1/2 place-items-center rounded-full border-2 border-white bg-vibe-gradient text-white shadow-lift">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M9 6L3 12l6 6M15 6l6 6-6 6" />
          </svg>
        </div>
      </div>
    </div>
  );
}
