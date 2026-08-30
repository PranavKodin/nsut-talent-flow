import { useEffect, useState } from "react";
import { collection, doc, onSnapshot } from "firebase/firestore";
import { getFirebase } from "./firebase";
import { useAuth } from "./auth-context";

/** The only account allowed into the admin panel. */
export const ADMIN_EMAIL = "sunny.pranav2006@gmail.com";

export function useIsAdmin() {
  const { user, loading } = useAuth();
  const isAdmin = (user?.email ?? "").toLowerCase() === ADMIN_EMAIL;
  return { isAdmin, loading, user };
}

export type SiteStats = {
  societies: number;
  members: number;
  applications: number;
  openRoles: number;
};

/**
 * Live platform numbers straight from Firestore, with optional per-metric
 * overrides an admin has set in `settings/landing`.
 */
export function useSiteStats() {
  const [counts, setCounts] = useState<SiteStats>({
    societies: 0,
    members: 0,
    applications: 0,
    openRoles: 0,
  });
  const [overrides, setOverrides] = useState<Partial<Record<keyof SiteStats, number>>>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const unsubs: Array<() => void> = [];
    void getFirebase().then(({ db }) => {
      unsubs.push(
        onSnapshot(
          collection(db, "users"),
          (s) => setCounts((c) => ({ ...c, members: s.size })),
          () => undefined,
        ),
      );
      unsubs.push(
        onSnapshot(
          collection(db, "applications"),
          (s) => setCounts((c) => ({ ...c, applications: s.size })),
          () => undefined,
        ),
      );
      unsubs.push(
        onSnapshot(
          collection(db, "societies"),
          (s) => {
            let open = 0;
            s.forEach((d) => {
              if (d.data()['hiringOpen']) open += 1;
            });
            setCounts((c) => ({ ...c, openRoles: open }));
          },
          () => undefined,
        ),
      );
      unsubs.push(
        onSnapshot(
          doc(db, "settings", "landing"),
          (d) => {
            setOverrides((d.data() as Partial<Record<keyof SiteStats, number>>) ?? {});
            setReady(true);
          },
          () => setReady(true),
        ),
      );
    });
    return () => unsubs.forEach((u) => u());
  }, []);

  const merged: SiteStats = {
    societies: overrides.societies ?? counts.societies,
    members: overrides.members ?? counts.members,
    applications: overrides.applications ?? counts.applications,
    openRoles: overrides.openRoles ?? counts.openRoles,
  };

  return { stats: merged, live: counts, overrides, ready };
}
