import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CalendarCheck, Layers, ShieldCheck, Sparkles, Users } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { LoadingScreen } from "@/components/LoadingScreen";
import { useSocieties } from "@/lib/societies";
import { useSiteStats } from "@/lib/admin";
import hero1 from "@/assets/hero-1.jpg";
import hero2 from "@/assets/hero-2.jpg";
import hero3 from "@/assets/hero-3.jpg";
import hero4 from "@/assets/hero-4.jpg";

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

const features = [
  {
    icon: Sparkles,
    title: "One profile, every society",
    body: "Sign in once with Google or email and apply anywhere on campus.",
  },
  {
    icon: CalendarCheck,
    title: "Hiring toggles",
    body: "Recruitment forms open and close from the admin panel in one click.",
  },
  {
    icon: Layers,
    title: "Role dashboards",
    body: "Separate views for members, society heads and the platform admin.",
  },
  {
    icon: ShieldCheck,
    title: "Secure by default",
    body: "Firebase authentication with per-role access to applicant data.",
  },
];

const steps = [
  { n: "01", t: "Create your profile", d: "Sign in and fill your full college details once." },
  { n: "02", t: "Pick a society", d: "Read what each team does and what roles are open." },
  { n: "03", t: "Apply & track", d: "Submit the form and follow your status live." },
];

function Index() {
  const { societies } = useSocieties();
  const { stats } = useSiteStats();

  const statCards = [
    { label: "Societies", value: stats.societies || societies.length },
    { label: "Students", value: stats.members },
    { label: "Applications", value: stats.applications },
    { label: "Hiring now", value: stats.openRoles },
  ];

  return (
    <div className="min-h-screen">
      <LoadingScreen />
      <SiteHeader />

      <main className="mx-auto max-w-6xl px-4 pb-24">
        {/* HERO — text left, angled photos right */}
        <section className="grid items-center gap-12 pt-16 md:grid-cols-[1.05fr_0.95fr] md:pt-24">
          <div className="animate-rise text-left">
            <div className="glass mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs text-muted-foreground">
              <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
              Recruitment season is live at NSUT
            </div>

            <h1 className="text-5xl leading-[0.95] font-bold md:text-7xl">
              <span className="font-display block tracking-tight">Join the</span>
              <span className="text-gradient font-display block text-6xl italic md:text-8xl">
                society
              </span>
              <span className="font-sans block text-4xl font-light tracking-[0.18em] text-muted-foreground uppercase md:text-5xl">
                that fits you
              </span>
            </h1>

            <p className="mt-7 max-w-lg text-base text-muted-foreground md:text-lg">
              A single hiring platform for every NSUT society — discover teams, fill recruitment
              forms and follow your application from screening to selection.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
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
          </div>

          <div className="relative h-[26rem] md:h-[32rem]">
            <div className="glass absolute top-0 left-2 w-48 -rotate-6 overflow-hidden rounded-3xl p-2 transition-transform duration-500 hover:rotate-0 md:w-56">
              <img
                src={hero1}
                alt="NSUT students building projects at a late-night hackathon"
                width={800}
                height={1000}
                className="h-56 w-full rounded-2xl object-cover md:h-64"
              />
            </div>
            <div className="glass-strong absolute top-24 right-0 w-52 rotate-[7deg] overflow-hidden rounded-3xl p-2 transition-transform duration-500 hover:rotate-0 md:w-64">
              <img
                src={hero2}
                alt="Cultural society performance under stage lights"
                width={800}
                height={1000}
                loading="lazy"
                className="h-64 w-full rounded-2xl object-cover md:h-72"
              />
            </div>
            <div className="glass absolute bottom-0 left-10 w-44 rotate-[3deg] overflow-hidden rounded-3xl p-2 transition-transform duration-500 hover:rotate-0 md:w-52">
              <img
                src={hero3}
                alt="Society members planning recruitment together"
                width={800}
                height={1000}
                loading="lazy"
                className="h-44 w-full rounded-2xl object-cover md:h-52"
              />
            </div>
            <div className="glass-strong absolute right-16 -bottom-6 hidden w-40 -rotate-[5deg] overflow-hidden rounded-3xl p-2 transition-transform duration-500 hover:rotate-0 md:block md:w-48">
              <img
                src={hero4}
                alt="Tech society members coding together at a night hackathon"
                width={800}
                height={1008}
                loading="lazy"
                className="h-40 w-full rounded-2xl object-cover md:h-48"
              />
            </div>
          </div>
        </section>

        {/* Marquee strip */}
        <section className="glass mt-14 overflow-hidden rounded-2xl py-3">
          <div className="animate-marquee flex w-max gap-10 whitespace-nowrap">
            {[...societies, ...societies].map((s, i) => (
              <span
                key={`${s.slug}-${i}`}
                className="font-display text-sm tracking-[0.25em] text-muted-foreground uppercase"
              >
                {s.name} <span className="text-primary">✦</span>
              </span>
            ))}
          </div>
        </section>

        {/* Live numbers */}
        <section className="mt-14 grid grid-cols-2 gap-3 md:grid-cols-4">
          {statCards.map((s, i) => (
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
        </section>

        <section className="mt-20 grid gap-4 md:grid-cols-2">
          {features.map((f) => (
            <div
              key={f.title}
              className="glass group rounded-3xl p-6 transition-transform duration-300 hover:-translate-y-1"
            >
              <div className="glass-strong mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl">
                <f.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </section>

        {/* How it works */}
        <section className="mt-20">
          <h2 className="font-display text-3xl font-bold">
            How it <span className="text-gradient italic">works</span>
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {steps.map((s) => (
              <div key={s.n} className="glass rounded-3xl p-6">
                <div className="font-display text-5xl font-bold text-primary/30">{s.n}</div>
                <h3 className="mt-3 text-lg font-semibold">{s.t}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-20">
          <div className="mb-6 flex items-end justify-between">
            <h2 className="font-display text-3xl font-bold">Featured societies</h2>
            <Link to="/societies" className="text-sm text-primary hover:underline">
              View all
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {societies.slice(0, 3).map((s) => (
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
                <span className="mt-4 inline-flex items-center gap-1 text-sm text-primary">
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
