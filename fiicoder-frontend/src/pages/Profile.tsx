import { motion } from "framer-motion";
import { Link } from "react-router-dom"; // Asigură-te că exporți Link
import { useAuth } from "../services/AuthContext";
import { useLanguage } from "../language/Language";

const pageVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

export default function Profile() {
  const { username, isAdmin } = useAuth(); // Am extras isAdmin din hook
  const { lang } = useLanguage();

  return (
    <div className="p-8 w-full max-w-150 mx-auto theme-surface-card backdrop-blur-lg border-2 border-pink-500/30 rounded-2xl card-glow">
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
          {lang === "RO" ? "Pagina de profil este în construcție." : "Profile page is under construction."}
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
          <div className="p-4 rounded-xl border border-pink-500/20 bg-pink-500/5">
            <p className="text-xs text-pink-400 uppercase font-bold tracking-wider">Status</p>
            <p className="text-pink-100">Online</p>
          </div>
          <div className="p-4 rounded-xl border border-pink-500/20 bg-pink-500/5">
            <p className="text-xs text-pink-400 uppercase font-bold tracking-wider">Role</p>
            <p className="text-pink-100 font-semibold">{isAdmin ? "Administrator" : "User"}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}