function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-xl border border-pink-500/25 bg-[#100d19]/80 p-3">
      <p className="text-xs uppercase tracking-wide text-pink-300/70">{title}</p>
      <p className="mt-1 text-2xl font-semibold text-pink-100">{value}</p>
    </div>
  );
}

export default function StatsSidebar() {
  return (
    <aside className="h-fit p-5 bg-[#151221]/80 backdrop-blur-lg border-2 border-pink-500/30 rounded-2xl card-glow md:sticky md:top-6 md:col-start-3">
      <h2 className="text-xl font-bold text-pink-200 mb-2">Statistici</h2>
      <div className="page-line-horizontal" />
      <div className="space-y-3">
        <StatCard title="Rezolvate" value="24" />
        <StatCard title="Rată de Succes" value="68%" />
        <StatCard title="Zile consecutive" value="5" />
        <StatCard title="Dificultate preferată" value="Mediu" />
      </div>
    </aside>
  );
}