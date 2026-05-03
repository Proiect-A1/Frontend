import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuth } from "../services/AuthContext";
import { useLanguage } from "../language/Language";
import { useTheme } from "../services/ThemeContext";

const pageVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

// MOCK DATA 
const mockProfileData = {
  id: "u42432424u",
  username: "LauraZuzu",
  firstName: "Laura-Ioana",
  lastName: "Zuzu",
  email: "laura.zuzu.lz@gmail.com",
  avatarUrl: null, // no pfp
  createdAt: "2023-11-15T10:30:00",
  problemsSolved: 215,
  submissions: 420,
  acceptanceRate: 71.2,
  streak: 24,
  rankEasy: 85.5,
  rankMedium: 60.2,
  rankHard: 15.0,
  rankContest: 5.0,
  recentSubmissions: {
    "Suma Gauss": 100.0,
    "Algoritmul lui Dijkstra": 100.0,
    "Rucsac": 100.0,
    "Subșir Crescător Maximal": 45.5,
    "Parcurgere DFS": 0.0
  },
  mostUsedLanguages: ["C++", "Python", "Java"],
  skillBreakdownTags: ["Programare Dinamică", "Grafuri", "Backtracking", "Structuri de Date"],
  badges: ["🏆 Number 1 champion", "🔥 20 day streak", "💻 C++ Master", "⚡ Fast Solver"]
};

// heatmap mock data (0-4) pentru ultimele 12 sapt
const mockHeatmap = Array.from({ length: 84 }).map(() => Math.floor(Math.random() * 5));

// adaptive to our themes heatmap colors
const getHeatmapStyle = (level: number) => {
  const baseAccent = "var(--accent)";
  switch (level) {
    case 0: return { backgroundColor: `color-mix(in srgb, ${baseAccent} 8%, transparent)` };
    case 1: return { backgroundColor: `color-mix(in srgb, ${baseAccent} 30%, transparent)` };
    case 2: return { backgroundColor: `color-mix(in srgb, ${baseAccent} 60%, transparent)` };
    case 3: return { backgroundColor: baseAccent };
    case 4: return { 
      backgroundColor: `color-mix(in srgb, ${baseAccent} 85%, white 15%)`,
      boxShadow: `0 0 10px color-mix(in srgb, ${baseAccent} 70%, transparent)` 
    };
    default: return { backgroundColor: `color-mix(in srgb, ${baseAccent} 8%, transparent)` };
  }
};

