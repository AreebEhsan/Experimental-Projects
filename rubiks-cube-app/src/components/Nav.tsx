"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/timer", label: "Timer" },
  { href: "/algorithms", label: "Algorithms" },
  { href: "/cube", label: "3D Cube" },
  { href: "/solver", label: "Solver" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <header
      style={{
        background: "var(--surface)",
        borderBottom: "1px solid var(--border)",
      }}
      className="flex items-center justify-between px-6 py-3 shrink-0"
    >
      <Link
        href="/"
        className="text-lg font-bold tracking-tight"
        style={{ color: "var(--accent)" }}
      >
        CubeTrack
      </Link>

      <nav className="flex items-center gap-1">
        {links.map(({ href, label }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className="rounded px-3 py-1.5 text-sm font-medium transition-colors"
              style={{
                color: active ? "var(--text-primary)" : "var(--text-muted)",
                background: active ? "var(--surface-raised)" : "transparent",
              }}
            >
              {label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
