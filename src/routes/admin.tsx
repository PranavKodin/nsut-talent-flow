import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { toast } from "sonner";
import { SiteHeader } from "@/components/SiteHeader";
import { getFirebase } from "@/lib/firebase";
import { useIsAdmin, useSiteStats, ADMIN_EMAIL, type SiteStats } from "@/lib/admin";
import { useSocieties, type Society } from "@/lib/societies";
import type { Role } from "@/lib/auth-context";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Panel — NSUT Societies" },
      {
        name: "description",
        content:
          "Owner-only control room for NSUT Societies: manage societies, recruitment forms, users and every published number.",
      },
      { property: "og:title", content: "Admin Panel — NSUT Societies" },
      { property: "og:description", content: "Manage societies, recruitment and platform data." },
    ],
  }),
  component: AdminPage,
});

type UserRow = { id: string; name: string; email: string; role: Role; society: string | null };
type AppRow = {
  id: string;
  name: string;
  email: string;
  societyName: string;
  role: string;
  status: string;
};

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="glass rounded-3xl p-6">
      <h2 className="font-display text-2xl font-bold">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function AdminPage() {
  const { isAdmin, loading, user } = useIsAdmin();

  if (loading) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <p className="mx-auto max-w-4xl px-4 py-24 text-center text-muted-foreground">
          Checking access…
        </p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <div className="glass mx-auto mt-24 max-w-md rounded-3xl p-10 text-center">
          <h1 className="font-display text-3xl font-bold">Restricted</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            The admin panel is only available to {ADMIN_EMAIL}.
            {user ? ` You are signed in as ${user.email}.` : " Sign in with that account."}
          </p>
          <Link
            to="/auth"
            className="bg-gradient-hero mt-6 inline-flex rounded-xl px-5 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-5xl space-y-6 px-4 py-12">
        <div className="glass-strong animate-rise rounded-3xl p-8">
          <p className="text-xs tracking-widest text-muted-foreground uppercase">Owner access</p>
          <h1 className="font-display mt-2 text-4xl font-bold">
            Admin <span className="text-gradient italic">panel</span>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Everything on the site — societies, recruitment forms, users and published numbers — is
            editable from here.
          </p>
        </div>

        <NumbersManager />
        <SocietyManager />
        <UsersManager />
        <ApplicationsManager />
      </main>
    </div>
  );
}

