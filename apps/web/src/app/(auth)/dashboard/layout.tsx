import { DashboardNav } from "@/components/dashboard-nav";
import { PageTransition } from "@/components/page-transition";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-screen font-body transition-colors duration-200"
      style={{ backgroundColor: "var(--bg)", color: "var(--fg)" }}
    >
      <DashboardNav />
      <main>
        <PageTransition>{children}</PageTransition>
      </main>
    </div>
  );
}