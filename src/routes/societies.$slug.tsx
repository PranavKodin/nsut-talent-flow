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
import { DEFAULT_FORM_FIELDS, useSocieties, type FormField } from "@/lib/societies";
import { getFirebase } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/societies/$slug")({
  loader: ({ params }) => ({ slug: params.slug }),
  head: ({ loaderData }) => {
    const title = loaderData?.slug ? `${loaderData.slug} — NSUT Societies` : "Society — NSUT Societies";
    const description = "Explore this NSUT society, learn about its work and apply when recruitment opens.";
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
  const { slug } = Route.useLoaderData();
  const { societies, loading } = useSocieties();
  const society = societies.find((item) => item.slug === slug);
  const { user, profile } = useAuth();
  const [applied, setApplied] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});
  const configuredFields: FormField[] = society?.formFields?.length ? society.formFields : DEFAULT_FORM_FIELDS;

  useEffect(() => {
    if (!society) return;
    setForm((current) => {
      const next: Record<string, string> = {};
      for (const field of configuredFields) next[field.id] = current[field.id] ?? "";
      return next;
    });
  }, [society?.slug, society?.formFields]);

  useEffect(() => {
    if (!user || !society) return;
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
  }, [user, society?.slug]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <p className="mx-auto max-w-4xl px-4 py-24 text-center text-muted-foreground">Loading society…</p>
      </div>
    );
  }

  if (!society) {
    throw notFound();
  }

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
        role: form['role'] ?? society.roles[0] ?? "Member",
        ...Object.fromEntries(configuredFields.map((field) => [field.id, form[field.id] ?? ""])),
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
          {society.imageUrl ? (
            <img
              src={society.imageUrl}
              alt={`${society.name} cover`}
              className="mb-6 h-48 w-full rounded-2xl object-cover"
            />
          ) : null}
          {society.logoUrl ? (
            <img
              src={society.logoUrl}
              alt={`${society.name} logo`}
              className="h-16 w-16 rounded-3xl object-cover"
            />
          ) : (
            <div
              className="font-display flex h-16 w-16 items-center justify-center rounded-3xl text-xl font-bold"
              style={{ background: society.accent, color: "oklch(0.14 0.045 300)" }}
            >
              {society.short}
            </div>
          )}
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
              society.hiringOpen ? "bg-accent font-semibold text-accent-foreground" : "glass text-muted-foreground"
            }`}
          >
             {society.hiringOpen ? "Recruitment open" : "Recruitment closed"}
          </span>
        </div>

        <div className="glass mt-6 rounded-3xl p-8">
          {society.formImageUrl ? (
            <img
              src={society.formImageUrl}
              alt={`${society.name} hiring banner`}
              className="mb-5 h-44 w-full rounded-2xl object-cover"
              loading="lazy"
            />
          ) : null}
          <h2 className="font-display text-2xl font-bold">Hiring form</h2>
          {society.formIntro ? (
            <p className="mt-2 text-sm text-muted-foreground">{society.formIntro}</p>
          ) : null}
           {!society.hiringOpen ? (
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
                value={form['role'] ?? society.roles[0] ?? ""}
                onChange={(e) => setForm({ ...form, ['role']: e.target.value })}
                className={field}
              >
                {society.roles.map((r) => (
                  <option key={r} value={r} className="bg-card">
                    {r}
                  </option>
                ))}
              </select>
               {configuredFields.map((configuredField) => (
                 <label key={configuredField.id} className="block space-y-2">
                   <span className="text-sm font-medium">{configuredField.label}</span>
                   {configuredField.type === "textarea" ? (
                     <textarea
                       required={configuredField.required}
                       rows={4}
                       value={form[configuredField.id] ?? ""}
                       onChange={(e) => setForm({ ...form, [configuredField.id]: e.target.value })}
                       className={field}
                     />
                   ) : configuredField.type === "select" ? (
                     <select
                       required={configuredField.required}
                       value={form[configuredField.id] ?? ""}
                       onChange={(e) => setForm({ ...form, [configuredField.id]: e.target.value })}
                       className={field}
                     >
                       <option value="" className="bg-card">Select an option</option>
                       {(configuredField.options ?? []).map((option) => (
                         <option key={option} value={option} className="bg-card">{option}</option>
                       ))}
                     </select>
                   ) : (
                     <input
                       required={configuredField.required}
                       value={form[configuredField.id] ?? ""}
                       onChange={(e) => setForm({ ...form, [configuredField.id]: e.target.value })}
                       className={field}
                     />
                   )}
                 </label>
               ))}
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
