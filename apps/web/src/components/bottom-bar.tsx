"use client";

import Link from "next/link";
import { Logo } from "@/components/logo";
import { useTheme } from "@/components/theme-provider";

const ACCENT = "#FF1500";

interface BottomBarProps {
  showAdminLink?: boolean;
  profileImageUrl?: string | null;
}

export function BottomBar({ showAdminLink = false, profileImageUrl }: BottomBarProps) {
  const { theme } = useTheme();
  const logoVariant = theme === "dark" ? "darkmode" : "lightmode";

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 border-t-2"
      style={{ backgroundColor: "var(--bg)", borderColor: "var(--fg)" }}
    >
      <div className="w-full h-16 flex items-center justify-between pl-6 pr-4 md:pl-8 md:pr-6">
        <Link href="/dashboard" className="shrink-0">
          <Logo variant={logoVariant} className="h-7 w-auto block" />
        </Link>

        <div className="flex items-center gap-3">
          {showAdminLink && (
            <Link
              href="/admin"
              className="text-sm font-bold uppercase tracking-widest border-2 px-4 py-2"
              style={{ borderColor: ACCENT, color: ACCENT }}
            >
              Admin
            </Link>
          )}

          <Link
            href="/dashboard/profile"
            className="w-10 h-10 border-2 flex items-center justify-center text-sm font-bold shrink-0 overflow-hidden"
            style={{ borderColor: "var(--fg)", color: "var(--fg)" }}
            aria-label="Profile"
          >
            {profileImageUrl ? (
              <img src={profileImageUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
              </svg>
            )}
          </Link>
        </div>
      </div>
    </div>
  );
}