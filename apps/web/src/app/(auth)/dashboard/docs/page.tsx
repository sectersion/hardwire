const ACCENT = "#FF1500";

const tiers = [
  {
    id: "T1",
    title: "Learn the skills",
    condition: "Finish the learning course and submit a basic design (6–10 hours).",
    reward: "FPGA development board",
    detail: "A Sipeed Tang Nano-style RISC-V FPGA dev board, sent to you.",
  },
  {
    id: "T2",
    title: "ASIC manufacturing reward",
    condition:
      "Design, simulate, and successfully synthesize a unique, advanced digital architecture — written in raw SystemVerilog. Think 6502-style processors, custom microcontrollers, hardware accelerators, or retro video generators.",
    reward: "A real chip",
    detail:
      "Hack Club purchases you a dedicated slot on an upcoming Tiny Tapeout shuttle. You don't get raw silicon — you get a finished dev board with your custom chip mounted, wire-bonded, and ready to plug in over USB.",
  },
  {
    id: "T3",
    title: "Custom dev board",
    condition:
      "Tapeout a chip, then go the extra mile and design a project board to go with it.",
    reward: "Funded PCB",
    detail:
      "Funding at $5/hour up to board cost. Fill out a BOM with costs and links, same model as Hack Club's Forge/Stasis grants.",
  },
];

const resources = [
  {
    label: "HDL resources",
    description: "The basis for hardwire's guides.",
    href: "https://tinytapeout.com/hdl/resources/",
  },
  {
    label: "Zero to ASIC",
    description: "A full walkthrough of the you-ship path, start to tapeout.",
    href: "https://zerotoasiccourse.com/",
  },
];

export default function DocsPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-12">
      <h1 className="font-display text-4xl md:text-5xl font-extrabold lowercase leading-none mb-3">
        docs<span style={{ color: ACCENT }}>.</span>
      </h1>
      <p className="text-sm text-[var(--muted)] mb-12 max-w-2xl">
        Everything you need to go from logic gates to a working ASIC.
      </p>

      <section className="mb-12">
        <h2 className="font-display text-2xl font-bold lowercase mb-4">
          you ship<span style={{ color: ACCENT }}>.</span>
        </h2>
        <div className="border-2 border-[var(--fg)] p-6">
          <p className="text-sm opacity-80 leading-relaxed">
            The core of hardwire is learning to design chips — starting with
            SystemVerilog, a modern hardware design language used by real
            companies, plus the fundamentals: logic gates, flip-flops, and
            how digital circuits actually work.
          </p>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-display text-2xl font-bold lowercase mb-4">
          resources<span style={{ color: ACCENT }}>.</span>
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {resources.map((r) => (
            <a
              key={r.label}
              href={r.href}
              target="_blank"
              rel="noopener noreferrer"
              className="block border-2 border-[var(--fg)] p-5 hover:bg-[var(--fg)] hover:text-[var(--bg)] transition-colors"
            >
              <h3 className="font-display font-bold mb-1">{r.label}</h3>
              <p className="text-sm opacity-60">{r.description}</p>
            </a>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-display text-2xl font-bold lowercase mb-4">
          we ship<span style={{ color: ACCENT }}>.</span>
        </h2>
        <p className="text-sm text-[var(--muted)] mb-6 max-w-2xl">
          Reward tiers based on what you've actually accomplished, not a
          generalized shop.
        </p>
        <div className="space-y-4">
          {tiers.map((tier) => (
            <div key={tier.id} className="border-2 border-[var(--fg)] p-6">
              <div className="flex items-start gap-4 mb-3">
                <div className="w-10 h-10 border-2 border-[var(--fg)] flex items-center justify-center text-sm font-bold shrink-0">
                  {tier.id}
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg">
                    {tier.title}
                  </h3>
                  <p className="text-sm text-[var(--muted)] mt-1">
                    {tier.condition}
                  </p>
                </div>
              </div>
              <div className="border-t-2 border-[var(--fg)] pt-4 mt-4">
                <span className="text-xs uppercase tracking-widest text-[var(--muted)]">
                  Reward
                </span>
                <p className="font-bold mt-1">{tier.reward}</p>
                <p className="text-sm text-[var(--muted)] mt-1">{tier.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}