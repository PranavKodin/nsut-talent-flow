export type Society = {
  slug: string;
  name: string;
  short: string;
  category: string;
  tagline: string;
  about: string;
  roles: string[];
  accent: string; // css color
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
    accent: "oklch(0.72 0.17 190)",
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
    accent: "oklch(0.7 0.19 265)",
  },
  {
    slug: "axiom",
    name: "Axiom",
    short: "AX",
    category: "Cultural",
    tagline: "The dramatics society.",
    about: "Street plays, stage productions and a green room that never sleeps before fest week.",
    roles: ["Actor", "Script", "Backstage", "Marketing"],
    accent: "oklch(0.75 0.18 25)",
  },
  {
    slug: "junoon",
    name: "Junoon",
    short: "JN",
    category: "Cultural",
    tagline: "Dance like the whole campus is watching.",
    about: "Western, classical and hip-hop crews competing across the Delhi circuit.",
    roles: ["Dancer", "Choreography", "Production", "Social Media"],
    accent: "oklch(0.75 0.2 330)",
  },
  {
    slug: "enactus",
    name: "Enactus NSUT",
    short: "EN",
    category: "Entrepreneurship",
    tagline: "Social impact, business first.",
    about: "Running self-sustaining social projects with real revenue and real beneficiaries.",
    roles: ["Project Lead", "Finance", "Outreach", "Design"],
    accent: "oklch(0.8 0.16 145)",
  },
  {
    slug: "moksha",
    name: "Moksha Media",
    short: "MM",
    category: "Media",
    tagline: "Every frame of campus life.",
    about: "Photography, films and the visual identity of NSUT's biggest fests.",
    roles: ["Photographer", "Video Editor", "Graphic Design", "Writer"],
    accent: "oklch(0.82 0.15 85)",
  },
];

export function societyBySlug(slug: string) {
  return SOCIETIES.find((s) => s.slug === slug);
}
