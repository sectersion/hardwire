import { getAuthUser } from "@/lib/auth/get-auth-user";
import { getCachetUser } from "@/lib/cachet";
import { BottomBar } from "@/components/bottom-bar";
import { Role } from "shared";
import { hasRole } from "@/lib/auth/roles";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAuthUser();
  const cachetUser = await getCachetUser(user.slackUserId);

  // user.roles is typed as Prisma's generated Role enum (from
  // .prisma/client), which has the same string values as shared's
  // Role enum ("USER", "ADMIN", etc.) but is a structurally distinct
  // TS type since enums are nominally typed. The cast is safe here
  // because the underlying string values are identical at runtime.
  const isAdmin = hasRole(user.roles as unknown as Role[], Role.ADMIN);

  return (
    <div
      className="h-screen overflow-hidden font-body transition-colors duration-200"
      style={{ backgroundColor: "var(--bg)", color: "var(--fg)" }}
    >
      <main className="h-full min-w-0 overflow-hidden pb-16">{children}</main>
      <BottomBar showAdminLink={isAdmin} profileImageUrl={cachetUser?.imageUrl} />
    </div>
  );
}