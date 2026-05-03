import { useLanguage, translations } from "../language/Language";
import { motion } from "framer-motion";
import { itemVariants, staggerConfig } from "../utils/motionConfig";

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <motion.div variants={itemVariants} className="rounded-xl border border-(--accent)/25 theme-surface-muted p-3">
      <p className="text-xs uppercase tracking-wide text-(--text-muted)">{title}</p>
      <p className="mt-1 text-2xl font-semibold text-(--text-h)">{value}</p>
    </motion.div>
  );
}

export default function StatsSidebar() {
  const { lang } = useLanguage();
  const t = translations[lang];

  return (
    <motion.aside 
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: staggerConfig } }}
      className="h-auto overflow-visible xl:h-fit xl:max-h-[calc(100svh-8.5rem)] xl:overflow-y-auto p-5 theme-surface-card backdrop-blur-sm border-2 border-(--accent) rounded-2xl xl:sticky xl:top-0 xl:col-start-3 custom-scrollbar">
      <motion.h2 variants={itemVariants} className="text-xl font-bold text-(--text-h) mb-2">{t.statsTitle}</motion.h2>
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
    </motion.aside>
  );
}