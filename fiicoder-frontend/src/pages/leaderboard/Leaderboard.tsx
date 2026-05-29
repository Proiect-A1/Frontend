import { useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useLanguage } from "../../language/Language";
import { leaderboardService, type LeaderboardEntry } from "./services/leaderboardService";

const PAGE_SIZE = 20;

// Top-3 medal accents; everyone else uses the neutral accent border.
const RANK_STYLES: Record<number, { ring: string; badge: string; glow: string }> = {
  1: { ring: "border-[#FFD24A]", badge: "bg-[#FFD24A] text-black", glow: "shadow-[0_0_18px_rgba(255,210,74,0.35)]" },
  2: { ring: "border-[#C8CDD6]", badge: "bg-[#C8CDD6] text-black", glow: "shadow-[0_0_14px_rgba(200,205,214,0.3)]" },
  3: { ring: "border-[#D9954B]", badge: "bg-[#D9954B] text-black", glow: "shadow-[0_0_14px_rgba(217,149,75,0.3)]" },
};

function initials(entry: LeaderboardEntry): string {
  const { firstName, lastName, username } = entry.user;
  const a = firstName?.charAt(0) ?? "";
  const b = lastName?.charAt(0) ?? "";
  const combined = `${a}${b}`.trim();
  return (combined || username.charAt(0) || "?").toUpperCase();
}

function displayName(entry: LeaderboardEntry): string {
  const { firstName, lastName, username } = entry.user;
  const full = `${firstName ?? ""} ${lastName ?? ""}`.trim();
  return full || username;
}

export default function Leaderboard() {
  const { lang } = useLanguage();

  const query = useInfiniteQuery({
    queryKey: ["leaderboard", PAGE_SIZE],
    initialPageParam: 1,
    queryFn: ({ pageParam }) => leaderboardService.getLeaderboard(pageParam, PAGE_SIZE),
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === PAGE_SIZE ? allPages.length + 1 : undefined,
  });

  const entries = useMemo(() => query.data?.pages.flat() ?? [], [query.data]);
  const loading = query.isPending;
  const error = query.error instanceof Error ? query.error.message : query.error ? String(query.error) : null;
  const hasMore = query.hasNextPage ?? false;
  const isLoadingMore = query.isFetchingNextPage;

  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (e) => {
        if (e[0].isIntersecting && hasMore && !isLoadingMore) query.fetchNextPage();
      },
      { rootMargin: "200px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, query]);

  return (
    <div className="w-full max-w-4xl mx-auto h-auto overflow-visible">
      <section className="h-auto xl:h-[calc(100svh-8.5rem)] overflow-visible xl:overflow-y-auto p-5 md:p-7 bg-(--surface-card) border-2 border-(--accent) rounded-3xl custom-scrollbar">
        <div className="flex flex-col gap-1 mb-4">
          <h1 className="text-3xl font-bold text-(--text)">
            {lang === "RO" ? "Clasament" : "Leaderboard"}
          </h1>
          <p className="text-sm text-(--text-muted)">
            {lang === "RO"
              ? "Utilizatorii ordonați după numărul de probleme rezolvate complet."
              : "Users ranked by the number of problems they've fully solved."}
          </p>
        </div>
        <div className="page-line-horizontal mb-6" />

        {loading && (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-[68px] rounded-2xl border border-(--accent)/15 bg-(--surface-muted) animate-pulse"
              />
            ))}
          </div>
        )}

        {error && !loading && (
          <p className="text-sm text-(--status-error) bg-(--status-error-bg) p-4 rounded-2xl border border-(--status-error)/40">
            {lang === "RO"
              ? "Nu s-a putut încărca clasamentul. Încearcă din nou."
              : "Couldn't load the leaderboard. Please try again."}
          </p>
        )}

        {!loading && !error && entries.length === 0 && (
          <p className="text-sm text-(--text-h) bg-(--surface-muted) p-4 rounded-2xl border-2 border-(--accent)/25">
            {lang === "RO"
              ? "Încă nu există utilizatori în clasament."
              : "No users on the leaderboard yet."}
          </p>
        )}

        {!loading && entries.length > 0 && (
          <div className="flex flex-col gap-2.5">
            {entries.map((entry, index) => {
              const rankStyle = RANK_STYLES[entry.rank];
              return (
                <motion.div
                  key={entry.user.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (index % PAGE_SIZE) * 0.05, duration: 0.25 }}
                  className={`flex items-center gap-4 rounded-2xl border bg-(--surface-muted) p-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-(--accent) ${
                    rankStyle ? `${rankStyle.ring} ${rankStyle.glow}` : "border-(--accent)/20"
                  }`}
                >
                  {/* rank */}
                  <div
                    className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center text-sm font-black ${
                      rankStyle ? rankStyle.badge : "bg-(--accent)/15 text-(--text-h)"
                    }`}
                  >
                    {entry.rank}
                  </div>

                  {/* avatar initials */}
                  <div className="w-10 h-10 shrink-0 rounded-full border-2 border-(--accent)/40 bg-(--accent) flex items-center justify-center text-sm font-black text-white uppercase">
                    {initials(entry)}
                  </div>

                  {/* identity */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-(--text-h) truncate">{displayName(entry)}</span>
                      {entry.user.role !== "USER" && (
                        <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border border-(--accent-secondary)/30 bg-(--accent-secondary)/10 text-(--text-muted)">
                          {entry.user.role === "ADMIN"
                            ? lang === "RO" ? "Admin" : "Admin"
                            : lang === "RO" ? "Profesor" : "Professor"}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-(--text-subtle) font-mono truncate block">
                      @{entry.user.username}
                    </span>
                  </div>

                  {/* solved count */}
                  <div className="shrink-0 text-right">
                    <div className="text-lg font-black text-(--text-h) leading-none">
                      {entry.solvedCount}
                    </div>
                    <div className="text-[10px] uppercase tracking-widest text-(--text-muted) font-bold mt-0.5">
                      {lang === "RO" ? "rezolvate" : "solved"}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* infinite scroll sentinel */}
        <div ref={sentinelRef} className="h-1" />
        {isLoadingMore && (
          <div className="mt-6 mb-4 flex justify-center">
            <div className="w-5 h-5 rounded-full border-2 border-(--accent)/30 border-t-(--accent) animate-spin" />
          </div>
        )}

        {!loading && !hasMore && entries.length > 0 && (
          <div className="mt-8 mb-2 text-center text-xs text-(--text-subtle) uppercase tracking-widest font-bold">
            {lang === "RO" ? "Ai ajuns la finalul clasamentului" : "End of the leaderboard"}
          </div>
        )}
      </section>
    </div>
  );
}
