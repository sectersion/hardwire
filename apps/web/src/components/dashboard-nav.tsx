"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/logo";
import { useTheme } from "@/components/theme-provider";

const ACCENT = "#FF1500";

const links = [
  { href: "/dashboard", label: "dashboard" },
  { href: "/dashboard/explore", label: "explore" },
  { href: "/dashboard/docs", label: "docs" },
  { href: "/dashboard/shop", label: "shop" },
];

export function DashboardNav() {
  const pathname = usePathname();
  const { theme } = useTheme();
  const logoVariant = theme === "dark" ? "darkmode" : "lightmode";

  return (
    <header
      className="sticky top-0 z-40 border-b-2"
      style={{ backgroundColor: "var(--bg)", borderColor: "var(--fg)" }}
    >
      <nav className="max-w-6xl mx-auto h-20 flex items-center px-4 md:px-6 gap-8">
        <Link href="/dashboard" className="shrink-0">
          <Logo variant={logoVariant} className="h-9 w-auto block" />
        </Link>

        <ul className="hidden md:flex items-center gap-6 font-body">
          {links.map((link) => {
            const active =
              link.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(link.href);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm font-bold uppercase tracking-widest transition-opacity"
                  style={{
                    color: "var(--fg)",
                    opacity: active ? 1 : 0.5,
                  }}
                >
                  {link.label}
                  {active && <span style={{ color: ACCENT }}>.</span>}
                </Link>
              </li>
            );
          })}
        </ul>

        <Link
          href="/dashboard/profile"
          className="ml-auto w-10 h-10 border-2 flex items-center justify-center text-sm font-bold shrink-0"
          style={{ borderColor: "var(--fg)", color: "var(--fg)" }}
          aria-label="Profile"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
          </svg>
        </Link>
      </nav>

      {/* mobile links */}
      <ul className="md:hidden flex items-center gap-5 px-4 pb-4 font-body overflow-x-auto">
        {links.map((link) => {
          const active =
            link.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(link.href);
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-xs font-bold uppercase tracking-widest whitespace-nowrap"
                style={{ color: "var(--fg)", opacity: active ? 1 : 0.5 }}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </header>
  );
}