export default function Profile() {
  const { username, isAdmin } = useAuth();
  const { lang } = useLanguage();
  const { theme } = useTheme();

  const isLightTheme = theme === 'cream' || theme === 'sage';

  const formatJoinDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(lang === 'RO' ? 'ro-RO' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="w-full flex justify-center h-auto xl:flex-1 xl:min-h-0">
      <motion.div
        className="w-full max-w-7xl h-auto xl:h-full relative flex flex-col"
        initial="hidden"
        animate="visible"
        variants={pageVariants}
      >
        {/* Main container card - same style as ProblemList */}
        <div className="h-auto xl:h-[calc(100svh-8.5rem)] overflow-visible xl:overflow-y-auto p-5 theme-surface-card backdrop-blur-sm border-2 border-(--accent) rounded-2xl  custom-scrollbar">

          {/* admin button visible only for admins */}
          {isAdmin && (
            <div className="mb-4 flex justify-end">
              <Link
                 to="/admin"
                 className="px-6 py-2 rounded-full border border-(--accent)/60 text-xs font-bold text-(--text-h) transition hover:bg-(--accent)/15 hover:-translate-y-0.5 bg-(--accent)/10"
              >
                {lang === "RO" ? "Panou Administrare" : "Admin Dashboard"}
              </Link>
            </div>
          )}

          <div className="w-full grid grid-cols-1 lg:grid-cols-[300px_minmax(0,1fr)] gap-6">

          {/* SIDEBAR */}
          <div className="flex flex-col gap-6 min-w-0">
            
            {/* user info card */}
            <div className="p-6 rounded-2xl border border-(--accent)/50 theme-surface-card backdrop-blur-sm card-glow flex flex-col items-center lg:items-start text-center lg:text-left">
              <div className="w-24 h-24 mb-4 rounded-full bg-linear-to-br from-(--accent) to-purple-500 flex items-center justify-center text-4xl font-bold text-white uppercase shadow-lg outline-4 outline-offset-4 outline-(--accent) overflow-hidden shrink-0">
                {mockProfileData.avatarUrl ? (
                  <img src={mockProfileData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  (username?.charAt(0) || mockProfileData.firstName.charAt(0) || "L")
                )}
              </div>
              <h1 className="text-2xl font-bold text-(--text-h)">{mockProfileData.firstName} {mockProfileData.lastName}</h1>
              <p className="text-(--text-subtle) font-mono text-sm mb-4">@{mockProfileData.username}</p>

              <div className="w-full border-t border-(--accent)/20 my-2"></div>

              <div className="w-full flex flex-col gap-2 mt-2 text-sm text-(--text)">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-(--text-muted)">Email</span>
                  <span className="truncate ml-2">{mockProfileData.email}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-(--text-muted)">{lang === "RO" ? "Membru din" : "Joined"}</span>
                  <span>{formatJoinDate(mockProfileData.createdAt)}</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="font-semibold text-(--text-muted)">Role</span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border border-(--accent)/30 bg-(--accent)/10 text-(--text)">
                    {isAdmin ? "Admin" : "User"}
                  </span>
                </div>
              </div>
            </div>

            {/* stats */}
            <div className="p-6 rounded-2xl border border-(--accent)/50 theme-surface-card backdrop-blur-sm card-glow">
              <h2 className="text-sm font-bold text-(--text-h) mb-4 uppercase tracking-wider">{lang === "RO" ? "Statistici" : "Community Stats"}</h2>
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-(--text-muted)">{lang === "RO" ? "Total Submisii" : "Total Submissions"}</span>
                  <span className="font-bold text-(--text-h)">{mockProfileData.submissions}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-(--text-muted)">{lang === "RO" ? "Rată de Acceptare" : "Acceptance Rate"}</span>
                  <span className="font-bold text-(--text-h)">{mockProfileData.acceptanceRate}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-(--text-muted)">{lang === "RO" ? "Zile Consecutive" : "Daily Streak"}</span>
                  <span className="font-bold text-orange-400">{mockProfileData.streak} 🔥</span>
                </div>
              </div>
            </div>

            {/* Languages & Skills Card */}
            <div className="p-6 rounded-2xl border border-(--accent)/50 theme-surface-card backdrop-blur-sm card-glow">
              <div className="mb-6">
                <h2 className="text-sm font-bold text-(--text-h) mb-3 uppercase tracking-wider">{lang === "RO" ? "Limbaje" : "Languages"}</h2>
                <div className="flex flex-wrap gap-2">
                  {mockProfileData.mostUsedLanguages.map(langItem => (
                    <span key={langItem} className="px-3 py-1 rounded-full text-xs font-semibold border border-(--accent)/20 bg-(--accent)/5 text-(--text-h)">
                      {langItem}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-sm font-bold text-(--text-h) mb-3 uppercase tracking-wider">Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {mockProfileData.skillBreakdownTags.map(skill => (
                    <span key={skill} className="px-2.5 py-1 rounded-md text-[10px] font-bold border border-(--accent)/30 bg-(--accent)/10 text-(--text) hover:bg-(--accent)/20 transition-colors cursor-pointer">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* MAIN CONTENT */}
          <div className="flex flex-col gap-6 min-w-0 w-full">
            
            {/* number of solved problems of different difficulty levels */}
            <div className="p-6 md:p-8 rounded-2xl border border-(--accent)/50 theme-surface-card backdrop-blur-sm card-glow grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-8 items-center min-w-0">
              <div className="flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-(--accent)/20 pb-6 md:pb-0 md:pr-6">
                <span className="text-[10px] uppercase tracking-widest text-(--text-muted) font-bold mb-2">{lang === "RO" ? "Probleme Rezolvate" : "Problems Solved"}</span>
                <span className="text-6xl font-black accent-text drop-shadow-md">{mockProfileData.problemsSolved}</span>
              </div>

              <div className="flex flex-col gap-4">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className={`font-semibold ${isLightTheme ? 'text-emerald-700' : 'text-emerald-400'}`}>{lang === "RO" ? "Ușoare" : "Easy"}</span>
                    <span className={`font-bold ${isLightTheme ? 'text-emerald-600' : 'text-emerald-300'}`}>{mockProfileData.rankEasy}%</span>
                  </div>
                  <div className="w-full bg-emerald-500/10 rounded-full h-2">
                    <div className="bg-emerald-400 h-2 rounded-full" style={{ width: `${mockProfileData.rankEasy}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className={`font-semibold ${isLightTheme ? 'text-amber-700' : 'text-amber-400'}`}>{lang === "RO" ? "Mediu" : "Medium"}</span>
                    <span className={`font-bold ${isLightTheme ? 'text-amber-600' : 'text-amber-300'}`}>{mockProfileData.rankMedium}%</span>
                  </div>
                  <div className="w-full bg-amber-500/10 rounded-full h-2">
                    <div className="bg-amber-400 h-2 rounded-full" style={{ width: `${mockProfileData.rankMedium}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className={`font-semibold ${isLightTheme ? 'text-red-700' : 'text-red-400'}`}>{lang === "RO" ? "Grele" : "Hard"}</span>
                    <span className={`font-bold ${isLightTheme ? 'text-red-600' : 'text-red-300'}`}>{mockProfileData.rankHard}%</span>
                  </div>
                  <div className="w-full bg-red-500/10 rounded-full h-2">
                    <div className="bg-red-400 h-2 rounded-full" style={{ width: `${mockProfileData.rankHard}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className={`font-semibold ${isLightTheme ? 'text-purple-700' : 'text-purple-400'}`}>{lang === "RO" ? "Concurs" : "Contest"}</span>
                    <span className={`font-bold ${isLightTheme ? 'text-purple-600' : 'text-purple-300'}`}>{mockProfileData.rankContest}%</span>
                  </div>
                  <div className="w-full bg-purple-500/10 rounded-full h-2">
                    <div className="bg-purple-400 h-2 rounded-full" style={{ width: `${mockProfileData.rankContest}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* badges */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 min-w-0">
              {mockProfileData.badges.map(badge => (
                <div key={badge} className="p-3 flex items-center justify-center gap-2 rounded-2xl border border-(--accent)/50 theme-surface-card backdrop-blur-sm hover:-translate-y-1 transition-transform cursor-pointer">
                  <span className="text-xs font-bold text-(--text-h) text-center">{badge}</span>
                </div>
              ))}
            </div>

            {/* heatmap */}
            <div className="p-6 rounded-2xl border border-(--accent)/50 theme-surface-card backdrop-blur-sm card-glow min-w-0">
              <h2 className="text-sm font-bold text-(--text-h) mb-4 uppercase tracking-wider">{lang === "RO" ? "Activitate pe zile" : "Activity by Day"}</h2>
              <div className="w-full overflow-x-auto custom-scrollbar pb-2">
                <div className="flex flex-col gap-1.5 min-w-max">

                  <div className="flex gap-1.5">
                    {mockHeatmap.map((level, i) => (
                      <div
                        key={i}
                        className="w-4 h-4 rounded-[3px] transition-transform hover:scale-125 cursor-pointer border border-(--accent)/5 shrink-0"
                        style={getHeatmapStyle(level)}
                        title={`${level * 2} submissions`}
                      />
                    ))}
                  </div>

                  <div className="flex gap-1.5">
                    {mockHeatmap.map((_, i) => {
                      let dayLabel = "";
                      if (i % 14 === 0) dayLabel = "1";
                      else if (i % 14 === 7) dayLabel = "14";

                      return (
                        <div key={`label-${i}`} className="w-4 text-[9px] font-semibold text-(--text-subtle) text-center shrink-0 flex items-start justify-center">
                          {dayLabel}
                        </div>
                      );
                    })}
                  </div>

                </div>
              </div>

              <div className="mt-2 flex items-center justify-end gap-2 text-xs text-(--text-subtle) font-semibold">
                <span>Less</span>
                <div className="w-3 h-3 rounded-xs" style={getHeatmapStyle(0)} />
                <div className="w-3 h-3 rounded-xs" style={getHeatmapStyle(1)} />
                <div className="w-3 h-3 rounded-xs" style={getHeatmapStyle(2)} />
                <div className="w-3 h-3 rounded-xs" style={getHeatmapStyle(3)} />
                <div className="w-3 h-3 rounded-xs" style={getHeatmapStyle(4)} />
                <span>More</span>
              </div>
            </div>

            {/* recent submissions */}
            <div className="p-6 rounded-2xl border border-(--accent)/50 theme-surface-card backdrop-blur-sm card-glow mb-8 min-w-0">
              <h2 className="text-sm font-bold text-(--text-h) mb-4 uppercase tracking-wider">{lang === "RO" ? "Submisii Recente" : "Recent Submissions"}</h2>
              <div className="flex flex-col gap-2">
                {Object.entries(mockProfileData.recentSubmissions).map(([problemName, score], index) => {
                  const isAccepted = score === 100.0;

                  const badgeClasses = isAccepted
                    ? (isLightTheme ? "bg-emerald-500/20 text-emerald-700 border-emerald-500/40" : "bg-emerald-500/10 text-emerald-300 border-emerald-500/30")
                    : (isLightTheme ? "bg-red-500/20 text-red-700 border-red-500/40" : "bg-red-500/10 text-red-300 border-red-500/30");

                  return (
                    <div key={index} className="p-3 md:p-4 rounded-xl border border-(--accent)/20 bg-(--accent)/5 flex justify-between items-center transition-colors hover:bg-(--accent)/10">
                      <div className="min-w-0 pr-2">
                        <Link to={`/problems`} className="text-sm md:text-base font-bold text-(--text-h) hover:text-(--accent) hover:underline underline-offset-2 transition-colors line-clamp-1 truncate block">
                          {problemName}
                        </Link>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 ml-2">
                        <span className="text-[11px] font-mono text-(--text-subtle) hidden sm:inline-block">Score: {score}</span>
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap border ${badgeClasses}`}>
                          {isAccepted ? "Accepted" : "Partial / WA"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
        </div>
      </motion.div>
    </div>
  );
}