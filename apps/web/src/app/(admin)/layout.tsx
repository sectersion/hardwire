import { requireAdmin } from "@/lib/auth/require-admin"
import { redirect } from "next/navigation"
import Link from "next/link"

const navItems = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/submissions", label: "Submissions" },
  { href: "/admin/shipments", label: "Shipments" },
  { href: "/admin/users", label: "Users" },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  try {
    await requireAdmin()
  } catch {
    redirect("/")
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-56 border-r border-white/10 p-6">
        <Link href="/admin" className="text-lg font-bold tracking-tight mb-8 block">hardwire admin</Link>
        <nav className="space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block text-sm text-muted hover:text-white transition-colors py-1"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  )
}
