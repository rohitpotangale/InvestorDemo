"use client";

import React from "react";

interface ShimmerTextProps {
  children: React.ReactNode;
  className?: string;
  as?: "span" | "div" | "p";
}

export default function ShimmerText({
  children,
  className = "",
  as: Component = "span",
}: ShimmerTextProps) {
  return (
    <Component className={`il-shimmer ${className}`}>
      {children}
    </Component>
  );
}