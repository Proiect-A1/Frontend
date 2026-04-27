import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../language/Language";
import { adminService, type AdminOverview, type AdminUser, type ProblemProposal } from "../services/adminService";
import { staggerConfig } from "../utils/motionConfig";
import { Navigate } from "react-router-dom";
import { useAuth } from "../services/AuthContext";

const tabs = [
  { id: "overview", labelRO: "Overview", labelEN: "Overview" },
  { id: "users", labelRO: "Utilizatori", labelEN: "Users" },
  { id: "proposals", labelRO: "Propuneri", labelEN: "Proposals" },
  { id: "announcements", labelRO: "Anunțuri", labelEN: "Announcements" },
];

export default function AdminPanel() {
  const { lang } = useLanguage();
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  // states
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [proposals, setProposals] = useState<ProblemProposal[]>([]);

  // non-admins cant acces the page, redirect to home
  if (!isAdmin) return <Navigate to="/" replace />;

  useEffect(() => {
    async function loadData() {
      if (activeTab === "overview") setOverview(await adminService.getOverview());
      if (activeTab === "users") setUsers(await adminService.getUsers(1));
      if (activeTab === "proposals") setProposals(await adminService.getProposals());
    }
    loadData();
  }, [activeTab]);

  const handleReview = async (id: string, action: "approve" | "reject") => {
    await adminService.reviewProposal(id, action);
    setProposals(prev => prev.filter(p => p.id !== id));
  };

  const handleBanToggle = async (userId: string, isBanned: boolean) => {
    await adminService.toggleBan(userId, isBanned);
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, isBanned: !isBanned } : u));
  };

  const handleRoleChange = async (userId: string, currentRole: string) => {
    const newRole = currentRole === "ADMIN" ? "USER" : "ADMIN";
    await adminService.changeRole(userId, newRole);
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
  };

  return (
    <div className="w-full flex justify-center h-auto xl:flex-1 xl:min-h-0">
      <motion.div
        className="w-full max-w-7xl rounded-2xl border-2 border-pink-500/30 theme-surface-card backdrop-blur-lg px-5 py-6 md:px-8 md:py-8 card-glow h-auto overflow-visible xl:h-full xl:overflow-y-auto custom-scrollbar"
        variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: staggerConfig } }}
        initial="hidden"
        animate="visible"
      >
        <div className="mb-8 border-b border-pink-500/20 pb-6">
          <h1 className="text-3xl font-bold text-pink-100 flex items-center gap-3">
            {lang === "RO" ? "Panou Administrare" : "Admin Panel"}
          </h1>
          <p className="text-sm text-pink-200/70 mt-2">
            {lang === "RO" ? "Gestionează platforma, aprobă probleme și administrează utilizatorii." : "Manage the platform, approve problems, and administer users."}
          </p>
        </div>

        {/* navigation */}
        <div className="flex flex-wrap gap-3 mb-8">
          {tabs.map(tab => {
            const isActive = activeTab === tab.id;
            const baseClasses = "px-4 py-1.5 rounded-full text-sm font-medium border-2 transition-all duration-200 flex items-center justify-center cursor-pointer outline-none";
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${baseClasses} ${
                  isActive
                    ? "bg-pink-500/25 border-pink-300 text-pink-100"
                    : "bg-transparent border-pink-400/50 text-pink-200 hover:bg-pink-500/15 hover:text-pink-100 hover:-translate-y-0.5"
                }`}
              >
                {lang === "RO" ? tab.labelRO : tab.labelEN}
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {/* overview tab */}
            {activeTab === "overview" && overview && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {[
                  { label: "Utilizatori", val: overview.usersCount },
                  { label: "Probleme", val: overview.problemsCount },
                  { label: "Submisii", val: overview.submissionsCount },
                  { label: "Clase", val: overview.classesCount },
                  { label: "Propuneri", val: overview.pendingProposals, highlight: true }
                ].map((stat, i) => (
                  <div key={i} className={`p-5 rounded-xl border theme-surface-muted flex flex-col items-center justify-center text-center ${stat.highlight ? "border-amber-400/50 bg-amber-500/10" : "border-pink-500/20"}`}>
                    <span className={`text-3xl font-black mb-1 ${stat.highlight ? "text-amber-300" : "text-pink-300"}`}>{stat.val}</span>
                    <span className="text-xs uppercase tracking-widest text-pink-200/60 font-bold">{stat.label}</span>
                  </div>
                ))}
              </div>
            )}

            {/* users tab */}
            {activeTab === "users" && (
              <div className="grid gap-4">
                {users.map(u => (
                  <div key={u.id} className="p-4 rounded-xl border border-pink-500/20 theme-surface-muted flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-pink-100 font-bold text-lg flex items-center gap-2">
                        {u.username}
                        {u.role === "ADMIN" && <span className="bg-purple-500/20 text-purple-300 border border-purple-500/40 text-xs px-2.5 py-1 rounded-full uppercase">Admin</span>}
                        {u.isBanned && <span className="bg-red-500/20 text-red-300 border border-red-500/40 text-xs px-2.5 py-1 rounded-full uppercase">Banned</span>}
                      </h3>
                      <p className="text-pink-200/60 text-sm">{u.email}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => handleRoleChange(u.id, u.role)} className="rounded-full border border-pink-400/40 bg-pink-500/10 hover:bg-pink-500/20 px-2.5 py-1 text-xs font-semibold text-pink-100">
                        {u.role === "ADMIN" ? "Make User" : "Make Admin"}
                      </button>
                      <button onClick={() => handleBanToggle(u.id, u.isBanned)} className={`rounded-full border px-2.5 py-1 text-xs font-semibold text-pink-100 ${u.isBanned ? "border-green-500/40 bg-green-500/10 text-green-200 hover:bg-green-500/20" : "border-red-500/40 bg-red-500/10 text-red-200 hover:bg-red-500/20"}`}>
                        {u.isBanned ? "Unban" : "Ban"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* proposals tab */}
            {activeTab === "proposals" && (
              <div className="grid gap-4">
                {proposals.length === 0 && <p className="text-pink-200/60 text-sm">Nu există propuneri în așteptare.</p>}
                {proposals.map(p => (
                  <div key={p.id} className="p-5 rounded-xl border border-pink-500/20 theme-surface-muted shadow-lg shadow-black/10">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold text-pink-100">{p.title}</h3>
                      <span className="text-xs text-pink-300/50">{p.createdAt}</span>
                    </div>
                    <p className="text-sm text-pink-200/70 mb-4 line-clamp-2">{p.description}</p>
                    <div className="flex items-center justify-between border-t border-pink-500/20 pt-4 mt-2">
                      <span className="text-xs text-pink-300/60 font-semibold">Propus de: <span className="text-pink-200">{p.authorUsername}</span></span>
                      <div className="flex gap-2">
                        <button onClick={() => handleReview(p.id, "reject")} className="px-4 py-2 rounded-full border border-red-500/40 bg-red-500/10 text-red-200 text-xs font-bold hover:bg-red-500/20 transition-colors">
                          Respinge
                        </button>
                        <button onClick={() => handleReview(p.id, "approve")} className="px-4 py-2 rounded-full border border-green-500/40 bg-green-500/10 text-green-200 text-xs font-bold hover:bg-green-500/20 transition-colors">
                          Aprobă Problema
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* announcements tab */}
            {activeTab === "announcements" && (
              <div className="p-6 rounded-xl border border-pink-500/20 theme-surface-muted text-center">
                <p className="text-pink-200/70">Panoul de creare a anunțurilor globale va apărea aici.</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}