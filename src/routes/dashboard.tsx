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
import { SOCIETIES } from "@/lib/societies";

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
                ? `Run recruitment for ${SOCIETIES.find((s) => s.slug === profile.society)?.name ?? "your society"}.`
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
  const meta = SOCIETIES.find((s) => s.slug === society);

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

function AdminView() {
  const apps = useApplications(null, null);
  const [users, setUsers] = useState<UserRow[]>([]);

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
          { label: "Societies", value: SOCIETIES.length },
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
          {SOCIETIES.map((s) => (
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
                  {SOCIETIES.map((s) => (
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
