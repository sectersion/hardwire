import Link from "next/link"

const tiers = [
  {
    id: "T1",
    title: "Digital Logic",
    description: "Design and simulate a digital logic circuit",
    reward: "iCE40 FPGA Board",
    gradient: "from-cyan-500 to-blue-600",
  },
  {
    id: "T2",
    title: "ASIC Tapeout",
    description: "Complete synthesis and DRC pass for ASIC fabrication",
    reward: "ASIC Shuttle Slot",
    gradient: "from-purple-500 to-pink-600",
  },
  {
    id: "T3",
    title: "Custom Carrier Board",
    description: "Design a custom PCB to carry your ASIC",
    reward: "PCB Fab & Test Components",
    gradient: "from-amber-500 to-orange-600",
  },
]

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b border-white/10">
        <nav className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <span className="text-xl font-bold tracking-tight">hardwire</span>
          <a
            href="/api/auth/login"
            className="bg-white text-black px-5 py-2 rounded-full text-sm font-medium hover:bg-white/90 transition-colors"
          >
            Sign in with Hack Club
          </a>
        </nav>
      </header>

      <main className="flex-1">
        <section className="max-w-6xl mx-auto px-4 pt-24 pb-16 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-muted mb-6">
            Ages 13–18
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-4">
            From logic to
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent"> silicon</span>
          </h1>
          <p className="text-lg text-muted max-w-2xl mx-auto mb-8">
            A high-intensity YSWS designed to bridge the gap between abstract code and physical hardware.
            Ship a validated design, and we&apos;ll fabricate and ship your custom hardware.
          </p>
          <div className="flex items-center justify-center gap-4">
            <a
              href="/api/auth/login"
              className="bg-white text-black px-8 py-3 rounded-full font-medium hover:bg-white/90 transition-colors"
            >
              Get started
            </a>
            <Link
              href="/resources"
              className="border border-white/20 px-8 py-3 rounded-full font-medium hover:bg-white/5 transition-colors"
            >
              Learn more
            </Link>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 py-16">
          <h2 className="text-3xl font-bold text-center mb-12">Engineering Progression</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {tiers.map((tier) => (
              <div
                key={tier.id}
                className="rounded-2xl border border-white/10 p-6 hover:border-white/20 transition-colors"
              >
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${tier.gradient} mb-4 flex items-center justify-center text-sm font-bold`}>
                  {tier.id}
                </div>
                <h3 className="text-xl font-semibold mb-2">{tier.title}</h3>
                <p className="text-muted text-sm mb-4">{tier.description}</p>
                <div className="border-t border-white/10 pt-4 mt-4">
                  <span className="text-xs text-muted">Reward</span>
                  <p className="text-sm font-medium">{tier.reward}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-3xl mx-auto px-4 py-16 text-center">
          <h2 className="text-3xl font-bold mb-6">Powered by Hack Club</h2>
          <p className="text-muted mb-8">
            Hardwire is a 501(c)(3) nonprofit program dedicated to making high-end hardware engineering
            accessible to every teen worldwide.
          </p>
          <a
            href="/api/auth/login"
            className="inline-block bg-white/5 border border-white/20 px-8 py-3 rounded-full font-medium hover:bg-white/10 transition-colors"
          >
            Join the program
          </a>
        </section>
      </main>

      <footer className="border-t border-white/10 py-8 text-center text-sm text-muted">
        <p>Hardwire is powered by Hack Club, a 501(c)(3) nonprofit.</p>
      </footer>
    </div>
  )
}
