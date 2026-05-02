import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../services/AuthContext";
import {
  classService,
  type GroupFindResponseDTO,
} from "../services/classService";
import {
  homeworkService,
  type HomeworkResponseDTO,
} from "../services/homeworkService";
import { useLanguage } from "../language/Language";
import { itemVariants, staggerConfig } from "../utils/motionConfig";

const pageVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: staggerConfig,
  },
};

function getHomeworkBadge(status: HomeworkResponseDTO["status"]) {
  switch (status) {
    case "ACTIVE":
      return "border-emerald-400/40 bg-emerald-500/10 text-emerald-200";
    case "DRAFT":
      return "border-amber-400/40 bg-amber-500/10 text-amber-200";
    default:
      return "border-pink-400/40 bg-pink-500/10 text-pink-100";
  }
}

export default function ClassDetails() {
  const { groupId } = useParams();
  const { lang } = useLanguage();
  const { userId } = useAuth();

  const [group, setGroup] = useState<GroupFindResponseDTO | null>(null);
  const [homeworks, setHomeworks] = useState<HomeworkResponseDTO[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [homeworkTitle, setHomeworkTitle] = useState("");
  const [homeworkDescription, setHomeworkDescription] = useState("");
  const [homeworkDeadline, setHomeworkDeadline] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!groupId) return;
    const currentGroupId = groupId;

    let isMounted = true;

    async function loadData() {
      try {
        setLoading(true);
        const [groupData, homeworkData] = await Promise.all([
          classService.getById(currentGroupId),
          homeworkService.getAll(currentGroupId),
        ]);
        if (!isMounted) return;
        setGroup(groupData);
        setHomeworks(homeworkData);
      } catch (err: any) {
        if (isMounted) {
          setError(
            err?.body?.message ||
              err?.body?.error ||
              (lang === "RO"
                ? "Nu am putut încărca clasa."
                : "Could not load the class."),
          );
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [groupId, lang]);

  const reloadHomeworks = async () => {
    if (!groupId) return;
    const data = await homeworkService.getAll(groupId);
    setHomeworks(data);
  };

  const handleInvite = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!groupId) return;
    try {
      setError(null);
      setFeedback(null);
      await classService.inviteUser(groupId, { email: inviteEmail });
      setInviteEmail("");
      setFeedback(
        lang === "RO" ? "Invitația a fost trimisă." : "Invitation sent.",
      );
    } catch (err: any) {
      setError(
        err?.body?.message ||
          err?.body?.error ||
          (lang === "RO"
            ? "Nu am putut trimite invitația."
            : "Could not send invitation."),
      );
    }
  };

  const handleCreateHomework = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    if (!groupId) return;
    try {
      setError(null);
      setFeedback(null);
      await homeworkService.create(groupId, {
        title: homeworkTitle,
        description: homeworkDescription,
        deadline: homeworkDeadline,
      });
      setHomeworkTitle("");
      setHomeworkDescription("");
      setHomeworkDeadline("");
      setFeedback(lang === "RO" ? "Tema a fost creată." : "Homework created.");
      await reloadHomeworks();
    } catch (err: any) {
      setError(
        err?.body?.message ||
          err?.body?.error ||
          (lang === "RO"
            ? "Nu am putut crea tema."
            : "Could not create homework."),
      );
    }
  };

  const handleDeleteHomework = async (homeworkId: string) => {
    if (!groupId) return;
    try {
      setError(null);
      setFeedback(null);
      await homeworkService.delete(groupId, homeworkId);
      setFeedback(lang === "RO" ? "Tema a fost ștearsă." : "Homework deleted.");
      await reloadHomeworks();
    } catch (err: any) {
      setError(
        err?.body?.message ||
          err?.body?.error ||
          (lang === "RO"
            ? "Nu am putut șterge tema."
            : "Could not delete homework."),
      );
    }
  };

  return (
    <div className="w-full flex justify-center h-auto xl:flex-1 xl:min-h-0">
      <motion.div
        className="w-full max-w-7xl rounded-2xl border border-[var(--accent)]/50 theme-surface-card backdrop-blur-sm px-5 py-6 md:px-8 md:py-8 card-glow h-auto overflow-visible xl:h-full xl:overflow-y-auto custom-scrollbar"
        variants={pageVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          variants={itemVariants}
          className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between mb-8"
        >
          <div>
            <p className="text-xs uppercase tracking-widest text-pink-300/60">
              {lang === "RO" ? "Clasă" : "Class"}
            </p>
            <h1 className="text-3xl font-bold text-pink-100 mt-1">
              {group?.name ||
                (lang === "RO" ? "Se încarcă clasa..." : "Loading class...")}
            </h1>
            <p className="text-sm text-pink-200/70 mt-2 max-w-3xl">
              {group?.description ||
                (lang === "RO" ? "Fără descriere." : "No description.")}
            </p>
          </div>
          <Link
            to="/classes"
            className="inline-flex items-center justify-center px-4 py-2 text-sm rounded-xl border-2 border-pink-400/50 text-pink-100 bg-pink-500/10 hover:bg-pink-500/20 transition-colors"
          >
            {lang === "RO" ? "Înapoi la hub" : "Back to hub"}
          </Link>
        </motion.div>

        {(feedback || error) && (
          <motion.div
            variants={itemVariants}
            className={`mb-6 rounded-xl border-2 px-4 py-3 text-sm ${error ? "border-red-500/40 bg-red-500/10 text-red-100" : "border-pink-500/40 bg-pink-500/10 text-pink-100"}`}
          >
            {error || feedback}
          </motion.div>
        )}

        {loading && (
          <motion.div
            variants={itemVariants}
            className="rounded-xl border border-pink-500/20 theme-surface-card p-4 text-sm text-pink-200/70"
          >
            {lang === "RO"
              ? "Se încarcă datele clasei..."
              : "Loading class data..."}
          </motion.div>
        )}

        {!loading && group && (
          <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <motion.section
              variants={itemVariants}
              className="rounded-xl border border-pink-500/20 theme-surface-card p-5 shadow-lg shadow-black/20"
            >
              <h2 className="text-xl font-bold text-pink-100">
                {lang === "RO" ? "Detalii clasă" : "Class details"}
              </h2>
              <div className="mt-3 grid gap-2 text-xs text-pink-200/70">
                <div>
                  {lang === "RO" ? "Creată de" : "Created by"}:{" "}
                  {group.creatorUsername}
                </div>
                <div>ID: {group.id}</div>
                <div>{group.createdAt}</div>
              </div>

              <form
                onSubmit={handleInvite}
                className="mt-5 rounded-xl border border-pink-500/20 theme-surface-muted p-4"
              >
                <h3 className="text-lg font-semibold text-pink-100">
                  {lang === "RO" ? "Invită un elev" : "Invite a student"}
                </h3>
                <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                  <input
                    value={inviteEmail}
                    onChange={(event) => setInviteEmail(event.target.value)}
                    placeholder={
                      lang === "RO" ? "email@exemplu.com" : "email@example.com"
                    }
                    className="flex-1 rounded-xl border border-pink-500/25 theme-surface-card px-3 py-2 text-sm text-pink-100 outline-none transition focus:border-pink-400"
                  />
                  <button
                    type="submit"
                    className="rounded-xl border border-pink-400/60 bg-pink-500/20 px-4 py-2 text-sm font-semibold text-pink-100 transition hover:bg-pink-500/35"
                  >
                    {lang === "RO" ? "Trimite" : "Send"}
                  </button>
                </div>
              </form>
            </motion.section>

            <motion.section
              variants={itemVariants}
              className="rounded-xl border border-pink-500/20 theme-surface-card p-5 shadow-lg shadow-black/20"
            >
              <h2 className="text-xl font-bold text-pink-100">
                {lang === "RO" ? "Creează temă" : "Create homework"}
              </h2>
              <p className="mt-1 text-xs text-pink-200/65">
                {lang === "RO"
                  ? "Doar creatorul clasei poate adăuga teme, backend-ul validează asta automat."
                  : "Only the class creator can add homework; the backend validates it automatically."}
              </p>

              <form onSubmit={handleCreateHomework} className="mt-4 space-y-3">
                <input
                  value={homeworkTitle}
                  onChange={(event) => setHomeworkTitle(event.target.value)}
                  placeholder={lang === "RO" ? "Titlu temă" : "Homework title"}
                  className="w-full rounded-xl border border-pink-500/25 theme-surface-muted px-3 py-2 text-sm text-pink-100 outline-none transition focus:border-pink-400"
                />
                <textarea
                  value={homeworkDescription}
                  onChange={(event) =>
                    setHomeworkDescription(event.target.value)
                  }
                  placeholder={lang === "RO" ? "Descriere" : "Description"}
                  className="min-h-24 w-full rounded-xl border border-pink-500/25 theme-surface-muted px-3 py-2 text-sm text-pink-100 outline-none transition focus:border-pink-400"
                />
                <input
                  type="date"
                  value={homeworkDeadline}
                  onChange={(event) => setHomeworkDeadline(event.target.value)}
                  className="w-full rounded-xl border border-pink-500/25 theme-surface-muted px-3 py-2 text-sm text-pink-100 outline-none transition focus:border-pink-400"
                />
                <button
                  type="submit"
                  className="rounded-xl border border-pink-400/60 bg-pink-500/20 px-4 py-2 text-sm font-semibold text-pink-100 transition hover:bg-pink-500/35"
                >
                  {lang === "RO" ? "Publică tema" : "Publish homework"}
                </button>
              </form>
            </motion.section>
          </div>
        )}

        <motion.section
          variants={itemVariants}
          className="mt-6 rounded-xl border border-pink-500/20 theme-surface-card p-5 shadow-lg shadow-black/20"
        >
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-pink-100">
              {lang === "RO" ? "Teme active" : "Active homework"}
            </h2>
            <span className="text-xs text-pink-200/60">{homeworks.length}</span>
          </div>

          <div className="mt-4 grid gap-3">
            {homeworks.length === 0 && !loading && (
              <div className="rounded-xl border border-pink-500/20 theme-surface-muted p-4 text-sm text-pink-200/70">
                {lang === "RO"
                  ? "Nu există teme pentru această clasă."
                  : "There is no homework for this class."}
              </div>
            )}

            {homeworks.map((homework) => (
              <div
                key={homework.id}
                className="rounded-xl border border-pink-500/20 theme-surface-muted p-4"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-lg font-semibold text-pink-100">
                        {homework.title}
                      </h3>
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${getHomeworkBadge(homework.status)}`}
                      >
                        {homework.status}
                      </span>
                    </div>
                    <p className="mt-1.5 text-sm text-pink-200/70">
                      {homework.description ||
                        (lang === "RO" ? "Fără descriere." : "No description.")}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-3 text-xs text-pink-300/55">
                      <span>
                        {lang === "RO" ? "Deadline" : "Deadline"}:{" "}
                        {homework.deadline}
                      </span>
                      <span>ID: {homework.id}</span>
                    </div>
                  </div>

                  {userId === group?.creatorId && (
                    <button
                      onClick={() => handleDeleteHomework(homework.id)}
                      className="rounded-lg border border-red-400/50 px-3 py-1.5 text-xs font-semibold text-red-300 hover:bg-red-500/10"
                    >
                      {lang === "RO" ? "Șterge" : "Delete"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.section>
      </motion.div>
    </div>
  );
}