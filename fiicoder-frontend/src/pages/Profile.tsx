import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuth } from "../services/AuthContext";
import { useLanguage } from "../language/Language";

const pageVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

// MOCK DATA - Conform cu lista de API-uri
const mockProfileData = {
  id: "u-1a2b3c",
  firstName: "Turing",
  lastName: "Alan",
  email: "alan.turing@fiicoder.ro",
  createdAt: "12 Octombrie 2023",
  stats: {
    solved: 142,
    submissions: 385,
    acceptanceRate: "36.8%",
    streak: 14,
    rank: "Grandmaster"
  },
  difficulty: {
    easy: 85,
    medium: 42,
    hard: 10,
    contest: 5
  },
  recentActivity: [
    { id: 1, problem: "Suma a două numere", status: "Accepted", lang: "C++", time: "Acum 2 ore" },
    { id: 2, problem: "Algoritmul lui Dijkstra", status: "Wrong Answer", lang: "C++", time: "Acum 5 ore" },
    { id: 3, problem: "Problema Rucsacului", status: "Accepted", lang: "Python", time: "Acum 1 zi" },
    { id: 4, problem: "Z Parcurgere", status: "Time Limit Exceeded", lang: "Java", time: "Acum 2 zile" }
  ],
  languages: [
    { name: "C++", percentage: 75 },
    { name: "Python", percentage: 15 },
    { name: "Java", percentage: 10 }
  ],
  skills: ["Programare Dinamică", "Grafuri", "Matematică", "Arbori", "Șiruri de caractere"],
  badges: ["🏆 Primul Concurs", "🔥 10 Zile Streak", "💡 Pasionat de DP", "⚡ Fast Solver"]
};

// Generare heatmap mock (12 săptămâni x 7 zile)
const mockHeatmap = Array.from({ length: 84 }).map(() => Math.floor(Math.random() * 5));

