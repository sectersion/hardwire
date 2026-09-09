"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { useTheme } from "@/components/theme-provider";

interface InvertExceptRedProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  draggable?: boolean;
  style?: CSSProperties;
}

// Match your ACCENT color (#FF1500)
const KEEP_R = 255;
const KEEP_G = 21;
const KEEP_B = 0;
const HUE_TOLERANCE = 40; // degrees, half-width of the "kept as red" band
const HUE_SOFTNESS = 12; // degrees of blend margin around that band
const MIN_SATURATION = 0.35;
const SAT_SOFTNESS = 0.12; // blend margin around the saturation threshold

function rgbToHsl(r: number, g: number, b: number) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  const d = max - min;
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    switch (max) {
      case r: h = ((g - b) / d) % 6; break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h, s };
}

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = Math.min(Math.max((x - edge0) / (edge1 - edge0), 0), 1);
  return t * t * (3 - 2 * t);
}

// Module-level cache so switching themes, or rendering the same asset
// in multiple places, doesn't reprocess the same image repeatedly.
const cache = new Map<string, string>();

export function InvertExceptRed({ src, alt, width, height, className, draggable = false, style }: InvertExceptRedProps) {
  const { theme } = useTheme();
  const [processedSrc, setProcessedSrc] = useState<string | null>(null);

  useEffect(() => {
    if (theme !== "light") {
      setProcessedSrc(null);
      return;
    }

    const cached = cache.get(src);
    if (cached) {
      setProcessedSrc(cached);
      return;
    }

    const img = new Image();
    img.src = src;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const { h: keepHue } = rgbToHsl(KEEP_R, KEEP_G, KEEP_B);

      for (let i = 0; i < data.length; i += 4) {
        const a = data[i + 3];
        if (a === 0) continue;

        const r = data[i], g = data[i + 1], b = data[i + 2];
        const { h, s } = rgbToHsl(r, g, b);
        let hueDiff = Math.abs(h - keepHue);
        if (hueDiff > 180) hueDiff = 360 - hueDiff;

        // keepFactor: 1 = leave color untouched (it's "red enough"),
        // 0 = fully invert. Blended smoothly across the threshold band
        // instead of a hard cutoff, so anti-aliased edge pixels don't
        // flip unpredictably and speckle.
        const satFactor = smoothstep(MIN_SATURATION - SAT_SOFTNESS, MIN_SATURATION + SAT_SOFTNESS, s);
        const hueFactor = 1 - smoothstep(HUE_TOLERANCE - HUE_SOFTNESS, HUE_TOLERANCE + HUE_SOFTNESS, hueDiff);
        const keepFactor = satFactor * hueFactor;

        const invR = 255 - r;
        const invG = 255 - g;
        const invB = 255 - b;

        data[i] = Math.round(invR * (1 - keepFactor) + r * keepFactor);
        data[i + 1] = Math.round(invG * (1 - keepFactor) + g * keepFactor);
        data[i + 2] = Math.round(invB * (1 - keepFactor) + b * keepFactor);
      }

      ctx.putImageData(imageData, 0, 0);
      const dataUrl = canvas.toDataURL();
      cache.set(src, dataUrl);
      setProcessedSrc(dataUrl);
    };
  }, [src, theme]);

  return (
    <img
      src={processedSrc ?? src}
      alt={alt}
      width={width}
      height={height}
      draggable={draggable}
      className={className}
      style={style}
    />
  );
}