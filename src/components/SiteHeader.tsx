import { Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";

export function SiteHeader() {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 px-4 pt-4">
      <div className="glass mx-auto flex max-w-6xl items-center justify-between rounded-2xl px-5 py-3">
        <Link to="/" className="font-display text-lg font-bold tracking-tight">
          NSUT<span className="text-gradient">.socs</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          <Link to="/societies" className="transition-colors hover:text-foreground">
            Societies
          </Link>
          {user ? (
            <Link to="/dashboard" className="transition-colors hover:text-foreground">
              Dashboard
            </Link>
          ) : null}
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <span className="hidden text-xs text-muted-foreground sm:block">
                {profile?.name || user.email} · {profile?.role ?? "member"}
              </span>
              <button
                onClick={async () => {
                  await logout();
                  void navigate({ to: "/" });
                }}
                className="glass rounded-xl px-3 py-1.5 text-sm transition-transform hover:scale-[1.03]"
              >
                Log out
              </button>
            </>
          ) : (
            <Link
              to="/auth"
              className="bg-gradient-hero rounded-xl px-4 py-1.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.03]"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