export default function Profile() {
  const { username, isAdmin } = useAuth(); // Am extras isAdmin din hook
  const { lang } = useLanguage();

  return (
    <div className="p-6 md:p-8 w-full max-w-5xl mx-auto theme-surface-card backdrop-blur-lg border-2 border-pink-500/30 rounded-2xl card-glow mb-8">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={pageVariants}
      >
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-linear-to-br from-pink-400 to-purple-500 flex items-center justify-center text-4xl font-bold text-white uppercase shadow-lg outline-4 outline-offset-4 outline-(--accent)">
          {username?.charAt(0) || "?"}
        </div>
                 
        <h1 className="text-3xl font-bold text-pink-100 mb-2 text-center">
          {username}
        </h1>
                 
        <p className="text-pink-300/60 mb-6 text-center">
          {lang === "RO" ? "Pagina de profil folosește date mock momentan." : "Profile page is currently using mock data."}
        </p>

        {/* admin button visible only for admins */}
        {isAdmin && (
          <div className="flex justify-center mb-8">
            <Link
               to="/admin"
               className="px-6 py-2.5 rounded-full border-2 border-pink-400/60 text-sm font-bold text-pink-100 transition hover:bg-pink-500/15 hover:-translate-y-0.5"
            >
              {lang === "RO" ? "Panou Administrare" : "Admin Dashboard"}
            </Link>
          </div>
        )}

        <div className="page-line-horizontal mb-8" />
                 
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left mb-8">
          <div className="p-4 rounded-xl border border-pink-500/20 bg-pink-500/5">
            <p className="text-xs text-pink-400 uppercase font-bold tracking-wider">Status</p>
            <p className="text-pink-100">Online</p>
          </div>
          <div className="p-4 rounded-xl border border-pink-500/20 bg-pink-500/5">
            <p className="text-xs text-pink-400 uppercase font-bold tracking-wider">Role</p>
            <p className="text-pink-100 font-semibold">{isAdmin ? "Administrator" : "User"}</p>
          </div>
        </div>

        {/* ========================================= */}
        {/* ZONA NOUĂ (MOCK DATA DASHBOARD)          */}
        {/* ========================================= */}

        {/* 1. Date User */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="p-4 rounded-xl border border-pink-500/20 bg-black/20">
            <p className="text-xs text-pink-400 uppercase font-bold tracking-wider mb-1">{lang === "RO" ? "Nume Complet" : "Full Name"}</p>
            <p className="text-pink-100 font-medium">{mockProfileData.firstName} {mockProfileData.lastName}</p>
          </div>
          <div className="p-4 rounded-xl border border-pink-500/20 bg-black/20">
            <p className="text-xs text-pink-400 uppercase font-bold tracking-wider mb-1">Email</p>
            <p className="text-pink-100 font-medium">{mockProfileData.email}</p>
          </div>
          <div className="p-4 rounded-xl border border-pink-500/20 bg-black/20">
            <p className="text-xs text-pink-400 uppercase font-bold tracking-wider mb-1">{lang === "RO" ? "Membru din" : "Joined"}</p>
            <p className="text-pink-100 font-medium">{mockProfileData.createdAt}</p>
          </div>
        </div>

        {/* 2. Statistici Generale */}
        <h2 className="text-xl font-bold text-pink-200 mb-4">{lang === "RO" ? "Statistici Generale" : "General Stats"}</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
          <div className="p-4 flex flex-col items-center justify-center rounded-xl border border-pink-500/20 bg-pink-500/5 hover:bg-pink-500/10 transition-colors">
            <span className="text-2xl font-black text-pink-300">{mockProfileData.stats.solved}</span>
            <span className="text-[10px] uppercase tracking-widest text-pink-200/60 font-bold text-center mt-1">{lang === "RO" ? "Rezolvate" : "Solved"}</span>
          </div>
          <div className="p-4 flex flex-col items-center justify-center rounded-xl border border-pink-500/20 bg-pink-500/5 hover:bg-pink-500/10 transition-colors">
            <span className="text-2xl font-black text-pink-300">{mockProfileData.stats.submissions}</span>
            <span className="text-[10px] uppercase tracking-widest text-pink-200/60 font-bold text-center mt-1">{lang === "RO" ? "Submisii" : "Submissions"}</span>
          </div>
          <div className="p-4 flex flex-col items-center justify-center rounded-xl border border-pink-500/20 bg-pink-500/5 hover:bg-pink-500/10 transition-colors">
            <span className="text-2xl font-black text-pink-300">{mockProfileData.stats.acceptanceRate}</span>
            <span className="text-[10px] uppercase tracking-widest text-pink-200/60 font-bold text-center mt-1">{lang === "RO" ? "Acceptare" : "Acceptance"}</span>
          </div>
          <div className="p-4 flex flex-col items-center justify-center rounded-xl border border-pink-500/20 bg-pink-500/5 hover:bg-pink-500/10 transition-colors">
            <span className="text-2xl font-black text-orange-400">{mockProfileData.stats.streak} 🔥</span>
            <span className="text-[10px] uppercase tracking-widest text-pink-200/60 font-bold text-center mt-1">Streak</span>
          </div>
          <div className="p-4 flex flex-col items-center justify-center rounded-xl border border-pink-500/20 bg-pink-500/5 hover:bg-pink-500/10 transition-colors">
            <span className="text-xl font-black text-purple-300 text-center">{mockProfileData.stats.rank}</span>
            <span className="text-[10px] uppercase tracking-widest text-pink-200/60 font-bold text-center mt-1">Rank</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* 3. Breakdown pe dificultati */}
          <div>
            <h2 className="text-xl font-bold text-pink-200 mb-4">{lang === "RO" ? "Dificultăți" : "Difficulty Breakdown"}</h2>
            <div className="flex flex-col gap-3 p-5 rounded-xl border border-pink-500/20 bg-black/10">
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-emerald-400">Easy</span>
                <span className="text-sm font-bold text-pink-100">{mockProfileData.difficulty.easy}</span>
              </div>
              <div className="w-full bg-pink-500/10 rounded-full h-2 mb-2">
                <div className="bg-emerald-400 h-2 rounded-full" style={{ width: '75%' }}></div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-amber-400">Medium</span>
                <span className="text-sm font-bold text-pink-100">{mockProfileData.difficulty.medium}</span>
              </div>
              <div className="w-full bg-pink-500/10 rounded-full h-2 mb-2">
                <div className="bg-amber-400 h-2 rounded-full" style={{ width: '40%' }}></div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-red-400">Hard</span>
                <span className="text-sm font-bold text-pink-100">{mockProfileData.difficulty.hard}</span>
              </div>
              <div className="w-full bg-pink-500/10 rounded-full h-2 mb-2">
                <div className="bg-red-400 h-2 rounded-full" style={{ width: '15%' }}></div>
              </div>
              
              <div className="flex items-center justify-between mt-2 pt-3 border-t border-pink-500/20">
                <span className="text-sm font-semibold text-purple-400">Contest</span>
                <span className="text-sm font-bold text-pink-100">{mockProfileData.difficulty.contest}</span>
              </div>
            </div>
          </div>

          {/* 4. Limbaje & Skill-uri */}
          <div>
            <h2 className="text-xl font-bold text-pink-200 mb-4">{lang === "RO" ? "Limbaje & Skills" : "Languages & Skills"}</h2>
            <div className="flex flex-col gap-4 p-5 rounded-xl border border-pink-500/20 bg-black/10 h-[calc(100%-2.5rem)]">
              <div>
                {mockProfileData.languages.map(langItem => (
                  <div key={langItem.name} className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-pink-100 font-semibold">{langItem.name}</span>
                      <span className="text-pink-300/60 font-bold">{langItem.percentage}%</span>
                    </div>
                    <div className="w-full bg-pink-500/10 rounded-full h-1.5">
                      <div className="bg-pink-400 h-1.5 rounded-full" style={{ width: `${langItem.percentage}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-auto pt-2">
                <div className="flex flex-wrap gap-2">
                  {mockProfileData.skills.map(skill => (
                    <span key={skill} className="px-2.5 py-1 rounded-md text-[10px] font-bold border border-pink-500/30 bg-pink-500/10 text-pink-200">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 5. Heatmap / Activitate pe zile */}
        <h2 className="text-xl font-bold text-pink-200 mb-4">{lang === "RO" ? "Activitate (Heatmap)" : "Activity Heatmap"}</h2>
        <div className="p-5 rounded-xl border border-pink-500/20 bg-black/10 mb-8 overflow-x-auto custom-scrollbar">
          <div className="flex gap-1.5 min-w-max">
            {mockHeatmap.map((level, i) => {
              // Culori heatmap derivate din nuante de pink
              const colors = [
                'bg-pink-500/5 border border-pink-500/10', 
                'bg-pink-500/30 border border-pink-500/20', 
                'bg-pink-500/60', 
                'bg-pink-400', 
                'bg-pink-300 shadow-[0_0_8px_rgba(244,114,182,0.6)]'
              ];
              return (
                <div 
                  key={i} 
                  className={`w-4 h-4 rounded-[3px] transition-transform hover:scale-125 cursor-pointer ${colors[level]}`} 
                  title={`${level * 2} submissions`}
                />
              );
            })}
          </div>
          <div className="mt-3 flex items-center justify-end gap-2 text-xs text-pink-300/50 font-semibold">
            <span>Less</span>
            <div className="w-3 h-3 rounded-[2px] bg-pink-500/5 border border-pink-500/10" />
            <div className="w-3 h-3 rounded-[2px] bg-pink-500/30 border border-pink-500/20" />
            <div className="w-3 h-3 rounded-[2px] bg-pink-500/60" />
            <div className="w-3 h-3 rounded-[2px] bg-pink-400" />
            <div className="w-3 h-3 rounded-[2px] bg-pink-300" />
            <span>More</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 6. Activitate Recentă */}
          <div>
            <h2 className="text-xl font-bold text-pink-200 mb-4">{lang === "RO" ? "Submisii Recente" : "Recent Submissions"}</h2>
            <div className="flex flex-col gap-3">
              {mockProfileData.recentActivity.map(activity => (
                <div key={activity.id} className="p-4 rounded-xl border border-pink-500/20 bg-pink-500/5 flex justify-between items-center transition-colors hover:bg-pink-500/10">
                  <div>
                    <Link to={`/problems`} className="text-sm font-bold text-pink-100 hover:text-pink-300 hover:underline underline-offset-2 transition-colors">
                      {activity.problem}
                    </Link>
                    <p className="text-[11px] text-pink-300/60 mt-1 font-semibold tracking-wider uppercase">
                      {activity.time} • {activity.lang}
                    </p>
                  </div>
                  <div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      activity.status === "Accepted" 
                        ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30" 
                        : activity.status === "Wrong Answer"
                        ? "bg-red-500/10 text-red-300 border border-red-500/30"
                        : "bg-amber-500/10 text-amber-300 border border-amber-500/30"
                    }`}>
                      {activity.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 7. Badge-uri / Achievements */}
          <div>
            <h2 className="text-xl font-bold text-pink-200 mb-4">{lang === "RO" ? "Realizări & Insigne" : "Achievements & Badges"}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {mockProfileData.badges.map(badge => (
                <div key={badge} className="p-4 flex items-center justify-center gap-3 rounded-xl border border-pink-400/30 bg-gradient-to-br from-pink-500/10 to-purple-500/10 shadow-lg hover:shadow-pink-500/20 transition-all hover:-translate-y-1">
                  <span className="text-sm font-bold text-pink-100">{badge}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </motion.div>
    </div>
  );
}