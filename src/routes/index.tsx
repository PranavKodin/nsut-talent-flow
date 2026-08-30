import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CalendarCheck, Layers, ShieldCheck, Sparkles, Users } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SOCIETIES } from "@/lib/societies";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NSUT Societies — One place for campus recruitment" },
      {
        name: "description",
        content:
          "Explore every NSUT society, track open recruitments and apply with a single profile. Built for members, society heads and admins.",
      },
      { property: "og:title", content: "NSUT Societies — One place for campus recruitment" },
      {
        property: "og:description",
        content: "Explore societies, apply to open hiring rounds and manage recruitment dashboards.",
      },
    ],
  }),
  component: Index,
});

const stats = [
  { label: "Societies", value: `${SOCIETIES.length}+` },
  { label: "Applications", value: "2.4k" },
  { label: "Roles open", value: "24" },
  { label: "Avg. reply", value: "48h" },
];

const features = [
  {
    icon: Sparkles,
    title: "One profile, every society",
    body: "Sign in once with Google or email and apply anywhere on campus.",
  },
  {
    icon: CalendarCheck,
    title: "Hiring toggles",
    body: "Society heads open and close recruitment forms in a single click.",
  },
  {
    icon: Layers,
    title: "Role dashboards",
    body: "Separate views for members, society heads and platform admins.",
  },
  {
    icon: ShieldCheck,
    title: "Secure by default",
    body: "Firebase authentication with per-role access to applicant data.",
  },
];

function Index() {
  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main className="mx-auto max-w-6xl px-4 pb-24">
        <section className="animate-rise pt-20 pb-16 text-center md:pt-28">
          <div className="glass mx-auto mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-accent" />
            Recruitment season is live at NSUT
          </div>
          <h1 className="font-display text-5xl leading-[1.05] font-bold md:text-7xl">
            Join the society
            <br />
            <span className="text-gradient">that fits you.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base text-muted-foreground md:text-lg">
            A single hiring platform for every NSUT society — discover teams, fill recruitment forms
            and follow your application from screening to selection.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/societies"
              className="bg-gradient-hero group inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.04]"
            >
              Explore societies
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/auth"
              className="glass inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-semibold transition-transform hover:scale-[1.04]"
            >
              <Users className="h-4 w-4" /> Create your profile
            </Link>
          </div>

          <div className="mt-16 grid grid-cols-2 gap-3 md:grid-cols-4">
            {stats.map((s, i) => (
              <div
                key={s.label}
                className="glass animate-rise rounded-2xl px-4 py-5"
                style={{ animationDelay: `${i * 90}ms` }}
              >
                <div className="font-display text-3xl font-bold">{s.value}</div>
                <div className="mt-1 text-xs tracking-wide text-muted-foreground uppercase">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          {features.map((f) => (
            <div
              key={f.title}
              className="glass group rounded-3xl p-6 transition-transform duration-300 hover:-translate-y-1"
            >
              <div className="glass-strong mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl">
                <f.icon className="h-5 w-5 text-accent" />
              </div>
              <h3 className="text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </section>

        <section className="mt-20">
          <div className="mb-6 flex items-end justify-between">
            <h2 className="font-display text-3xl font-bold">Featured societies</h2>
            <Link to="/societies" className="text-sm text-accent hover:underline">
              View all
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {SOCIETIES.slice(0, 3).map((s) => (
              <Link
                key={s.slug}
                to="/societies/$slug"
                params={{ slug: s.slug }}
                className="glass group relative overflow-hidden rounded-3xl p-6 transition-transform duration-300 hover:-translate-y-1.5"
              >
                <div
                  className="absolute -top-16 -right-16 h-40 w-40 rounded-full opacity-40 blur-3xl transition-opacity group-hover:opacity-70"
                  style={{ background: s.accent }}
                />
                <div
                  className="font-display flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-bold"
                  style={{ background: s.accent, color: "oklch(0.14 0.045 300)" }}
                >
                  {s.short}
                </div>
                <h3 className="mt-4 text-xl font-semibold">{s.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.tagline}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm text-accent">
                  Apply <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="glass-strong mt-20 rounded-3xl p-10 text-center">
          <h2 className="font-display text-3xl font-bold md:text-4xl">
            Running a society? <span className="text-gradient">Hire smarter.</span>
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground">
            Society heads get a dashboard to open recruitment, review applicants and shortlist —
            without a single spreadsheet.
          </p>
          <Link
            to="/auth"
            className="bg-gradient-hero mt-7 inline-flex rounded-2xl px-6 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.04]"
          >
            Get started
          </Link>
        </section>
      </main>

      <footer className="border-t border-border/50 py-8 text-center text-xs text-muted-foreground">
        Built for the societies of Netaji Subhas University of Technology.
      </footer>
    </div>
  );
}
