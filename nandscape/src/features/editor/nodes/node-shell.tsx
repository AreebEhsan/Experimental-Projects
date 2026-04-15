"use client";

import type { ReactNode } from "react";

interface NodeShellProps {
  title: string;
  subtitle: string;
  signal: string;
  accentClass: string;
  children?: ReactNode;
}

export function NodeShell({
  title,
  subtitle,
  signal,
  accentClass,
  children,
}: NodeShellProps) {
  return (
    <div
      className={`w-44 rounded-xl border border-slate-700/60 bg-slate-950/90 p-3 text-slate-100 shadow-lg shadow-cyan-500/10 ${accentClass}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.22em] text-slate-400">{subtitle}</p>
          <p className="text-sm font-semibold text-white">{title}</p>
        </div>
        <div className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-xs font-semibold">
          {signal}
        </div>
      </div>
      {children}
    </div>
  );
}
