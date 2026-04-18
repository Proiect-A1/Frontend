import { useLanguage, translations } from "../language/Language";

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-xl border border-pink-500/25 bg-[#100d19]/80 p-3">
      <p className="text-xs uppercase tracking-wide text-pink-300/70">{title}</p>
      <p className="mt-1 text-2xl font-semibold text-pink-100">{value}</p>
    </div>
  );
}

export default function StatsSidebar() {
  const { lang } = useLanguage();
  const t = translations[lang];

  return (
    <aside className="h-auto overflow-visible xl:h-fit xl:max-h-[calc(100svh-8.5rem)] xl:overflow-y-auto p-5 bg-[#151221]/80 backdrop-blur-lg border-2 border-pink-500/30 rounded-2xl card-glow xl:sticky xl:top-0 xl:col-start-3 custom-scrollbar">
      <h2 className="text-xl font-bold text-pink-200 mb-2">{t.statsTitle}</h2>
      <div className="page-line-horizontal" />
      <div className="space-y-3">
        <StatCard title={t.statSolved} value="24" />
        <StatCard title={t.statRate} value="68%" />
        <StatCard title={t.statStreak} value="5" />
        <StatCard 
          title={t.statPref} 
          value={t.mediumDifficulty} 
        />
      </div>
    </aside>
  );
}