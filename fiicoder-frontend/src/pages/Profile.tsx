import { motion } from "framer-motion";
import { useAuth } from "../services/AuthContext";
import { useLanguage } from "../language/Language";

const pageVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

export default function Profile() {
  const { username } = useAuth();
  const { lang } = useLanguage();

  return (
    <div className="p-8 w-full max-w-150 mx-auto theme-surface-card backdrop-blur-lg border-2 border-pink-500/30 rounded-2xl card-glow">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={pageVariants}
      >
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-linear-to-br from-pink-400 to-purple-500 flex items-center justify-center text-4xl font-bold text-white uppercase shadow-lg">
          {username?.charAt(0) || "?"}
        </div>
        
        <h1 className="text-3xl font-bold text-pink-100 mb-2">
          {username}
        </h1>
        
        <p className="text-pink-300/60 mb-8">
          {lang === "RO" ? "Pagina de profil este în construcție." : "Profile page is under construction."}
        </p>

        <div className="page-line-horizontal mb-8" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
          <div className="p-4 rounded-xl border border-pink-500/20 bg-pink-500/5">
            <p className="text-xs text-pink-400 uppercase font-bold tracking-wider">Status</p>
            <p className="text-pink-100">Online</p>
          </div>
          <div className="p-4 rounded-xl border border-pink-500/20 bg-pink-500/5">
            <p className="text-xs text-pink-400 uppercase font-bold tracking-wider">Role</p>
            <p className="text-pink-100">User</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}