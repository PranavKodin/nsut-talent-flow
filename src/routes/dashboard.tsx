import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { toast } from "sonner";
import { SiteHeader } from "@/components/SiteHeader";
import { getFirebase } from "@/lib/firebase";
import { useAuth, type Role } from "@/lib/auth-context";
import { DEFAULT_FORM_FIELDS, useSocieties, type FormField } from "@/lib/societies";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — NSUT Societies" },
      {
        name: "description",
        content: "Track applications, manage recruitment and review applicants across NSUT societies.",
      },
      { property: "og:title", content: "Dashboard — NSUT Societies" },
      { property: "og:description", content: "Your NSUT societies hiring workspace." },
    ],
  }),
  component: Dashboard,
});

type Application = {
  id: string;
  name: string;
  email: string;
  society: string;
  societyName: string;
  role: string;
  year: string;
  why: string;
  links?: string;
  status: string;
};

type UserRow = { id: string; name: string; email: string; role: Role; society: string | null };

function useApplications(filterSociety: string | null, uid: string | null) {
  const [apps, setApps] = useState<Application[]>([]);
  useEffect(() => {
    let unsub: (() => void) | undefined;
    void getFirebase().then(({ db }) => {
      const base = collection(db, "applications");
      const q = uid
        ? query(base, where("uid", "==", uid))
        : filterSociety
          ? query(base, where("society", "==", filterSociety))
          : query(base, orderBy("createdAt", "desc"));
      unsub = onSnapshot(
        q,
        (snap) =>
          setApps(snap.docs.map((d) => ({ id: d.id, ...(d.data() as object) }) as Application)),
        () => undefined,
      );
    });
    return () => unsub?.();
  }, [filterSociety, uid]);
  return apps;
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`glass rounded-3xl p-6 ${className}`}>{children}</div>;
}

