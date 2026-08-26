import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { toast } from "sonner";
import { SiteHeader } from "@/components/SiteHeader";
import { societyBySlug } from "@/lib/societies";
import { getFirebase } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/societies/$slug")({
  loader: ({ params }) => {
    const society = societyBySlug(params.slug);
    if (!society) throw notFound();
    return { society };
  },
  head: ({ loaderData }) => {
    const s = loaderData?.society;
    const title = s ? `${s.name} — NSUT Societies` : "Society — NSUT Societies";
    const description = s ? `${s.tagline} ${s.about}` : "NSUT society recruitment page.";
    return {
      meta: [
        { title },
        { name: "description", content: description.slice(0, 155) },
        { property: "og:title", content: title },
        { property: "og:description", content: description.slice(0, 155) },
      ],
    };
  },
  component: SocietyPage,
});

function SocietyPage() {
  const { society } = Route.useLoaderData();
  const { user, profile } = useAuth();
  const [hiringOpen, setHiringOpen] = useState(false);
  const [applied, setApplied] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ role: society.roles[0], year: "1st", why: "", links: "" });

  useEffect(() => {
    let unsub: (() => void) | undefined;
    void getFirebase().then(({ db }) => {
      unsub = onSnapshot(
        doc(db, "societies", society.slug),
        (snap) => setHiringOpen(Boolean(snap.data()?.['hiringOpen'])),
        () => undefined,
      );
    });
    return () => unsub?.();
  }, [society.slug]);

  useEffect(() => {
    if (!user) return;
    let unsub: (() => void) | undefined;
    void getFirebase().then(({ db }) => {
      unsub = onSnapshot(
        query(
          collection(db, "applications"),
          where("uid", "==", user.uid),
          where("society", "==", society.slug),
        ),
        (snap) => setApplied(!snap.empty),
        () => undefined,
      );
    });
    return () => unsub?.();
  }, [user, society.slug]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setBusy(true);
    try {
      const { db } = await getFirebase();
      await addDoc(collection(db, "applications"), {
        uid: user.uid,
        name: profile?.name ?? user.displayName ?? "",
        email: user.email ?? "",
        society: society.slug,
        societyName: society.name,
        ...form,
        status: "pending",
        createdAt: serverTimestamp(),
      });
      toast.success("Application submitted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not submit");
    } finally {
      setBusy(false);
    }
  };

  const field = "glass w-full rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring";

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-4 py-14">
        <div className="glass-strong animate-rise relative overflow-hidden rounded-3xl p-8">
          <div
            className="absolute -top-24 -right-10 h-64 w-64 rounded-full opacity-40 blur-3xl"
            style={{ background: society.accent }}
          />
          <div
            className="font-display flex h-16 w-16 items-center justify-center rounded-3xl text-xl font-bold"
            style={{ background: society.accent, color: "oklch(0.16 0.035 275)" }}
          >
            {society.short}
          </div>
          <h1 className="font-display mt-5 text-4xl font-bold">{society.name}</h1>
          <p className="mt-2 text-lg text-muted-foreground">{society.tagline}</p>
          <p className="mt-4 max-w-2xl text-sm text-muted-foreground">{society.about}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {society.roles.map((r) => (
              <span key={r} className="glass rounded-full px-3 py-1 text-xs">
                {r}
              </span>
            ))}
          </div>
          <span
            className={`mt-6 inline-block rounded-full px-4 py-1.5 text-sm ${
              hiringOpen ? "bg-accent font-semibold text-accent-foreground" : "glass text-muted-foreground"
            }`}
          >
            {hiringOpen ? "Recruitment open" : "Recruitment closed"}
          </span>
        </div>

        <div className="glass mt-6 rounded-3xl p-8">
          <h2 className="font-display text-2xl font-bold">Hiring form</h2>
          {!hiringOpen ? (
            <p className="mt-3 text-sm text-muted-foreground">
              {society.name} isn't hiring right now. The form appears here the moment the society
              head opens recruitment.
            </p>
          ) : !user ? (
            <div className="mt-3">
              <p className="text-sm text-muted-foreground">Sign in to fill this form.</p>
              <Link
                to="/auth"
                className="bg-gradient-hero mt-4 inline-block rounded-2xl px-5 py-2.5 text-sm font-semibold text-primary-foreground"
              >
                Sign in
              </Link>
            </div>
          ) : applied ? (
            <p className="mt-3 text-sm text-accent">
              You've already applied to {society.name}. Track the status in your dashboard.
            </p>
          ) : (
            <form onSubmit={submit} className="mt-5 space-y-3">
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className={field}
              >
                {society.roles.map((r) => (
                  <option key={r} value={r} className="bg-card">
                    {r}
                  </option>
                ))}
              </select>
              <select
                value={form.year}
                onChange={(e) => setForm({ ...form, year: e.target.value })}
                className={field}
              >
                {["1st", "2nd", "3rd", "4th"].map((y) => (
                  <option key={y} value={y} className="bg-card">
                    {y} year
                  </option>
                ))}
              </select>
              <textarea
                required
                rows={4}
                value={form.why}
                onChange={(e) => setForm({ ...form, why: e.target.value })}
                placeholder={`Why do you want to join ${society.name}?`}
                className={field}
              />
              <input
                value={form.links}
                onChange={(e) => setForm({ ...form, links: e.target.value })}
                placeholder="Portfolio / GitHub / Drive link (optional)"
                className={field}
              />
              <button
                disabled={busy}
                className="bg-gradient-hero w-full rounded-2xl px-4 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02] disabled:opacity-50"
              >
                {busy ? "Submitting…" : "Submit application"}
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
