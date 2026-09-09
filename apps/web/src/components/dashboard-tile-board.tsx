"use client";

import { useEffect, useRef, type ReactNode } from "react";

const PAN_DURATION_MS = 350;
const ANCHOR_RATIO = 0.2;

function easeOutBack(t: number) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

export function DashboardTileBoard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const getTiles = () =>
      Array.from(container.querySelectorAll<HTMLElement>("[data-dashboard-tile]"));

    const cancelPan = () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };

    const panTo = (targetScrollLeft: number) => {
      cancelPan();
      const start = container.scrollLeft;
      const distance = targetScrollLeft - start;
      const startTime = performance.now();

      const step = (now: number) => {
        const elapsed = now - startTime;
        const t = Math.min(elapsed / PAN_DURATION_MS, 1);
        container.scrollLeft = start + distance * easeOutBack(t);
        if (t < 1) {
          rafRef.current = requestAnimationFrame(step);
        } else {
          rafRef.current = null;
        }
      };
      rafRef.current = requestAnimationFrame(step);
    };

    const panToTile = (tile: HTMLElement) => {
      const containerRect = container.getBoundingClientRect();
      const tileRect = tile.getBoundingClientRect();
      const anchor = containerRect.width * ANCHOR_RATIO;
      const currentOffset = tileRect.left - containerRect.left;
      const target = container.scrollLeft + currentOffset - anchor;

      const maxScrollLeft = container.scrollWidth - container.clientWidth;
      panTo(Math.max(0, Math.min(target, maxScrollLeft)));
    };

    const handlePointerOver = (e: PointerEvent) => {
      const tile = (e.target as HTMLElement).closest<HTMLElement>("[data-dashboard-tile]");
      if (tile && container.contains(tile)) {
        panToTile(tile);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      const tiles = getTiles();
      if (tiles.length === 0) return;

      const active = document.activeElement as HTMLElement | null;
      const currentIndex = active ? tiles.indexOf(active) : -1;

      let nextIndex: number;
      if (currentIndex === -1) {
        nextIndex = e.key === "ArrowRight" ? 0 : tiles.length - 1;
      } else {
        nextIndex =
          e.key === "ArrowRight"
            ? Math.min(currentIndex + 1, tiles.length - 1)
            : Math.max(currentIndex - 1, 0);
      }

      const next = tiles[nextIndex];
      if (next) {
        e.preventDefault();
        next.focus();
        panToTile(next);
      }
    };

    container.addEventListener("pointerover", handlePointerOver);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      container.removeEventListener("pointerover", handlePointerOver);
      window.removeEventListener("keydown", handleKeyDown);
      cancelPan();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ gridTemplateRows: "auto auto" }}
      className={`w-full grid grid-flow-col items-start gap-2 md:gap-3 overflow-x-auto overflow-y-visible pb-6 scrollbar-none touch-pan-x ${className}`}
    >
      {children}
    </div>
  );
}