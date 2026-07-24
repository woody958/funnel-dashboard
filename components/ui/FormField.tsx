"use client";

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface FormFieldProps {
  label: string;
  children: ReactNode;
  className?: string;
}

export function FormField({ label, children, className }: FormFieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label className="text-xs font-medium text-slate-400">{label}</label>
      {children}
    </div>
  );
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "w-full rounded-lg border border-[#2A2D45] bg-[#0F1117] px-3 py-2 text-sm text-slate-200 placeholder-slate-500",
        "focus:border-[#4F8EF7] focus:ring-1 focus:ring-[#4F8EF7]",
        className
      )}
      {...props}
    />
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string;
}

export function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        "w-full rounded-lg border border-[#2A2D45] bg-[#0F1117] px-3 py-2 text-sm text-slate-200 placeholder-slate-500 resize-none",
        "focus:border-[#4F8EF7] focus:ring-1 focus:ring-[#4F8EF7]",
        className
      )}
      {...props}
    />
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  className?: string;
  children: ReactNode;
}

export function Select({ className, children, ...props }: SelectProps) {
  return (
    <select
      className={cn(
        "w-full rounded-lg border border-[#2A2D45] bg-[#0F1117] px-3 py-2 text-sm text-slate-200",
        "focus:border-[#4F8EF7] focus:ring-1 focus:ring-[#4F8EF7]",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md";
  children: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition-all";
  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
  };
  const variants = {
    primary:
      "bg-[#4F8EF7] text-white hover:bg-[#3B7DE8] disabled:opacity-50 disabled:cursor-not-allowed",
    secondary:
      "border border-[#2A2D45] bg-[#252840] text-slate-300 hover:bg-[#363A55] hover:text-white",
    danger:
      "bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/30 hover:bg-[#EF4444]/30",
    ghost: "text-slate-400 hover:bg-[#252840] hover:text-white",
  };

  return (
    <button
      className={cn(base, sizes[size], variants[variant], className)}
      {...props}
    >
      {children}
    </button>
  );
}
