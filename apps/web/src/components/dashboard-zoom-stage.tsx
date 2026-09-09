"use client";

import { useEffect, useRef, type ReactNode } from "react";

const ZOOM_DURATION_MS = 350;
const ZOOM_SCALE = 1.1;

function easeOutBack(t: number) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

type Point = { x: number; y: number };

export function DashboardZoomStage({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const currentScaleRef = useRef(1);
  const currentOriginRef = useRef<Point>({ x: 0, y: 0 });
  const originInitializedRef = useRef(false);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const cancel = () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };

    const getOrigin = (tile: HTMLElement): Point => {
      const stageRect = stage.getBoundingClientRect();
      const tileRect = tile.getBoundingClientRect();
      const scale = currentScaleRef.current || 1;
      return {
        x: (tileRect.left + tileRect.width / 2 - stageRect.left) / scale,
        y: (tileRect.top + tileRect.height / 2 - stageRect.top) / scale,
      };
    };

    const zoomTo = (tile: HTMLElement | null) => {
      cancel();
      const startScale = currentScaleRef.current;
      const targetScale = tile ? ZOOM_SCALE : 1;
      const startOrigin = currentOriginRef.current;
      const targetOrigin = tile ? getOrigin(tile) : startOrigin;
      const startTime = performance.now();

      const step = (now: number) => {
        const elapsed = now - startTime;
        const t = Math.min(elapsed / ZOOM_DURATION_MS, 1);
        const eased = easeOutBack(t);

        const scale = startScale + (targetScale - startScale) * eased;
        const originX = startOrigin.x + (targetOrigin.x - startOrigin.x) * eased;
        const originY = startOrigin.y + (targetOrigin.y - startOrigin.y) * eased;

        currentScaleRef.current = scale;
        currentOriginRef.current = { x: originX, y: originY };

        stage.style.transformOrigin = `${originX}px ${originY}px`;
        stage.style.transform = `scale(${scale})`;

        if (t < 1) {
          rafRef.current = requestAnimationFrame(step);
        } else {
          rafRef.current = null;
        }
      };
      rafRef.current = requestAnimationFrame(step);
    };

    const handlePointerOver = (e: PointerEvent) => {
      const target = e.target as HTMLElement;
      const tile = target.closest<HTMLElement>("[data-dashboard-tile]");

      if (tile && stage.contains(tile)) {
        if (!originInitializedRef.current) {
          currentOriginRef.current = getOrigin(tile);
          originInitializedRef.current = true;
        }
        zoomTo(tile);
      } else if (Math.abs(currentScaleRef.current - 1) > 0.001 || rafRef.current !== null) {
        zoomTo(null);
      }
    };

    const handlePointerLeave = () => zoomTo(null);

    stage.addEventListener("pointerover", handlePointerOver);
    stage.addEventListener("pointerleave", handlePointerLeave);
    return () => {
      stage.removeEventListener("pointerover", handlePointerOver);
      stage.removeEventListener("pointerleave", handlePointerLeave);
      cancel();
    };
  }, []);

  return (
    <div ref={stageRef} className={className}>
      {children}
    </div>
  );
}