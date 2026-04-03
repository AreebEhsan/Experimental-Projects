import Link from "next/link";

export default function AlgorithmsPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-full px-6 py-20 text-center">
      <h1 className="text-3xl font-bold mb-3" style={{ color: "var(--text-primary)" }}>
        Algorithms Hub
      </h1>
      <p className="text-sm mb-12" style={{ color: "var(--text-muted)" }}>
        Browse, learn, and track OLL and PLL cases.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md">
        {[
          { href: "/algorithms/oll", label: "OLL", count: 57, desc: "Orient Last Layer" },
          { href: "/algorithms/pll", label: "PLL", count: 21, desc: "Permute Last Layer" },
        ].map(({ href, label, count, desc }) => (
          <Link
            key={href}
            href={href}
            className="rounded-xl p-8 hover:scale-[1.02] transition-all"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <div
              className="text-5xl font-black mb-2"
              style={{ color: "var(--accent)" }}
            >
              {label}
            </div>
            <div className="font-semibold" style={{ color: "var(--text-primary)" }}>
              {count} cases
            </div>
            <div className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
              {desc}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