function ApplicantRow({ app, manage }: { app: Application; manage: boolean }) {
  const setStatus = async (status: string) => {
    const { db } = await getFirebase();
    await updateDoc(doc(db, "applications", app.id), { status });
    toast.success(`Marked ${status}`);
  };
  return (
    <div className="glass rounded-2xl p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-semibold">{app.name || app.email}</p>
          <p className="text-xs text-muted-foreground">
            {app.societyName} · {app.role} · {app.year} year
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs capitalize ${
            app.status === "selected"
              ? "bg-accent text-accent-foreground"
              : app.status === "rejected"
                ? "bg-destructive text-destructive-foreground"
                : "glass text-muted-foreground"
          }`}
        >
          {app.status}
        </span>
      </div>
      {app.why ? <p className="mt-3 text-sm text-muted-foreground">{app.why}</p> : null}
      {app.links ? <p className="mt-1 text-xs break-all text-accent">{app.links}</p> : null}
      {manage ? (
        <div className="mt-3 flex gap-2">
          {["shortlisted", "selected", "rejected"].map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className="glass rounded-xl px-3 py-1.5 text-xs capitalize hover:scale-[1.03]"
            >
              {s}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function HiringToggle({ slug, name }: { slug: string; name: string }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    let unsub: (() => void) | undefined;
    void getFirebase().then(({ db }) => {
      unsub = onSnapshot(
        doc(db, "societies", slug),
        (s) => setOpen(Boolean(s.data()?.['hiringOpen'])),
        () => undefined,
      );
    });
    return () => unsub?.();
  }, [slug]);

  const toggle = async () => {
    try {
      const { db } = await getFirebase();
      await setDoc(doc(db, "societies", slug), { hiringOpen: !open, name }, { merge: true });
      toast.success(!open ? `${name} recruitment opened` : `${name} recruitment closed`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    }
  };

  return (
    <div className="glass flex items-center justify-between rounded-2xl px-4 py-3">
      <span className="text-sm font-medium">{name}</span>
      <button
        onClick={toggle}
        className={`relative h-7 w-13 rounded-full transition-colors ${open ? "bg-gradient-hero" : "bg-secondary"}`}
        aria-label={`Toggle hiring for ${name}`}
      >
        <span
          className="absolute top-1 h-5 w-5 rounded-full bg-foreground transition-all"
          style={{ left: open ? "1.75rem" : "0.25rem" }}
        />
      </button>
    </div>
  );
}

function Dashboard() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) void navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  if (loading || !profile) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <div className="mx-auto max-w-4xl px-4 py-24 text-center text-muted-foreground">
          Loading your workspace…
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-5xl space-y-6 px-4 py-12">
        <div className="glass-strong animate-rise rounded-3xl p-8">
          <p className="text-xs tracking-widest text-muted-foreground uppercase">
            {profile.role} dashboard
          </p>
          <h1 className="font-display mt-2 text-4xl font-bold">
            Hey {profile.name?.split(" ")[0] || "there"} 👋
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {profile.role === "admin"
              ? "Manage every society, role and application on the platform."
              : profile.role === "head"
                 ? `Run recruitment for your assigned society.`
                : "Track your society applications in one place."}
          </p>
        </div>

        {profile.role === "member" ? <MemberView uid={profile.uid} /> : null}
        {profile.role === "head" ? <HeadView society={profile.society} /> : null}
        {profile.role === "admin" ? <AdminView /> : null}
      </main>
    </div>
  );
}

function MemberView({ uid }: { uid: string }) {
  const apps = useApplications(null, uid);
  return (
    <Card>
      <h2 className="font-display text-2xl font-bold">My applications</h2>
      {apps.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">
          No applications yet.{" "}
          <Link to="/societies" className="text-accent hover:underline">
            Browse societies
          </Link>
          .
        </p>
      ) : (
        <div className="mt-4 space-y-3">
          {apps.map((a) => (
            <ApplicantRow key={a.id} app={a} manage={false} />
          ))}
        </div>
      )}
    </Card>
  );
}

function HeadView({ society }: { society: string | null }) {
  const apps = useApplications(society, null);
  const { societies } = useSocieties();
  const meta = societies.find((s) => s.slug === society);

  if (!society || !meta) {
    return (
      <Card>
        <h2 className="font-display text-2xl font-bold">No society assigned</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Ask a platform admin to link your account to a society.
        </p>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <h2 className="font-display text-2xl font-bold">Recruitment</h2>
        <p className="mt-1 mb-4 text-sm text-muted-foreground">
          Turn this on to publish the hiring form on your society page.
        </p>
        <HiringToggle slug={meta.slug} name={meta.name} />
      </Card>
      <SocietyEditor society={meta} />
      <Card>
        <h2 className="font-display text-2xl font-bold">Applicants ({apps.length})</h2>
        <div className="mt-4 space-y-3">
          {apps.length === 0 ? (
            <p className="text-sm text-muted-foreground">No applications yet.</p>
          ) : (
            apps.map((a) => <ApplicantRow key={a.id} app={a} manage />)
          )}
        </div>
      </Card>
    </>
  );
}

function SocietyEditor({ society }: { society: NonNullable<ReturnType<typeof useSocieties>["societies"]>[number] }) {
  const [draft, setDraft] = useState({
    tagline: society.tagline,
    about: society.about,
    formIntro: society.formIntro ?? "Tell us what you would bring to the team.",
    imageUrl: society.imageUrl ?? "",
    formImageUrl: society.formImageUrl ?? "",
    logoUrl: society.logoUrl ?? "",
  });
  const [fields, setFields] = useState<FormField[]>(society.formFields?.length ? society.formFields : DEFAULT_FORM_FIELDS);

  useEffect(() => {
    setDraft({
      tagline: society.tagline,
      about: society.about,
      formIntro: society.formIntro ?? "Tell us what you would bring to the team.",
      imageUrl: society.imageUrl ?? "",
      formImageUrl: society.formImageUrl ?? "",
      logoUrl: society.logoUrl ?? "",
    });
    setFields(society.formFields?.length ? society.formFields : DEFAULT_FORM_FIELDS);
  }, [society.slug, society.tagline, society.about, society.formIntro, society.formFields, society.imageUrl, society.formImageUrl, society.logoUrl]);

  const save = async () => {
    try {
      const { db } = await getFirebase();
      await updateDoc(doc(db, "societies", society.slug), { ...draft, formFields: fields });
      toast.success("Society page and form published");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save changes");
    }
  };

  const updateField = (id: string, patch: Partial<FormField>) =>
    setFields((current) => current.map((field) => (field.id === id ? { ...field, ...patch } : field)));

  const addField = () =>
    setFields((current) => [
      ...current,
      { id: `field-${Date.now()}`, label: "New question", type: "text", required: false },
    ]);

  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold">Edit society page</h2>
          <p className="mt-1 text-sm text-muted-foreground">Changes publish directly to your society page and hiring form.</p>
        </div>
        <button onClick={() => void save()} className="bg-gradient-hero rounded-xl px-4 py-2 text-xs font-semibold text-primary-foreground">
          Publish changes
        </button>
      </div>
      <div className="mt-4 grid gap-3">
        <input value={draft.tagline} onChange={(e) => setDraft({ ...draft, tagline: e.target.value })} className="glass rounded-xl px-3 py-2 text-sm outline-none" placeholder="Society tagline" />
        <textarea value={draft.about} onChange={(e) => setDraft({ ...draft, about: e.target.value })} className="glass min-h-24 rounded-xl px-3 py-2 text-sm outline-none" placeholder="About your society" />
        <textarea value={draft.formIntro} onChange={(e) => setDraft({ ...draft, formIntro: e.target.value })} className="glass min-h-20 rounded-xl px-3 py-2 text-sm outline-none" placeholder="Form introduction" />
      </div>
      <div className="mt-5 border-t border-border/50 pt-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold">Application questions</h3>
            <p className="mt-1 text-xs text-muted-foreground">These fields are visible to students when recruitment is open.</p>
          </div>
          <button onClick={addField} className="glass rounded-xl px-3 py-2 text-xs font-semibold">Add question</button>
        </div>
        <div className="mt-3 space-y-3">
          {fields.map((field) => (
            <div key={field.id} className="glass grid gap-2 rounded-2xl p-3 sm:grid-cols-[1fr_auto_auto_auto] sm:items-center">
              <input value={field.label} onChange={(e) => updateField(field.id, { label: e.target.value })} className="glass rounded-xl px-3 py-2 text-sm outline-none" placeholder="Question label" />
              <select value={field.type} onChange={(e) => updateField(field.id, { type: e.target.value as FormField["type"] })} className="glass rounded-xl px-3 py-2 text-xs">
                <option value="text" className="bg-card">Short text</option>
                <option value="textarea" className="bg-card">Long text</option>
                <option value="select" className="bg-card">Select</option>
              </select>
              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                <input type="checkbox" checked={Boolean(field.required)} onChange={(e) => updateField(field.id, { required: e.target.checked })} /> Required
              </label>
              <button onClick={() => setFields((current) => current.filter((item) => item.id !== field.id))} className="glass rounded-xl px-3 py-2 text-xs text-destructive">Remove</button>
              {field.type === "select" ? (
                <input value={(field.options ?? []).join(", ")} onChange={(e) => updateField(field.id, { options: e.target.value.split(",").map((option) => option.trim()).filter(Boolean) })} className="glass rounded-xl px-3 py-2 text-sm outline-none sm:col-span-4" placeholder="Options, comma separated" />
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

function AdminView() {
  const apps = useApplications(null, null);
  const [users, setUsers] = useState<UserRow[]>([]);
  const { societies } = useSocieties();

  useEffect(() => {
    let unsub: (() => void) | undefined;
    void getFirebase().then(({ db }) => {
      unsub = onSnapshot(
        collection(db, "users"),
        (snap) => setUsers(snap.docs.map((d) => ({ id: d.id, ...(d.data() as object) }) as UserRow)),
        () => undefined,
      );
    });
    return () => unsub?.();
  }, []);

  const update = async (id: string, patch: Partial<UserRow>) => {
    try {
      const { db } = await getFirebase();
      await updateDoc(doc(db, "users", id), patch);
      toast.success("User updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    }
  };

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Users", value: users.length },
          { label: "Applications", value: apps.length },
           { label: "Societies", value: societies.length },
        ].map((s) => (
          <Card key={s.label}>
            <div className="font-display text-3xl font-bold">{s.value}</div>
            <div className="mt-1 text-xs tracking-wide text-muted-foreground uppercase">
              {s.label}
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <h2 className="font-display text-2xl font-bold">Recruitment control</h2>
        <div className="mt-4 grid gap-2 md:grid-cols-2">
           {societies.map((s) => (
            <HiringToggle key={s.slug} slug={s.slug} name={s.name} />
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="font-display text-2xl font-bold">People &amp; roles</h2>
        <div className="mt-4 space-y-3">
          {users.map((u) => (
            <div
              key={u.id}
              className="glass flex flex-wrap items-center justify-between gap-3 rounded-2xl p-4"
            >
              <div>
                <p className="text-sm font-semibold">{u.name || u.email}</p>
                <p className="text-xs text-muted-foreground">{u.email}</p>
              </div>
              <div className="flex gap-2">
                <select
                  value={u.role}
                  onChange={(e) => update(u.id, { role: e.target.value as Role })}
                  className="glass rounded-xl px-3 py-2 text-xs"
                >
                  {["member", "head", "admin"].map((r) => (
                    <option key={r} value={r} className="bg-card">
                      {r}
                    </option>
                  ))}
                </select>
                <select
                  value={u.society ?? ""}
                  onChange={(e) => update(u.id, { society: e.target.value || null })}
                  className="glass rounded-xl px-3 py-2 text-xs"
                >
                  <option value="" className="bg-card">
                    No society
                  </option>
                   {societies.map((s) => (
                    <option key={s.slug} value={s.slug} className="bg-card">
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="font-display text-2xl font-bold">All applications ({apps.length})</h2>
        <div className="mt-4 space-y-3">
          {apps.map((a) => (
            <ApplicantRow key={a.id} app={a} manage />
          ))}
        </div>
      </Card>
    </>
  );
}
