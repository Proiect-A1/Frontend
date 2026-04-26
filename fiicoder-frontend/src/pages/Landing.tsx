import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useLanguage, translations } from "../language/Language";
import { useAuth } from "../services/AuthContext";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
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
    priority: "medium",
    timestamp: "1 day ago",
  },
];

export default function Landing() {
  const { lang } = useLanguage();
  const t = translations[lang];
  const { isAuthenticated } = useAuth();

  return (
    <div className="w-full flex justify-center h-auto xl:h-full">
      <motion.div
        className="w-full max-w-7xl rounded-2xl border-2 border-pink-500/30 theme-surface-card backdrop-blur-lg px-5 py-6 md:px-8 md:py-8 card-glow h-auto overflow-visible xl:h-full xl:overflow-y-auto custom-scrollbar"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Hero Section */}
        <div className="text-center mb-10 md:mb-12">
          <motion.div variants={itemVariants} className="mb-6">
            <img
              src="/logo.svg"
              alt="FiiCoder"
              className="theme-logo h-24 w-24 md:h-32 md:w-32 mx-auto theme-logo-glow"
            />
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-5xl md:text-7xl font-black text-pink-100 mb-4 tracking-tighter"
          >
            {t.welcomeTitle} <span className="text-pink-400">{`<_FiiCoder>`}</span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-lg md:text-2xl text-pink-200/70 max-w-2xl mx-auto mb-8"
          >
            {t.welcomeDesc}
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              to="/problems"
              className="px-8 py-4 rounded-2xl bg-pink-500/20 border-2 border-pink-400/60 text-pink-100 font-bold text-lg transition-all duration-200 hover:bg-pink-500/35 hover:border-pink-400 hover:-translate-y-1 shadow-lg hover:shadow-pink-500/30"
            >
              {t.viewProblems}
            </Link>

            {!isAuthenticated && (
              <Link
                to="/login"
                className="px-8 py-4 rounded-2xl bg-transparent border-2 border-pink-400/40 text-pink-300/80 font-bold text-lg transition-all duration-200 hover:bg-pink-500/15 hover:border-pink-400/60 hover:text-pink-100 hover:-translate-y-1"
              >
                {t.authenticateBtn}
              </Link>
            )}
          </motion.div>
        </div>

        {/* Announcements Section */}
        <motion.div variants={itemVariants} className="mt-10 mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-pink-100 mb-8 text-center">
            {t.announcementsTitle}
          </h2>
          <div className="grid gap-4 lg:grid-cols-3">
            {announcements.map((ann) => (
              <motion.div
                key={ann.id}
                variants={itemVariants}
                className={`p-5 rounded-2xl border-2 backdrop-blur-sm cursor-pointer transition-all duration-300 group hover:-translate-y-1 ${
                  ann.priority === "high"
                    ? "border-red-500/40 bg-red-500/10 hover:border-red-500/70 hover:bg-red-500/15 shadow-lg shadow-red-500/20"
                    : ann.priority === "medium"
                      ? "border-pink-500/30 theme-surface-card hover:border-pink-500/60 theme-surface-hover"
                      : "border-pink-500/20 theme-surface-muted hover:border-pink-500/40 theme-surface-hover"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="text-3xl shrink-0 group-hover:scale-110 transition-transform duration-300">
                    {ann.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-pink-100 text-sm md:text-base mb-1 line-clamp-2">
                      {lang === "RO" ? ann.titleRO : ann.titleEN}
                    </h3>
                    <p className="text-xs md:text-sm text-pink-200/70 mb-3 line-clamp-3">
                      {lang === "RO" ? ann.descRO : ann.descEN}
                    </p>
                    <div className="text-[10px] md:text-xs text-pink-300/50">
                      {ann.timestamp}
                    </div>
                  </div>
                  {ann.priority === "high" && (
                    <div className="shrink-0 px-2 py-1 rounded-full bg-red-500/30 text-red-300 text-[10px] font-bold">
                      {lang === "RO" ? "URGENT" : "URGENT"}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div variants={itemVariants} className="grid md:grid-cols-3 gap-6 mt-8">
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
              className="p-6 rounded-2xl border-2 border-pink-500/30 theme-surface-card backdrop-blur-sm hover:border-pink-500/60 theme-surface-hover transition-all duration-300 group"
            >
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="text-lg font-bold text-pink-100 mb-2">{feature.title}</h3>
              <p className="text-sm text-pink-200/60">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats Section */}
        <motion.div
          variants={itemVariants}
          className="mt-10 p-8 rounded-2xl border-2 border-pink-500/25 theme-surface-page backdrop-blur-sm"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { num: "5000+", label: t.activeStudents },
              { num: "500+", label: t.problemsCount },
              { num: "150+", label: t.contestsCount },
              { num: "98%", label: t.satisfactionRate },
            ].map((stat, idx) => (
              <motion.div key={idx} variants={itemVariants}>
                <div className="text-3xl md:text-4xl font-black text-pink-300 mb-1">
                  {stat.num}
                </div>
                <div className="text-xs md:text-sm text-pink-200/60">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div variants={itemVariants} className="mt-10 text-center pb-4">
          <p className="text-pink-200/70 mb-4">
            {t.readyText}
          </p>
          <Link
            to="/problems"
            className="inline-block px-10 py-4 rounded-2xl bg-linear-to-r from-pink-500/30 to-purple-500/20 border-2 border-pink-400/70 text-pink-100 font-bold text-lg transition-all duration-200 hover:from-pink-500/50 hover:to-purple-500/40 hover:border-pink-400 hover:-translate-y-1 shadow-lg hover:shadow-pink-500/40"
          >
            {t.startBtn}
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
