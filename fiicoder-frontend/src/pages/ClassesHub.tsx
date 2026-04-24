import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../services/AuthContext";
import { classService, type GroupFindResponseDTO, type GroupInvitationResponseDTO } from "../services/classService";
import { useLanguage } from "../language/Language";

const pageVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.08, delayChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export default function ClassesHub() {
  const { lang } = useLanguage();
  const { userId, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [className, setClassName] = useState("");
  const [classDescription, setClassDescription] = useState("");
  const [lookupId, setLookupId] = useState("");
  const [foundClass, setFoundClass] = useState<GroupFindResponseDTO | null>(null);
  const [invitations, setInvitations] = useState<GroupInvitationResponseDTO[]>([]);
  const [loadingInvitations, setLoadingInvitations] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    let isMounted = true;

    async function loadInvitations() {
      try {
        setLoadingInvitations(true);
        const data = await classService.getMyInvitations();
        if (isMounted) setInvitations(data);
      } catch {
        if (isMounted) setInvitations([]);
      } finally {
        if (isMounted) setLoadingInvitations(false);
      }
    }

    loadInvitations();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated]);

  const handleCreateClass = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setFeedback(null);

    if (!userId) {
      setError(lang === "RO" ? "Nu am putut identifica userul curent." : "Could not identify the current user.");
      return;
    }

    try {
      const response = await classService.create({
        name: className,
        description: classDescription,
        creatorId: userId,
      });
      setFeedback(lang === "RO" ? `Clasa a fost creată: ${response.id}` : `Class created: ${response.id}`);
      setClassName("");
      setClassDescription("");
      navigate(`/classes/${response.id}`);
    } catch (err: any) {
      setError(err?.body?.message || err?.body?.error || (lang === "RO" ? "Nu s-a putut crea clasa." : "Could not create the class."));
    }
  };

  const handleLookupClass = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setFeedback(null);

    try {
      const response = await classService.getById(lookupId.trim());
      setFoundClass(response);
    } catch (err: any) {
      setFoundClass(null);
      setError(err?.body?.message || err?.body?.error || (lang === "RO" ? "Clasa nu a fost găsită." : "Class not found."));
    }
  };

  return (
    <div className="h-full min-h-0 overflow-hidden">
      <motion.div
        className="h-full overflow-y-auto custom-scrollbar rounded-[2rem] border border-pink-500/20 bg-[#0f0c18]/55 backdrop-blur-xl px-5 py-6 md:px-8 md:py-8 shadow-[0_0_60px_rgba(236,72,153,0.12)]"
        variants={pageVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between mb-8">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-pink-300/60">
              {lang === "RO" ? "Clase" : "Classes"}
            </p>
            <h1 className="text-4xl md:text-5xl font-black text-pink-100 mt-2">
              {lang === "RO" ? "Hub-ul de clase" : "Class hub"}
            </h1>
            <p className="text-pink-200/70 mt-3 max-w-2xl">
              {lang === "RO"
                ? "Creezi clase, verifici invitațiile și intri rapid într-o clasă existentă."
                : "Create classes, review invitations, and jump into an existing class quickly."}
            </p>
          </div>
          <Link
            to="/problems"
            className="inline-flex items-center justify-center px-5 py-3 rounded-2xl border-2 border-pink-400/50 text-pink-100 bg-pink-500/10 hover:bg-pink-500/20 transition-colors"
          >
            {lang === "RO" ? "Mergi la probleme" : "Go to problems"}
          </Link>
        </motion.div>

        {(feedback || error) && (
          <motion.div variants={itemVariants} className={`mb-6 rounded-2xl border-2 px-4 py-3 ${error ? "border-red-500/40 bg-red-500/10 text-red-100" : "border-pink-500/40 bg-pink-500/10 text-pink-100"}`}>
            {error || feedback}
          </motion.div>
        )}

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <motion.section variants={itemVariants} className="rounded-3xl border border-pink-500/20 bg-[#151221]/75 p-6 shadow-lg shadow-black/20">
            <h2 className="text-2xl font-bold text-pink-100">
              {lang === "RO" ? "Creează o clasă" : "Create a class"}
            </h2>
            <p className="mt-2 text-sm text-pink-200/65">
              {lang === "RO"
                ? "Backend-ul cere creatorId, deci folosim direct userul din JWT."
                : "The backend expects creatorId, so we use the user id from the JWT."}
            </p>

            <form onSubmit={handleCreateClass} className="mt-5 space-y-4">
              <input
                value={className}
                onChange={(event) => setClassName(event.target.value)}
                placeholder={lang === "RO" ? "Nume clasă" : "Class name"}
                className="w-full rounded-2xl border border-pink-500/25 bg-[#100d19]/80 px-4 py-3 text-pink-100 outline-none transition focus:border-pink-400"
              />
              <textarea
                value={classDescription}
                onChange={(event) => setClassDescription(event.target.value)}
                placeholder={lang === "RO" ? "Descriere opțională" : "Optional description"}
                className="min-h-28 w-full rounded-2xl border border-pink-500/25 bg-[#100d19]/80 px-4 py-3 text-pink-100 outline-none transition focus:border-pink-400"
              />
              <button
                type="submit"
                className="rounded-2xl border-2 border-pink-400/60 bg-pink-500/20 px-5 py-3 font-semibold text-pink-100 transition hover:bg-pink-500/35"
              >
                {lang === "RO" ? "Creează clasa" : "Create class"}
              </button>
            </form>
          </motion.section>

          <motion.section variants={itemVariants} className="rounded-3xl border border-pink-500/20 bg-[#151221]/75 p-6 shadow-lg shadow-black/20">
            <h2 className="text-2xl font-bold text-pink-100">
              {lang === "RO" ? "Găsește o clasă" : "Find a class"}
            </h2>
            <form onSubmit={handleLookupClass} className="mt-5 flex gap-3">
              <input
                value={lookupId}
                onChange={(event) => setLookupId(event.target.value)}
                placeholder={lang === "RO" ? "UUID clasă" : "Class UUID"}
                className="flex-1 rounded-2xl border border-pink-500/25 bg-[#100d19]/80 px-4 py-3 text-pink-100 outline-none transition focus:border-pink-400"
              />
              <button
                type="submit"
                className="rounded-2xl border-2 border-pink-400/50 px-4 py-3 font-semibold text-pink-100 transition hover:bg-pink-500/15"
              >
                {lang === "RO" ? "Caută" : "Search"}
              </button>
            </form>

            {foundClass && (
              <div className="mt-5 rounded-2xl border border-pink-500/20 bg-[#100d19]/80 p-4">
                <h3 className="text-xl font-bold text-pink-100">{foundClass.name}</h3>
                <p className="mt-2 text-sm text-pink-200/70">{foundClass.description || (lang === "RO" ? "Fără descriere." : "No description.")}</p>
                <div className="mt-4 grid gap-2 text-xs text-pink-200/70">
                  <div>{lang === "RO" ? "Creată de" : "Created by"}: {foundClass.creatorUsername}</div>
                  <div>ID: {foundClass.id}</div>
                  <div>{foundClass.createdAt}</div>
                </div>
                <Link
                  to={`/classes/${foundClass.id}`}
                  className="mt-4 inline-flex rounded-xl border border-pink-400/50 px-4 py-2 text-sm font-semibold text-pink-100 hover:bg-pink-500/15"
                >
                  {lang === "RO" ? "Deschide clasa" : "Open class"}
                </Link>
              </div>
            )}
          </motion.section>
        </div>

        <motion.section variants={itemVariants} className="mt-6 rounded-3xl border border-pink-500/20 bg-[#151221]/75 p-6 shadow-lg shadow-black/20">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-bold text-pink-100">
              {lang === "RO" ? "Invitațiile mele" : "My invitations"}
            </h2>
            {loadingInvitations && <span className="text-sm text-pink-200/60">{lang === "RO" ? "Se încarcă..." : "Loading..."}</span>}
          </div>

          <div className="mt-4 grid gap-3">
            {invitations.length === 0 && !loadingInvitations && (
              <div className="rounded-2xl border border-pink-500/20 bg-[#100d19]/80 p-4 text-pink-200/70">
                {lang === "RO" ? "Nu ai invitații active." : "You have no active invitations."}
              </div>
            )}

            {invitations.map((invitation) => (
              <div key={invitation.id} className="rounded-2xl border border-pink-500/20 bg-[#100d19]/80 p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-lg font-semibold text-pink-100">{invitation.studyClass?.name || (lang === "RO" ? "Clasă invitată" : "Invited class")}</p>
                  <p className="text-sm text-pink-200/65">
                    {lang === "RO" ? "Status" : "Status"}: {invitation.status}
                  </p>
                  <p className="text-xs text-pink-300/55">{invitation.sentAt}</p>
                </div>
                {invitation.studyClass?.id && (
                  <Link
                    to={`/classes/${invitation.studyClass.id}`}
                    className="inline-flex self-start rounded-xl border border-pink-400/50 px-4 py-2 text-sm font-semibold text-pink-100 hover:bg-pink-500/15"
                  >
                    {lang === "RO" ? "Vezi clasa" : "View class"}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </motion.section>
      </motion.div>
    </div>
  );
}