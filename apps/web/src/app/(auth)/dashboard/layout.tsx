import { DashboardNav } from "@/components/dashboard-nav";
import { getAuthUser } from "@/lib/auth/get-auth-user";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAuthUser();
  // Anyone with a role beyond plain USER (reviewer, admin, etc.) gets the
  // admin panel link in the nav.
  const isPrivileged = user.roles?.some((r: string) => r !== "USER") ?? false;
  return (
    <div
      className="min-h-screen font-body transition-colors duration-200"
      style={{ backgroundColor: "var(--bg)", color: "var(--fg)" }}
    >
      <DashboardNav showAdminLink={isPrivileged} />
      <main>{children}</main>
    </div>
  );
}