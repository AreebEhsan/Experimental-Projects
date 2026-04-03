import Link from "next/link";

const features = [
  {
    href: "/timer",
    icon: "⏱",
    title: "Smart Timer",
    desc: "Spacebar timer, 15s inspection, penalties, session tracking, Ao5/Ao12.",
  },
  {
    href: "/algorithms",
    icon: "📚",
    title: "Algorithms Hub",
    desc: "Browse all 57 OLL and 21 PLL cases. Track what you've learned.",
  },
  {
    href: "/cube",
    icon: "🟥",
    title: "3D Cube",
    desc: "Interactive 3D visualization with animated move playback.",
  },
  {
    href: "/solver",
    icon: "🔍",
    title: "Kociemba Solver",
    desc: "Input your cube state and get an optimal solution instantly.",
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-full px-6 py-20 text-center">
      <h1
        className="text-5xl font-bold mb-4 tracking-tight"
        style={{ color: "var(--text-primary)" }}
      >
        CubeTrack
      </h1>
      <p className="text-lg mb-16 max-w-md" style={{ color: "var(--text-muted)" }}>
        Your serious speedcubing training platform. Timer, solver, algorithms, and 3D visualization.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl w-full">
        {features.map(({ href, icon, title, desc }) => (
          <Link
            key={href}
            href={href}
            className="rounded-xl p-6 text-left transition-all hover:scale-[1.02]"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
            }}
          >
            <div className="text-3xl mb-3">{icon}</div>
            <h2 className="font-semibold text-base mb-1" style={{ color: "var(--text-primary)" }}>
              {title}
            </h2>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              {desc}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
