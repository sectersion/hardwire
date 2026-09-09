"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { InvertExceptRed } from "./invert-except-red";

interface IconTileProps {
  href: string;
  src: string;
  alt: string;
  width: number;
  height: number;
  title: string;
  gridClassName: string;
  external?: boolean;
}

export function IconTile({
  href,
  src,
  alt,
  width,
  height,
  title,
  gridClassName,
  external = false,
}: IconTileProps) {
  const style: CSSProperties = {
    display: "block",
    width,
    height,
    background: "transparent",
  };

  const img = (
    <InvertExceptRed
      src={src}
      alt={alt}
      width={width}
      height={height}
      draggable={false}
      style={{ display: "block", width, height, background: "transparent" }}
    />
  );

  const className = `${gridClassName} block shrink-0 p-0 m-0 border-0 focus:outline-none`;

  if (external) {
    return (
      <a data-dashboard-tile href={href} target="_blank" rel="noreferrer" title={title} className={className} style={style}>
        {img}
      </a>
    );
  }

  return (
    <Link data-dashboard-tile href={href} title={title} className={className} style={style}>
      {img}
    </Link>
  );
}