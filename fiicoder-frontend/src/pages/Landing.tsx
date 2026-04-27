import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useLanguage, translations } from "../language/Language";
import { useAuth } from "../services/AuthContext";

import { itemVariants, staggerConfig } from "../utils/motionConfig";
import { useTheme } from "../services/ThemeContext";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: staggerConfig,
  },
};

interface Announcement {
  id: number;
  icon: string;
  titleRO: string;
  titleEN: string;
  descRO: string;
  descEN: string;
  priority: "high" | "medium" | "low";
  timestamp: string;
}

const announcements: Announcement[] = [
  {
    id: 1,
    icon: "🚀",
    titleRO: "Concurs Nou Disponibil!",
    titleEN: "New Contest Available!",
    descRO: "Ediția de Primăvară 2026 este acum live. Câștigă premii și recunoaștere!",
    descEN: "Spring Edition 2026 is now live. Win prizes and recognition!",
    priority: "high",
    timestamp: "2 hours ago",
  },
  {
    id: 2,
    icon: "📈",
    titleRO: "Noi Probleme Adăugate",
    titleEN: "New Problems Added",
    descRO: "50 probleme noi în categoriile Grafuri și Dinamică. Încearcă-le acum!",
    descEN: "50 new problems in Graphs and Dynamic Programming. Try them now!",
    priority: "medium",
    timestamp: "5 hours ago",
  },
  {
    id: 3,
    icon: "🎓",
    titleRO: "Tutoriale Gratuite",
    titleEN: "Free Tutorials",
    descRO: "Noi cursuri video pe platforma noastră. Învață de la experți!",
    descEN: "New video courses on our platform. Learn from experts!",
    priority: "low",
    timestamp: "1 day ago",
  },
];

export default function Landing() {
  const { lang } = useLanguage();
  const t = translations[lang];
  const { isAuthenticated } = useAuth();

  const { theme } = useTheme();
  const logoSrc = theme === "rose" ? "/logo.svg" : "/logo_nord.svg";

  return (
    <div className="w-full flex justify-center h-auto xl:h-full">
      <motion.div
        className="w-full max-w-7xl rounded-2xl border-2 border-pink-500/30 theme-surface-card backdrop-blur-lg px-5 py-6 md:px-8 md:py-8 card-glow h-auto overflow-visible xl:h-full xl:overflow-y-auto custom-scrollbar"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Hero Section */}
        <div className="text-center mb-8 md:mb-10">
          <motion.div variants={itemVariants} className="mb-4">
            <img
              src={logoSrc}
              alt="FiiCoder"
              className="theme-logo h-20 w-20 md:h-28 md:w-28 mx-auto theme-logo-glow"
            />
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-4xl md:text-5xl font-black text-pink-100 mb-3 tracking-tight"
          >
            {t.welcomeTitle} <span className="text-pink-400">{`<_FiiCoder>`}</span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-base md:text-lg text-pink-200/70 max-w-2xl mx-auto mb-6"
          >
            {t.welcomeDesc}
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              to="/problems"
              className="px-6 py-2.5 rounded-full bg-pink-500/20 border-2 border-pink-400/60 text-pink-100 font-bold text-sm transition-all duration-200 hover:bg-pink-500/35 hover:border-pink-400 hover:-translate-y-1"
            >
              {t.viewProblems}
            </Link>

            {!isAuthenticated && (
              <Link
                to="/login"
                className="px-6 py-2.5 rounded-full bg-pink-500/20 border-2 border-pink-400/60 text-pink-100 font-bold text-sm transition-all duration-200 hover:bg-pink-500/35 hover:border-pink-400 hover:-translate-y-1 shadow-lg hover:shadow-pink-500/30"
              >
                {t.authenticateBtn}
              </Link>
            )}
          </motion.div>
        </div>

        {/* Announcements Section */}
        <motion.div variants={itemVariants} className="mt-8 mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-pink-100 mb-6 text-center">
            {t.announcementsTitle}
          </h2>
          <div className="grid gap-4 lg:grid-cols-3">
            {announcements.map((ann) => (
              <motion.div
                key={ann.id}
                variants={itemVariants}
                className={`p-4 rounded-xl border backdrop-blur-sm cursor-pointer transition-all duration-300 group hover:-translate-y-1 ${
                  ann.priority === "high"
                    ? "border-red-500/40 bg-red-500/10 hover:border-red-500/70 hover:bg-red-500/15 shadow-lg shadow-red-500/20"
                    : ann.priority === "medium"
                    ? "border-pink-500/30 theme-surface-muted hover:border-pink-500/60 theme-surface-hover"
                    : "border-pink-500/20 theme-surface-muted hover:border-pink-500/40 theme-surface-hover"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="text-2xl shrink-0 group-hover:scale-110 transition-transform duration-300">
                    {ann.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-pink-100 text-sm mb-1 line-clamp-2">
                      {lang === "RO" ? ann.titleRO : ann.titleEN}
                    </h3>
                    <p className="text-xs text-pink-200/70 mb-2 line-clamp-3">
                      {lang === "RO" ? ann.descRO : ann.descEN}
                    </p>
                    <div className="text-[10px] text-pink-300/50">
                      {ann.timestamp}
                    </div>
                  </div>
                  {ann.priority === "high" && (
                    <div className="shrink-0 px-2 py-0.5 rounded-full bg-red-500/30 text-red-300 text-[10px] font-bold">
                      {lang === "RO" ? "URGENT" : "URGENT"}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div variants={itemVariants} className="grid md:grid-cols-3 gap-4 mt-6">
          {[
            {
              icon: "📚",
              title: t.newProblems,
              desc: t.newProblemsDesc,
            },
            {
              icon: "🏆",
              title: t.dailyContests,
              desc: t.dailyContestsDesc,
            },
            {
              icon: "💻",
              title: t.advancedEditor,
              desc: t.advancedEditorDesc,
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="p-5 rounded-xl border border-pink-500/30 theme-surface-card backdrop-blur-sm hover:border-pink-500/60 theme-surface-hover transition-all duration-300 group"
            >
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="text-base font-bold text-pink-100 mb-1">{feature.title}</h3>
              <p className="text-xs text-pink-200/60">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats Section */}
        <motion.div
          variants={itemVariants}
          className="mt-8 p-6 rounded-xl border border-pink-500/25 theme-surface-muted backdrop-blur-sm"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {[
              { num: "5000+", label: t.activeStudents },
              { num: "500+", label: t.problemsCount },
              { num: "150+", label: t.contestsCount },
              { num: "98%", label: t.satisfactionRate },
            ].map((stat, idx) => (
              <motion.div key={idx} variants={itemVariants}>
                <div className="text-2xl md:text-3xl font-black text-pink-300 mb-1">
                  {stat.num}
                </div>
                <div className="text-xs text-pink-200/60">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}