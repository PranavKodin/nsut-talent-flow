import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { getFirebase } from "./firebase";

export type Society = {
  slug: string;
  name: string;
  short: string;
  category: string;
  tagline: string;
  about: string;
  roles: string[];
  accent: string; // css color
  hiringOpen?: boolean;
  removed?: boolean;
};

export const SOCIETIES: Society[] = [
  {
    slug: "devcomm",
    name: "Devcomm",
    short: "DC",
    category: "Technical",
    tagline: "Build the web NSUT runs on.",
    about:
      "The developer community of NSUT — shipping products, hosting hackathons and mentoring first-time builders.",
    roles: ["Frontend Developer", "Backend Developer", "Design", "Content"],
    accent: "oklch(0.62 0.2 300)",
  },
  {
    slug: "iecse",
    name: "IEEE NSUT",
    short: "IE",
    category: "Technical",
    tagline: "Engineering beyond the syllabus.",
    about:
      "Research talks, robotics builds and industry workshops driven by students who like hard problems.",
    roles: ["Technical", "Research", "Sponsorship", "Operations"],
    accent: "oklch(0.7 0.19 300)",
  },
  {
    slug: "axiom",
    name: "Axiom",
    short: "AX",
    category: "Cultural",
    tagline: "The dramatics society.",
    about: "Street plays, stage productions and a green room that never sleeps before fest week.",
    roles: ["Actor", "Script", "Backstage", "Marketing"],
    accent: "oklch(0.78 0.16 305)",
  },
  {
    slug: "junoon",
    name: "Junoon",
    short: "JN",
    category: "Cultural",
    tagline: "Dance like the whole campus is watching.",
    about: "Western, classical and hip-hop crews competing across the Delhi circuit.",
    roles: ["Dancer", "Choreography", "Production", "Social Media"],
    accent: "oklch(0.55 0.2 300)",
  },
  {
    slug: "enactus",
    name: "Enactus NSUT",
    short: "EN",
    category: "Entrepreneurship",
    tagline: "Social impact, business first.",
    about: "Running self-sustaining social projects with real revenue and real beneficiaries.",
    roles: ["Project Lead", "Finance", "Outreach", "Design"],
    accent: "oklch(0.85 0.12 300)",
  },
  {
    slug: "moksha",
    name: "Moksha Media",
    short: "MM",
    category: "Media",
    tagline: "Every frame of campus life.",
    about: "Photography, films and the visual identity of NSUT's biggest fests.",
    roles: ["Photographer", "Video Editor", "Graphic Design", "Writer"],
    accent: "oklch(0.48 0.18 300)",
  },
];

export function societyBySlug(slug: string) {
  return SOCIETIES.find((s) => s.slug === slug);
}

/**
 * Live society list: built-in defaults merged with whatever admins have
 * created / edited / removed in the `societies` Firestore collection.
 */
export function useSocieties() {
  const [overrides, setOverrides] = useState<Record<string, Partial<Society>> | null>(null);

  useEffect(() => {
    let unsub: (() => void) | undefined;
    void getFirebase().then(({ db }) => {
      unsub = onSnapshot(
        collection(db, "societies"),
        (snap) => {
          const next: Record<string, Partial<Society>> = {};
          snap.forEach((d) => {
            next[d.id] = { slug: d.id, ...(d.data() as Partial<Society>) };
          });
          setOverrides(next);
        },
        () => setOverrides({}),
      );
    });
    return () => unsub?.();
  }, []);

  const map = new Map<string, Society>();
  for (const s of SOCIETIES) map.set(s.slug, { ...s });
  for (const [slug, patch] of Object.entries(overrides ?? {})) {
    const base = map.get(slug);
    if (base) map.set(slug, { ...base, ...patch, slug });
    else
      map.set(slug, {
        slug,
        name: patch.name ?? slug,
        short: patch.short ?? slug.slice(0, 2).toUpperCase(),
        category: patch.category ?? "Other",
        tagline: patch.tagline ?? "",
        about: patch.about ?? "",
        roles: patch.roles ?? ["Member"],
        accent: patch.accent ?? "oklch(0.72 0.17 300)",
        hiringOpen: patch.hiringOpen ?? false,
        removed: patch.removed ?? false,
      });
  }

  const societies = Array.from(map.values()).filter((s) => !s.removed);
  return { societies, loading: overrides === null };
}
