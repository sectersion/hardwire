"use client";

import React, { useState } from "react";

const ACCENT = "#FF1500";

const tiers = [
  {
    id: "T1",
    title: "Digital Logic",
    description: "Design and simulate a digital logic circuit",
    reward: "iCE40 FPGA Board",
  },
  {
    id: "T2",
    title: "ASIC Tapeout",
    description: "Complete synthesis and DRC pass for ASIC fabrication",
    reward: "ASIC Shuttle Slot",
  },
  {
    id: "T3",
    title: "Custom Carrier Board",
    description: "Design a custom PCB to carry your ASIC",
    reward: "PCB Fab & Test Components",
  },
];

function Logo({ variant, className = "" }) {
  return (
    <img
      src={`/logo/hardwire-${variant}.svg`}
      alt="hardwire"
      className={className}
    />
  );
}

async function signInWithHackClub() {
  const res = await fetch("/api/auth/login?redirect=/dashboard");
  const data = await res.json();
  window.location.href = data.url;
}

export default function LandingPage() {
  const [theme, setTheme] = useState("dark");
  const isDark = theme === "dark";
  const logoVariant = isDark ? "darkmode" : "lightmode";

  return (
    <div
      className="min-h-screen transition-colors duration-200"
      style={{
        "--bg": isDark ? "#000000" : "#ffffff",
        "--fg": isDark ? "#ffffff" : "#000000",
        "--muted": isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)",
        backgroundColor: "var(--bg)",
        color: "var(--fg)",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Unbounded:wght@400;700;800&family=DM+Sans:wght@400;500;700&display=swap');
        .font-display { font-family: 'Unbounded', sans-serif; }
        .font-body { font-family: 'DM Sans', sans-serif; }
      `}</style>

      <div className="font-body flex flex-col min-h-screen">
        {/* Sticky nav */}
        <header
          className="sticky top-0 z-40"
          style={{ backgroundColor: "var(--bg)" }}
        >
          <nav className="h-20 flex items-center px-6 relative">
            <div className="absolute left-1/2 -translate-x-1/2">
              <Logo variant={logoVariant} className="h-12" />
            </div>
            <button
              onClick={signInWithHackClub}
              className="ml-auto px-5 py-2 text-sm font-bold border-2 transition-colors"
              style={{
                backgroundColor: "var(--fg)",
                color: "var(--bg)",
                borderColor: "var(--fg)",
              }}
            >
              Sign in with Hack Club
            </button>
          </nav>
        </header>

        <main className="flex-1">
          {/* Hero */}
          <section className="max-w-6xl mx-auto px-4 pt-16 pb-16 text-center">
            <div
              className="inline-flex items-center gap-2 px-3 py-1 border-2 text-xs font-medium uppercase tracking-widest mb-6"
              style={{ borderColor: "var(--fg)" }}
            >
              Ages 13–18
            </div>
            <h1 className="font-display text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.05] mb-4 lowercase">
              logic to silicon
              <span style={{ color: ACCENT }}>.</span>
            </h1>
            <p
              className="text-lg font-medium max-w-2xl mx-auto mb-8"
              style={{ color: "var(--muted)" }}
            >
              Ship a validated design. We fabricate and ship your custom
              hardware — from digital logic to a working ASIC.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <button
                onClick={signInWithHackClub}
                className="px-8 py-3 font-bold border-2 transition-colors"
                style={{
                  backgroundColor: "var(--fg)",
                  color: "var(--bg)",
                  borderColor: "var(--fg)",
                }}
              >
                Get started
              </button>
              <a
                href="/resources"
                className="px-8 py-3 font-bold border-2 transition-colors inline-block"
                style={{ borderColor: "var(--fg)" }}
              >
                Learn more
              </a>
            </div>
          </section>

          {/* Tiers */}
          <section className="max-w-6xl mx-auto px-4 py-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-12">
              Engineering Progression
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {tiers.map((tier) => (
                <div
                  key={tier.id}
                  className="border-2 p-6 transition-colors"
                  style={{ borderColor: "var(--fg)" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "var(--fg)";
                    e.currentTarget.style.color = "var(--bg)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = "var(--fg)";
                  }}
                >
                  <div
                    className="w-10 h-10 border-2 mb-4 flex items-center justify-center text-sm font-bold"
                    style={{ borderColor: "currentColor" }}
                  >
                    {tier.id}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{tier.title}</h3>
                  <p className="text-sm opacity-70 mb-4">
                    {tier.description}
                  </p>
                  <div
                    className="border-t-2 pt-4 mt-4"
                    style={{ borderColor: "currentColor" }}
                  >
                    <span className="text-xs uppercase tracking-widest opacity-50">
                      Reward
                    </span>
                    <p className="text-sm font-bold">{tier.reward}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Powered by Hack Club */}
          <section className="max-w-3xl mx-auto px-4 py-16 text-center">
            <h2 className="font-display text-3xl font-bold mb-6">
              Powered by Hack Club
            </h2>
            <p className="mb-8" style={{ color: "var(--muted)" }}>
              Hardwire is a 501(c)(3) nonprofit program dedicated to making
              high-end hardware engineering accessible to every teen
              worldwide.
            </p>
            <button
              onClick={signInWithHackClub}
              className="inline-block border-2 px-8 py-3 font-bold transition-colors"
              style={{ borderColor: "var(--fg)" }}
            >
              Join the program
            </button>
          </section>
        </main>

        <footer
          className="border-t-2 pt-12 pb-8"
          style={{ borderColor: "var(--fg)" }}
        >
          <div className="max-w-6xl mx-auto px-4">
            <p className="text-sm mb-2 flex items-center flex-wrap gap-x-2">
              <span>a project by</span>
              <a href="https://hackclub.com" className="underline hover:no-underline">
                hack club
              </a>
              <span>built by the</span>
              <Logo variant={logoVariant} className="h-4 inline-block" />
              <span>team</span>
            </p>
            <p
              className="text-sm max-w-2xl mb-10 leading-relaxed"
              style={{ color: "var(--muted)" }}
            >
              hack club is a 501(c)(3) nonprofit and network of 60k+ technical
              high schoolers. we believe you learn best by building, so
              we&apos;re creating community and providing grants so you can
              make awesome projects.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <h4 className="font-display font-bold text-sm mb-4 lowercase">
                  hack club
                </h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a href="https://hackclub.com/philosophy" style={{ color: "var(--muted)" }}>
                      philosophy
                    </a>
                  </li>
                  <li>
                    <a href="https://hackclub.com/team" style={{ color: "var(--muted)" }}>
                      our team &amp; board
                    </a>
                  </li>
                  <li>
                    <a href="https://hackclub.com/brand" style={{ color: "var(--muted)" }}>
                      branding
                    </a>
                  </li>
                  <li>
                    <a href="https://hackclub.com/philanthropy" style={{ color: "var(--muted)" }}>
                      donate
                    </a>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-display font-bold text-sm mb-4 lowercase">
                  hardwire
                </h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a href="/resources" style={{ color: "var(--muted)" }}>
                      where do i start?
                    </a>
                  </li>
                  <li>
                    <a href="/docs" style={{ color: "var(--muted)" }}>
                      docs
                    </a>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-display font-bold text-sm mb-4 lowercase">
                  resources
                </h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a href="https://events.hackclub.com" style={{ color: "var(--muted)" }}>
                      community events
                    </a>
                  </li>
                  <li>
                    <a href="https://jams.hackclub.com" style={{ color: "var(--muted)" }}>
                      jams
                    </a>
                  </li>
                  <li>
                    <a href="https://workshops.hackclub.com" style={{ color: "var(--muted)" }}>
                      workshops
                    </a>
                  </li>
                  <li>
                    <a href="https://hackclub.com/conduct" style={{ color: "var(--muted)" }}>
                      code of conduct
                    </a>
                  </li>
                </ul>
              </div>

              <div className="flex items-start justify-start md:justify-end">
                <a
                  href="mailto:hardwire@hackclub.com"
                  className="w-16 h-16 border-2 flex items-center justify-center transition-colors"
                  style={{ borderColor: "var(--fg)" }}
                  aria-label="Email"
                >
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="2" y="4" width="20" height="16" />
                    <path d="m2 6 10 7 10-7" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* Theme toggle - fixed bottom right, follows scroll */}
      <button
        onClick={() => setTheme(isDark ? "light" : "dark")}
        aria-label="Toggle light and dark mode"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 border-2 flex items-center justify-center transition-colors"
        style={{
          backgroundColor: "var(--bg)",
          borderColor: "var(--fg)",
          color: "var(--fg)",
        }}
      >
        {isDark ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="5" />
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        )}
      </button>
    </div>
  );
}