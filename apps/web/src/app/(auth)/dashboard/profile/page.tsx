import { getAuthUser } from "@/lib/auth/get-auth-user";
import { ThemeToggle } from "@/components/theme-toggle";

const ACCENT = "#FF1500";

export default async function ProfilePage() {
  const user = await getAuthUser();

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-12">
      <h1 className="font-display text-4xl md:text-5xl font-extrabold lowercase leading-none mb-10">
        profile<span style={{ color: ACCENT }}>.</span>
      </h1>

      <div className="border-2 border-[var(--fg)] p-6 max-w-md mb-6">
        <div className="mb-4">
          <div className="text-xs uppercase tracking-widest text-[var(--muted)] mb-1">
            Name
          </div>
          <div className="font-display font-bold">
            {user.firstName} {user.lastName}
          </div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-widest text-[var(--muted)] mb-1">
            Email
          </div>
          <div className="font-body text-sm">{user.email}</div>
        </div>
      </div>

      <div className="mb-6">
        <ThemeToggle />
      </div>

      {/* NOTE: point this at your actual logout route */}
      <a
        href="/api/auth/logout"
        className="inline-block border-2 px-6 py-3 font-bold text-sm hover:bg-[var(--fg)] hover:text-[var(--bg)] transition-colors"
        style={{ borderColor: "var(--fg)" }}
      >
        Sign out
      </a>
    </div>
  );
}