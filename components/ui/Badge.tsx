"use client";

import { cn } from "@/lib/utils";

interface BadgeProps {
  label: string;
  color: string;
  size?: "sm" | "md";
  className?: string;
}

export default function Badge({ label, color, size = "md", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs",
        className
      )}
      style={{
        backgroundColor: `${color}22`,
        color: color,
        border: `1px solid ${color}44`,
      }}
    >
      {label}
    </span>
  );
}
