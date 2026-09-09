import { getAuthUser } from "@/lib/auth/get-auth-user";
import { getCachetUser } from "@/lib/cachet";
import { BottomBar } from "@/components/bottom-bar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAuthUser();
  const cachetUser = await getCachetUser(user.slackUserId);
  const isAdmin = user.role === "ADMIN"; // placeholder — send roles.ts and I'll correct this

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