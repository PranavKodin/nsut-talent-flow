import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { useSocieties } from "@/lib/societies";

export const Route = createFileRoute("/societies/")({
  head: () => ({
    meta: [
      { title: "All Societies — NSUT Societies" },
      {
        name: "description",
        content:
          "Browse every technical, cultural and media society at NSUT and see which recruitments are currently open.",
      },
      { property: "og:title", content: "All Societies — NSUT Societies" },
      {
        property: "og:description",
        content: "Browse NSUT societies and open recruitment rounds.",
      },
    ],
  }),
  component: SocietiesPage,
});

function SocietiesPage() {
  const { societies, loading } = useSocieties();
  const [filter, setFilter] = useState("All");
  const categories = ["All", ...Array.from(new Set(societies.map((s) => s.category)))];

  const list = societies.filter((s) => filter === "All" || s.category === filter);

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-14">
        <h1 className="font-display text-4xl font-bold md:text-5xl">
          Societies at <span className="text-gradient">NSUT</span>
        </h1>
        <p className="mt-3 max-w-xl text-muted-foreground">
          Pick a society to read what they do and fill their hiring form when recruitment is open.
        </p>

        <div className="mt-8 flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`rounded-full px-4 py-1.5 text-sm transition-all ${
                filter === c
                  ? "bg-gradient-hero font-semibold text-primary-foreground"
                  : "glass text-muted-foreground hover:text-foreground"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {loading ? <p className="mt-8 text-sm text-muted-foreground">Loading societies…</p> : null}
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {list.map((s, i) => (
            <Link
              key={s.slug}
              to="/societies/$slug"
              params={{ slug: s.slug }}
              className="glass animate-rise group relative overflow-hidden rounded-3xl p-6 transition-transform duration-300 hover:-translate-y-1.5"
              style={{ animationDelay: `${i * 70}ms` }}
            >
              <div
                className="absolute -top-20 -right-20 h-44 w-44 rounded-full opacity-30 blur-3xl transition-opacity group-hover:opacity-70"
                style={{ background: s.accent }}
              />
              {s.imageUrl ? (
                <img
                  src={s.imageUrl}
                  alt={`${s.name} society cover`}
                  className="mb-5 h-36 w-full rounded-2xl object-cover"
                  loading="lazy"
                />
              ) : null}
              <div className="flex items-start justify-between">
                {s.logoUrl ? (
                  <img
                    src={s.logoUrl}
                    alt={`${s.name} logo`}
                    className="h-12 w-12 rounded-2xl object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div
                    className="font-display flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-bold"
                    style={{ background: s.accent, color: "oklch(0.14 0.045 300)" }}
                  >
                    {s.short}
                  </div>
                )}
                <span
                  className={`rounded-full px-3 py-1 text-xs ${
                    s.hiringOpen ? "bg-accent text-accent-foreground" : "glass text-muted-foreground"
                  }`}
                >
                  {s.hiringOpen ? "Hiring open" : "Closed"}
                </span>
              </div>
              <h2 className="mt-4 text-xl font-semibold">{s.name}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{s.tagline}</p>
              <p className="mt-3 text-xs tracking-wide text-muted-foreground uppercase">
                {s.category}
              </p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
