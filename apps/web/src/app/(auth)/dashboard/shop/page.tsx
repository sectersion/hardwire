const ACCENT = "#FF1500";

export default function ShopPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-12">
      <h1 className="font-display text-4xl md:text-5xl font-extrabold lowercase leading-none mb-3">
        shop<span style={{ color: ACCENT }}>.</span>
      </h1>
      <p className="text-sm text-[var(--muted)] mb-10 max-w-xl">
        Redeem tier rewards — FPGA boards, ASIC shuttle slots, and PCB
        fab credit.
      </p>

      <div className="border-2 border-[var(--fg)] p-12 text-center">
        <h2 className="font-display text-xl font-bold mb-2 lowercase">
          nothing here yet<span style={{ color: ACCENT }}>.</span>
        </h2>
        <p className="text-[var(--muted)] text-sm">
          Complete a tier to unlock rewards here.
        </p>
      </div>
    </div>
  );
}