function NumbersManager() {
  const { live, overrides } = useSiteStats();
  const keys: Array<keyof SiteStats> = ["societies", "members", "applications", "openRoles"];
  const [draft, setDraft] = useState<Record<string, string>>({});

  const save = async (key: keyof SiteStats, value: string) => {
    const { db } = await getFirebase();
    const trimmed = value.trim();
    await setDoc(
      doc(db, "settings", "landing"),
      { [key]: trimmed === "" ? null : Number(trimmed) },
      { merge: true },
    );
    toast.success(trimmed === "" ? "Back to live count" : "Number updated");
  };

  return (
    <Card title="Landing page numbers">
      <p className="-mt-2 mb-4 text-sm text-muted-foreground">
        These are live counts from the database. Leave a field empty to keep it live, or type a
        value to publish that number instead.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {keys.map((k) => (
          <div key={k} className="glass rounded-2xl p-4">
            <p className="text-xs tracking-wide text-muted-foreground uppercase">{k}</p>
            <p className="text-xs text-muted-foreground">Live: {live[k]}</p>
            <div className="mt-2 flex gap-2">
              <input
                type="number"
                value={draft[k] ?? (overrides[k] != null ? String(overrides[k]) : "")}
                onChange={(e) => setDraft((d) => ({ ...d, [k]: e.target.value }))}
                placeholder="live"
                className="glass w-full rounded-xl px-3 py-2 text-sm outline-none"
              />
              <button
                onClick={() => void save(k, draft[k] ?? "")}
                className="bg-gradient-hero rounded-xl px-3 py-2 text-xs font-semibold text-primary-foreground"
              >
                Save
              </button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

const blank = {
  slug: "",
  name: "",
  short: "",
  category: "Technical",
  tagline: "",
  about: "",
  roles: "",
  accent: "oklch(0.72 0.17 300)",
  imageUrl: "",
};

function SocietyManager() {
  const { societies } = useSocieties();
  const [form, setForm] = useState({ ...blank });

  const write = async (slug: string, patch: Partial<Society>) => {
    const { db } = await getFirebase();
    await setDoc(doc(db, "societies", slug), patch, { merge: true });
  };

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    const slug = form.slug.trim().toLowerCase().replace(/\s+/g, "-");
    if (!slug || !form.name.trim()) {
      toast.error("Slug and name are required");
      return;
    }
    try {
      await write(slug, {
        name: form.name.trim(),
        short: form.short.trim() || form.name.slice(0, 2).toUpperCase(),
        category: form.category,
        tagline: form.tagline,
        about: form.about,
         imageUrl: form.imageUrl.trim(),
        roles: form.roles
          .split(",")
          .map((r) => r.trim())
          .filter(Boolean),
        accent: form.accent,
        hiringOpen: false,
        removed: false,
      });
      setForm({ ...blank });
      toast.success("Society saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    }
  };

  return (
    <Card title="Societies & recruitment forms">
      <div className="space-y-2">
        {societies.map((s) => (
          <div key={s.slug} className="glass rounded-2xl p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold">{s.name}</p>
                <p className="text-xs text-muted-foreground">
                  {s.category} · {s.roles.length} roles
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => void write(s.slug, { hiringOpen: !s.hiringOpen, name: s.name })}
                  className={`rounded-xl px-3 py-1.5 text-xs font-semibold ${
                    s.hiringOpen
                      ? "bg-gradient-hero text-primary-foreground"
                      : "glass text-muted-foreground"
                  }`}
                >
                  {s.hiringOpen ? "Form open" : "Form closed"}
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Remove ${s.name} from the site?`))
                      void write(s.slug, { removed: true }).then(() => toast.success("Removed"));
                  }}
                  className="glass rounded-xl px-3 py-1.5 text-xs"
                >
                  Remove
                </button>
              </div>
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <input
                defaultValue={s.name}
                onBlur={(e) => void write(s.slug, { name: e.target.value })}
                className="glass rounded-xl px-3 py-2 text-sm outline-none"
                placeholder="Name"
              />
              <input
                defaultValue={s.tagline}
                onBlur={(e) => void write(s.slug, { tagline: e.target.value })}
                className="glass rounded-xl px-3 py-2 text-sm outline-none"
                placeholder="Tagline"
              />
              <input
                defaultValue={s.roles.join(", ")}
                onBlur={(e) =>
                  void write(s.slug, {
                    roles: e.target.value
                      .split(",")
                      .map((r) => r.trim())
                      .filter(Boolean),
                  })
                }
                className="glass rounded-xl px-3 py-2 text-sm outline-none sm:col-span-2"
                placeholder="Roles, comma separated"
              />
              <textarea
                defaultValue={s.about}
                onBlur={(e) => void write(s.slug, { about: e.target.value })}
                className="glass min-h-20 rounded-xl px-3 py-2 text-sm outline-none sm:col-span-2"
                placeholder="About"
              />
               <input
                 defaultValue={s.imageUrl ?? ""}
                 onBlur={(e) => void write(s.slug, { imageUrl: e.target.value.trim() })}
                 className="glass rounded-xl px-3 py-2 text-sm outline-none sm:col-span-2"
                 placeholder="Society card image URL (admin only)"
               />
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={create} className="glass-strong mt-5 grid gap-2 rounded-2xl p-4 sm:grid-cols-2">
        <p className="font-display text-lg font-bold sm:col-span-2">Add a society</p>
        <input
          value={form.slug}
          onChange={(e) => setForm({ ...form, slug: e.target.value })}
          placeholder="url-slug"
          className="glass rounded-xl px-3 py-2 text-sm outline-none"
        />
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Society name"
          className="glass rounded-xl px-3 py-2 text-sm outline-none"
        />
        <input
          value={form.short}
          onChange={(e) => setForm({ ...form, short: e.target.value })}
          placeholder="Badge (2 letters)"
          className="glass rounded-xl px-3 py-2 text-sm outline-none"
        />
        <input
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          placeholder="Category"
          className="glass rounded-xl px-3 py-2 text-sm outline-none"
        />
        <input
          value={form.tagline}
          onChange={(e) => setForm({ ...form, tagline: e.target.value })}
          placeholder="Tagline"
          className="glass rounded-xl px-3 py-2 text-sm outline-none sm:col-span-2"
        />
        <input
          value={form.roles}
          onChange={(e) => setForm({ ...form, roles: e.target.value })}
          placeholder="Roles, comma separated"
          className="glass rounded-xl px-3 py-2 text-sm outline-none sm:col-span-2"
        />
        <textarea
          value={form.about}
          onChange={(e) => setForm({ ...form, about: e.target.value })}
          placeholder="About this society"
          className="glass min-h-20 rounded-xl px-3 py-2 text-sm outline-none sm:col-span-2"
        />
        <input
          value={form.imageUrl}
          onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
          placeholder="Society card image URL (optional)"
          className="glass rounded-xl px-3 py-2 text-sm outline-none sm:col-span-2"
        />
        <button className="bg-gradient-hero rounded-xl px-4 py-2 text-sm font-semibold text-primary-foreground sm:col-span-2">
          Save society
        </button>
      </form>
    </Card>
  );
}

function UsersManager() {
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
    <Card title={`People & roles (${users.length})`}>
      <div className="space-y-3">
        {users.length === 0 ? (
          <p className="text-sm text-muted-foreground">No accounts yet.</p>
        ) : null}
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
                onChange={(e) => void update(u.id, { role: e.target.value as Role })}
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
                onChange={(e) => void update(u.id, { society: e.target.value || null })}
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
  );
}

function ApplicationsManager() {
  const [apps, setApps] = useState<AppRow[]>([]);

  useEffect(() => {
    let unsub: (() => void) | undefined;
    void getFirebase().then(({ db }) => {
      unsub = onSnapshot(
        collection(db, "applications"),
        (snap) => setApps(snap.docs.map((d) => ({ id: d.id, ...(d.data() as object) }) as AppRow)),
        () => undefined,
      );
    });
    return () => unsub?.();
  }, []);

  const setStatus = async (id: string, status: string) => {
    const { db } = await getFirebase();
    await updateDoc(doc(db, "applications", id), { status });
    toast.success(`Marked ${status}`);
  };

  const remove = async (id: string) => {
    const { db } = await getFirebase();
    await deleteDoc(doc(db, "applications", id));
    toast.success("Application deleted");
  };

  return (
    <Card title={`Applications (${apps.length})`}>
      <div className="space-y-3">
        {apps.length === 0 ? (
          <p className="text-sm text-muted-foreground">No applications submitted yet.</p>
        ) : null}
        {apps.map((a) => (
          <div key={a.id} className="glass rounded-2xl p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-semibold">{a.name || a.email}</p>
                <p className="text-xs text-muted-foreground">
                  {a.societyName} · {a.role}
                </p>
              </div>
              <span className="glass rounded-full px-3 py-1 text-xs capitalize">{a.status}</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {["pending", "shortlisted", "selected", "rejected"].map((s) => (
                <button
                  key={s}
                  onClick={() => void setStatus(a.id, s)}
                  className="glass rounded-xl px-3 py-1.5 text-xs capitalize"
                >
                  {s}
                </button>
              ))}
              <button
                onClick={() => void remove(a.id)}
                className="glass rounded-xl px-3 py-1.5 text-xs text-destructive"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
