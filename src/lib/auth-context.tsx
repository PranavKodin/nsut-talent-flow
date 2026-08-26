import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";
import {
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  query,
  collection,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { getFirebase } from "./firebase";

export type Role = "member" | "head" | "admin";

/** Emails that always get the admin role on first sign-in. */
export const ADMIN_EMAILS: string[] = [];

export type Profile = {
  uid: string;
  email: string;
  name: string;
  role: Role;
  society: string | null;
  // college details
  rollNumber: string;
  branch: string;
  year: string;
  phone: string;
  residence: string;
  cgpa: string;
  skills: string;
  bio: string;
  links: string;
  profileComplete: boolean;
};

export const emptyDetails = {
  rollNumber: "",
  branch: "",
  year: "",
  phone: "",
  residence: "",
  cgpa: "",
  skills: "",
  bio: "",
  links: "",
};

type AuthValue = {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (name: string, email: string, password: string) => Promise<void>;
  saveProfile: (patch: Partial<Profile>) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthValue | null>(null);

async function ensureProfile(user: User): Promise<void> {
  const { db } = await getFirebase();
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return;

  // Bootstrap: the very first account on the platform becomes the admin.
  let role: Role = "member";
  try {
    const existing = await getDocs(query(collection(db, "users"), limit(1)));
    if (existing.empty) role = "admin";
  } catch {
    /* rules may block the probe — stay a member */
  }
  if (ADMIN_EMAILS.includes((user.email ?? "").toLowerCase())) role = "admin";

  await setDoc(ref, {
    uid: user.uid,
    email: user.email ?? "",
    name: user.displayName ?? (user.email ?? "").split("@")[0],
    role,
    society: null,
    ...emptyDetails,
    profileComplete: false,
    createdAt: serverTimestamp(),
  });
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubProfile: (() => void) | undefined;
    let active = true;

    const start = async () => {
      const { auth, db } = await getFirebase();
      onAuthStateChanged(auth, async (u) => {
        if (!active) return;
        unsubProfile?.();
        setUser(u);
        if (!u) {
          setProfile(null);
          setLoading(false);
          return;
        }
        try {
          await ensureProfile(u);
        } catch (err) {
          console.error("profile init failed", err);
        }
        unsubProfile = onSnapshot(
          doc(db, "users", u.uid),
          (snap) => {
            const data = snap.data();
            setProfile(
              data
                ? {
                    uid: u.uid,
                    email: (data['email'] as string) ?? u.email ?? "",
                    name: (data['name'] as string) ?? "",
                    role: (data['role'] as Role) ?? "member",
                    society: (data['society'] as string | null) ?? null,
                    rollNumber: (data['rollNumber'] as string) ?? "",
                    branch: (data['branch'] as string) ?? "",
                    year: (data['year'] as string) ?? "",
                    phone: (data['phone'] as string) ?? "",
                    residence: (data['residence'] as string) ?? "",
                    cgpa: (data['cgpa'] as string) ?? "",
                    skills: (data['skills'] as string) ?? "",
                    bio: (data['bio'] as string) ?? "",
                    links: (data['links'] as string) ?? "",
                    profileComplete: Boolean(data['profileComplete']),
                  }
                : null,
            );
            setLoading(false);
          },
          () => setLoading(false),
        );
      });
    };

    void start();
    return () => {
      active = false;
      unsubProfile?.();
    };
  }, []);

  const value: AuthValue = {
    user,
    profile,
    loading,
    signInWithGoogle: async () => {
      const { auth } = await getFirebase();
      await signInWithPopup(auth, new GoogleAuthProvider());
    },
    signInWithEmail: async (email, password) => {
      const { auth } = await getFirebase();
      await signInWithEmailAndPassword(auth, email, password);
    },
    signUpWithEmail: async (name, email, password) => {
      const { auth } = await getFirebase();
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name });
      await ensureProfile(cred.user);
    },
    saveProfile: async (patch) => {
      if (!user) throw new Error("Not signed in");
      const { db } = await getFirebase();
      await updateDoc(doc(db, "users", user.uid), { ...patch });
    },
    logout: async () => {
      const { auth } = await getFirebase();
      await signOut(auth);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
