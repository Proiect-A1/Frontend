import { motion } from 'framer-motion';
import { useState } from 'react';
import type { ProfileResponseDTO } from '../../../services/profileService';
import { itemVariants } from '../../../utils/motionConfig';
import { getGravatarUrl, getDiceBearUrl } from '../../../utils/gravatar';

type ProfileSidebarProps = {
    profile: ProfileResponseDTO;
    username: string | null;
    lang: 'RO' | 'EN';
};

export default function ProfileSidebar({ profile, username, lang }: ProfileSidebarProps) {
    const [src, setSrc] = useState(() => getGravatarUrl(profile.email));
    const [failed, setFailed] = useState(false);

    const handleError = () => {
        if (src === getGravatarUrl(profile.email)) setSrc(getDiceBearUrl(profile.email));
        else setFailed(true);
    };

    const roleLabel =
        profile.role === 'ADMIN'
            ? 'Admin'
            : profile.role === 'PROFESSOR'
              ? lang === 'RO' ? 'Profesor' : 'Professor'
              : lang === 'RO' ? 'Elev' : 'Student';

    return (
        <>
            <motion.div
                variants={itemVariants}
                className="p-6 rounded-2xl border border-(--accent)/50 bg-(--surface-muted) backdrop-blur-sm flex flex-col items-center lg:items-start text-center lg:text-left"
            >
                <div className="relative group mb-4">
                    {!failed ? (
                        <img
                            src={src}
                            alt="avatar"
                            className="w-24 h-24 rounded-full shadow-lg outline-4 outline-offset-4 outline-(--accent) shrink-0"
                            onError={handleError}
                        />
                    ) : (
                        <div className="w-24 h-24 rounded-full bg-linear-to-br from-(--accent) to-purple-500 flex items-center justify-center text-4xl font-bold text-white uppercase shadow-lg outline-4 outline-offset-4 outline-(--accent) shrink-0">
                            {(profile.username || username || profile.firstName).charAt(0).toUpperCase()}
                        </div>
                    )}
                    <a
                        href="https://gravatar.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        title={lang === 'RO' ? 'Schimbă poza pe Gravatar' : 'Change photo on Gravatar'}
                    >
                        <span className="text-white text-xs font-semibold text-center leading-tight px-1">
                            {lang === 'RO' ? 'Schimbă\npoza' : 'Change\nphoto'}
                        </span>
                    </a>
                </div>
                <h1 className="text-2xl font-bold text-(--text-h)">
                    {profile.firstName} {profile.lastName}
                </h1>
                <p className="text-(--text-subtle) font-mono text-sm mb-4">@{profile.username}</p>

                <div className="w-full border-t border-(--accent)/20 my-2"></div>

                <div className="w-full flex flex-col gap-2 mt-2 text-sm text-(--text)">
                    <div className="flex justify-between items-center gap-4">
                        <span className="font-semibold text-(--text-muted)">Email</span>
                        <span className="truncate text-right">{profile.email}</span>
                    </div>
                    <div className="flex justify-between items-center gap-4">
                        <span className="font-semibold text-(--text-muted)">
                            {lang === 'RO' ? 'Membru din' : 'Joined'}
                        </span>
                        <span>
                            {new Date(profile.createdAt).toLocaleDateString(
                                lang === 'RO' ? 'ro-RO' : 'en-US',
                                {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                },
                            )}
                        </span>
                    </div>
                    <div className="flex justify-between items-center mt-2 gap-4">
                        <span className="font-semibold text-(--text-muted)">
                            {lang === 'RO' ? 'Rol' : 'Role'}
                        </span>
                        <span className="px-2 py-0.5 rounded-2xl text-[10px] font-bold uppercase border border-(--accent)/30 bg-(--accent)/10 text-(--text)">
                            {roleLabel}
                        </span>
                    </div>
                </div>
            </motion.div>

            <motion.div
                variants={itemVariants}
                className="p-6 rounded-2xl border border-(--accent)/50 bg-(--surface-muted) backdrop-blur-sm card-glow"
            >
                <h2 className="text-sm font-bold text-(--text-h) mb-4 uppercase tracking-wider">
                    {lang === 'RO' ? 'Statistici' : 'Community Stats'}
                </h2>
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between gap-4">
                        <span className="text-sm text-(--text-muted)">
                            {lang === 'RO' ? 'Total Submisii' : 'Total Submissions'}
                        </span>
                        <span className="font-bold text-(--text-h)">{profile.submissions}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                        <span className="text-sm text-(--text-muted)">
                            {lang === 'RO' ? 'Rată de Acceptare' : 'Acceptance Rate'}
                        </span>
                        <span className="font-bold text-(--text-h)">
                            {(profile.acceptanceRate <= 1 ? profile.acceptanceRate * 100 : profile.acceptanceRate).toFixed(1).replace(/\.0$/, '')}%
                        </span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                        <span className="text-sm text-(--text-muted)">
                            {lang === 'RO' ? 'Zile Consecutive' : 'Daily Streak'}
                        </span>
                        <span className="font-bold text-orange-400 flex items-center gap-2">
                            <span className="flex items-center gap-1">
                                {profile.streak}
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2c0 0-5 5-5 10a5 5 0 0010 0C17 7 12 2 12 2zm0 13a2 2 0 110-4 2 2 0 010 4z" /></svg>
                            </span>
                            {profile.streakCapped && (
                                <span className="rounded-full border border-orange-400/40 bg-orange-400/10 px-2 py-0.5 text-[10px] uppercase tracking-widest text-orange-200">
                                    {lang === 'RO' ? 'Limitat' : 'Capped'}
                                </span>
                            )}
                        </span>
                    </div>
                </div>
            </motion.div>

            <motion.div
                variants={itemVariants}
                className="p-6 rounded-2xl border border-(--accent)/50 bg-(--surface-muted) backdrop-blur-sm card-glow"
            >
                <div className="mb-6">
                    <h2 className="text-sm font-bold text-(--text-h) mb-3 uppercase tracking-wider">
                        {lang === 'RO' ? 'Limbaje' : 'Languages'}
                    </h2>
                    <div className="flex flex-wrap gap-2">
                        {profile.mostUsedLanguages.map((language) => (
                            <span
                                key={language}
                                className="px-3 py-1 rounded-full text-xs font-semibold border border-(--accent)/20 bg-(--accent)/5 text-(--text-h)"
                            >
                                {language}
                            </span>
                        ))}
                    </div>
                </div>

                <div>
                    <h2 className="text-sm font-bold text-(--text-h) mb-3 uppercase tracking-wider">
                        Skills
                    </h2>
                    <div className="flex flex-wrap gap-2">
                        {profile.skillBreakdownTags.map((skill) => (
                            <span
                                key={skill}
                                className="px-2.5 py-1 rounded-full text-xs font-semibold border border-(--accent)/30 bg-(--accent)/10 text-(--text) hover:bg-(--accent)/20 transition-colors cursor-pointer"
                            >
                                {skill}
                            </span>
                        ))}
                    </div>
                </div>
            </motion.div>
        </>
    );
}
