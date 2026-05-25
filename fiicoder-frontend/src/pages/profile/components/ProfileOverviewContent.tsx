import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  isAcceptedSubmission,
  type ProfileResponseDTO,
  type RecentSubmissionDTO,
} from "../../../services/profileService";
import { containerVariants, itemVariants } from "../../../utils/motionConfig";
import {
  formatPercent,
  getHeatmapStyle,
  submissionVerdict,
  submissionVerdictLabels,
} from "../profileUtils";

type ProfileOverviewContentProps = {
  profile: ProfileResponseDTO;
  lang: "RO" | "EN";
  theme: string;
};

const getSubmissionCounts = (
  submissions: RecentSubmissionDTO[] | undefined,
): Record<string, number> => {
  if (!submissions || submissions.length === 0) return {};
  const counts: Record<string, number> = {};
  submissions.forEach((submission) => {
    if (isAcceptedSubmission(submission)) {
      const date = new Date(submission.submissionDate);
      const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      counts[dateKey] = (counts[dateKey] || 0) + 1;
    }
  });
  return counts;
};

export default function ProfileOverviewContent({
  profile,
  lang,
  theme,
}: ProfileOverviewContentProps) {
  const isLightTheme = theme === "cream" || theme === "sage" || theme === "olivia" || theme === "fii";

  const [calendarDate, setCalendarDate] = useState(new Date());

  const performanceItems = [
    {
      label: lang === "RO" ? "Ușoare" : "Easy",
      value: profile.rankEasy,
      cls: "emerald",
    },
    {
      label: lang === "RO" ? "Mediu" : "Medium",
      value: profile.rankMedium,
      cls: "amber",
    },
    {
      label: lang === "RO" ? "Grele" : "Hard",
      value: profile.rankHard,
      cls: "red",
    },
  ] as const;

  type PerformanceKey = (typeof performanceItems)[number]["cls"];

  const performanceStyles: Record<
    PerformanceKey,
    { label: string; value: string; bg: string; bar: string }
  > = {
    emerald: isLightTheme
      ? {
          label: "text-emerald-700",
          value: "text-emerald-600",
          bg: "bg-emerald-500/10",
          bar: "bg-emerald-400",
        }
      : {
          label: "text-emerald-400",
          value: "text-emerald-300",
          bg: "bg-emerald-500/10",
          bar: "bg-emerald-400",
        },
    amber: isLightTheme
      ? {
          label: "text-amber-700",
          value: "text-amber-600",
          bg: "bg-amber-500/10",
          bar: "bg-amber-400",
        }
      : {
          label: "text-amber-400",
          value: "text-amber-300",
          bg: "bg-amber-500/10",
          bar: "bg-amber-400",
        },
    red: isLightTheme
      ? {
          label: "text-red-700",
          value: "text-red-600",
          bg: "bg-red-500/10",
          bar: "bg-red-400",
        }
      : {
          label: "text-red-400",
          value: "text-red-300",
          bg: "bg-red-500/10",
          bar: "bg-red-400",
        },
  };

  const statsCards = [
    {
      label: lang === "RO" ? "Rezolvate" : "Solved",
      value: String(profile.problemsSolved),
    },
    {
      label: lang === "RO" ? "Submisii" : "Submissions",
      value: String(profile.submissions),
    },
    {
      label: lang === "RO" ? "Acceptare" : "Acceptance",
      value: formatPercent(profile.acceptanceRate),
    },
    {
      label: lang === "RO" ? "Serie" : "Streak",
      value: `${profile.streak}${profile.streakCapped ? "+" : ""}`,
    },
  ];

  const formatSubmissionDate = (isoString: string) => {
    return new Date(isoString).toLocaleString(lang === 'RO' ? 'ro-RO' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
  };

  const formatStatus = (submission: RecentSubmissionDTO) => {
    const label = submissionVerdictLabels[submissionVerdict(submission)];
    return lang === "RO" ? label.ro : label.en;
  };

  const handlePrevMonth = () =>
    setCalendarDate(
      new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1),
    );
  const handleNextMonth = () =>
    setCalendarDate(
      new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1),
    );

  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();

  let startDay = firstDay.getDay();
  startDay = startDay === 0 ? 6 : startDay - 1;

  const cells: (string | null)[] = Array(startDay).fill(null);
  for (let dayCounter = 1; dayCounter <= daysInMonth; dayCounter++) {
    cells.push(
      `${year}-${String(month + 1).padStart(2, "0")}-${String(dayCounter).padStart(2, "0")}`,
    );
  }
  const remainingCells = (7 - (cells.length % 7)) % 7;
  for (let i = 0; i < remainingCells; i++) cells.push(null);

  const weekDays =
    lang === "RO"
      ? ["L", "Ma", "Mi", "J", "V", "S", "D"]
      : ["M", "T", "W", "T", "F", "S", "S"];
  const monthName = calendarDate.toLocaleDateString(
    lang === "RO" ? "ro-RO" : "en-US",
    {
      month: "long",
      year: "numeric",
    },
  );

  const todayKey = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  })();

  // submission counts memo ca sa nu recalculeze la fiecare render
  const submissionCounts = useMemo(
    () => getSubmissionCounts(profile.recentSubmissions?.content),
    [profile.recentSubmissions?.content],
  );

  return (
    <>
      <motion.div
        variants={itemVariants}
        className="p-6 md:p-8 rounded-2xl border border-(--accent)/50 bg-(--surface-muted) backdrop-blur-sm card-glow grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-8 items-center min-w-0"
      >
        <div className="flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-(--accent)/20 pb-6 md:pb-0 md:pr-6">
          <span className="text-xs uppercase tracking-widest text-(--text-muted) font-bold mb-2">
            {lang === "RO" ? "Probleme Rezolvate" : "Problems Solved"}
          </span>
          <span className="text-6xl font-black text-(--accent) drop-shadow-md">
            {profile.problemsSolved}
          </span>
        </div>

        <div className="flex flex-col gap-4">
          {performanceItems.map((item) => (
            <div key={item.label}>
              <div className="flex items-center justify-between text-xs mb-1 gap-4">
                <span
                  className={`font-semibold ${performanceStyles[item.cls].label}`}
                >
                  {item.label}
                </span>
                <span
                  className={`font-bold ${performanceStyles[item.cls].value}`}
                >
                  {formatPercent(item.value)}
                </span>
              </div>
              <div
                className={`w-full rounded-full h-2 ${performanceStyles[item.cls].bg}`}
              >
                <div
                  className={`h-2 rounded-full ${performanceStyles[item.cls].bar}`}
                  style={{ width: formatPercent(item.value) }}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 md:grid-cols-4 gap-3 min-w-0"
      >
        {statsCards.map((item) => (
          <motion.div
            key={item.label}
            variants={itemVariants}
            className="p-3 rounded-2xl border border-(--accent)/50 bg-(--surface-muted) card-glow text-center"
          >
            <div className="text-[10px] uppercase tracking-widest text-(--text-muted) font-bold">
              {item.label}
            </div>
            <div className="mt-1 text-sm font-bold text-(--text-h)">
              {item.value}
            </div>
          </motion.div>
        ))}
      </motion.div>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-2 gap-4 min-w-0 mb-8"
      >
        <motion.div
          variants={itemVariants}
          className="p-4 rounded-2xl border border-(--accent)/50 bg-(--surface-muted) backdrop-blur-sm card-glow min-w-0"
        >
          <div className="flex items-center justify-between mb-4 gap-2">
            <h2 className="text-sm font-bold text-(--text-h) uppercase tracking-wider">
              {lang === "RO" ? "Activitate Lunară" : "Monthly Activity"}
            </h2>
            <div className="flex items-center gap-2 bg-(--surface-card) px-2 py-1 rounded-xl border border-(--accent)/20">
              <button
                onClick={handlePrevMonth}
                className="p-0.5 hover:bg-(--surface-hover) rounded-md text-(--text-muted) hover:text-(--accent) transition-colors cursor-pointer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                >
                  <path
                    fillRule="evenodd"
                    d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"
                  />
                </svg>
              </button>
              <span className="text-[11px] font-bold text-(--text-h) capitalize min-w-22.5 text-center select-none">
                {monthName}
              </span>
              <button
                onClick={handleNextMonth}
                className="p-0.5 hover:bg-(--surface-hover) rounded-md text-(--text-muted) hover:text-(--accent) transition-colors cursor-pointer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {weekDays.map((day, idx) => (
              <div
                key={idx}
                className="text-center text-[9px] font-bold text-(--text-subtle) pb-1"
              >
                {day}
              </div>
            ))}

            {cells.map((dateKey, index) => {
              if (!dateKey)
                return (
                  <div
                    key={`empty-${index}`}
                    className="w-full aspect-square"
                  />
                );

              const count = submissionCounts[dateKey] || 0;
              // level 0-4 bazat pe numarul de submisii
              const level = Math.min(4, Math.ceil(count / 2));
              const dayNumber = parseInt(dateKey.split("-")[2], 10);
              const isToday = dateKey === todayKey;

              return (
                <div
                  key={dateKey}
                  className={`w-full aspect-square rounded-md flex items-center justify-center text-[10px] font-bold select-none ${isToday ? "ring-2 ring-(--accent) ring-offset-1 ring-offset-(--surface-muted)" : ""}`}
                  style={{
                    ...getHeatmapStyle(level),
                    color:
                      level > 2 || (isLightTheme && level > 1)
                        ? "#fff"
                        : "var(--text-h)",
                    border:
                      level === 0
                        ? "1px solid color-mix(in srgb, var(--accent) 15%, transparent)"
                        : "none",
                  }}
                  title={`${dateKey}: ${count} ${lang === "RO" ? "submisii" : "submissions"}`}
                >
                  {dayNumber}
                </div>
              );
            })}
          </div>

          <div className="mt-3 flex items-center justify-end gap-1.5 text-[10px] text-(--text-subtle) font-semibold">
            <span>{lang === "RO" ? "Mai puțin" : "Less"}</span>
            <div className="w-3 h-3 rounded-[3px]" style={getHeatmapStyle(0)} />
            <div className="w-3 h-3 rounded-[3px]" style={getHeatmapStyle(1)} />
            <div className="w-3 h-3 rounded-[3px]" style={getHeatmapStyle(2)} />
            <div className="w-3 h-3 rounded-[3px]" style={getHeatmapStyle(3)} />
            <div className="w-3 h-3 rounded-[3px]" style={getHeatmapStyle(4)} />
            <span>{lang === "RO" ? "Mai mult" : "More"}</span>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="p-4 rounded-2xl border border-(--accent)/50 bg-(--surface-muted) backdrop-blur-sm card-glow min-w-0 flex flex-col"
        >
          <h2 className="text-sm font-bold text-(--text-h) mb-3 uppercase tracking-wider shrink-0">
            {lang === "RO" ? "Submisii Recente" : "Recent Submissions"}
          </h2>

          {profile.recentSubmissions.content.length > 0 ? (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="flex flex-col gap-2 overflow-y-auto custom-scrollbar flex-1"
            >
              {profile.recentSubmissions.content.map((submission) => {
                const verdict = submissionVerdict(submission);
                const verdictBadgeClasses: Record<typeof verdict, string> = isLightTheme
                  ? {
                      ACCEPTED: "bg-emerald-500/20 text-emerald-700 border-emerald-500/40",
                      PARTIAL: "bg-amber-500/20 text-amber-700 border-amber-500/40",
                      PENDING: "bg-sky-500/20 text-sky-700 border-sky-500/40",
                      REJECTED: "bg-red-500/20 text-red-700 border-red-500/40",
                    }
                  : {
                      ACCEPTED: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
                      PARTIAL: "bg-amber-500/10 text-amber-300 border-amber-500/30",
                      PENDING: "bg-sky-500/10 text-sky-300 border-sky-500/30",
                      REJECTED: "bg-red-500/10 text-red-300 border-red-500/30",
                    };
                const badgeClasses = verdictBadgeClasses[verdict];

                return (
                  <motion.div
                    key={`${submission.problemTitle}-${submission.submissionDate}`}
                    variants={itemVariants}
                    className="p-3 rounded-2xl border border-(--accent)/20 bg-(--accent)/5 flex justify-between items-center gap-3 transition-colors hover:bg-(--accent)/10 shrink-0"
                  >
                    <div className="min-w-0 pr-2">
                      <Link
                        to={`/problems/${submission.problemTitle}`}
                        className="text-sm font-bold text-(--text-h) hover:text-(--accent) hover:underline underline-offset-2 transition-colors line-clamp-1 truncate block"
                      >
                        {submission.problemTitle}
                      </Link>
                      <p className="mt-0.5 text-[11px] text-(--text-subtle)">
                        {formatSubmissionDate(submission.submissionDate)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                      <span className="text-[11px] font-mono text-(--text-subtle)">
                        Score: {submission.score}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap border ${badgeClasses}`}
                      >
                        {formatStatus(submission)}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <p className="text-sm text-(--text-subtle)">
              {lang === "RO"
                ? "Nu există submisii recente."
                : "No recent submissions."}
            </p>
          )}
        </motion.div>
      </motion.div>
    </>
  );
}
