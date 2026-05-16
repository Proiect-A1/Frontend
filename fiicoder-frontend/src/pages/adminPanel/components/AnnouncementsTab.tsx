import React from 'react';
import { motion } from 'framer-motion';
import { containerVariants, itemVariants } from '../../../utils/motionConfig';
import { useLanguage } from '../../../language/Language';
import type { Announcement } from '../../../types/announcement';

type Props = {
    announcements: Announcement[];
    announcementForm: { title: string; content: string };
    setAnnouncementForm: (form: { title: string; content: string }) => void;
    editingAnnouncementId: string | null;
    setEditingAnnouncementId: (id: string | null) => void;
    selectedAnnouncementId: string | null;
    setSelectedAnnouncementId: (id: string | null) => void;
    isSavingAnnouncement: boolean;
    handleAnnouncementSubmit: (e: React.FormEvent) => void;
    handleDeleteAnnouncement: (id: string) => void;
};

export default function AnnouncementsTab({
    announcements,
    announcementForm,
    setAnnouncementForm,
    editingAnnouncementId,
    setEditingAnnouncementId,
    selectedAnnouncementId,
    setSelectedAnnouncementId,
    isSavingAnnouncement,
    handleAnnouncementSubmit,
    handleDeleteAnnouncement
}: Props) {
    const { lang } = useLanguage();

    return (
        <motion.div variants={containerVariants} className="space-y-6">
            <motion.div variants={itemVariants} className="mb-6">
                <h2 className="text-2xl font-bold text-(--text-h)">
                    {lang === 'RO' ? 'Anunțuri Platformă' : 'Platform Announcements'}
                </h2>
            </motion.div>
            <motion.form
                variants={itemVariants}
                onSubmit={handleAnnouncementSubmit}
                className="p-5 rounded-3xl border-2 border-(--accent)/30 bg-(--surface-muted) space-y-4"
            >
                <div className="space-y-2">
                    <label className="text-sm font-bold text-(--text-h) px-1 uppercase tracking-widest">
                        {lang === 'RO' ? 'Titlu Anunț' : 'Announcement Title'}
                    </label>
                    <input
                        type="text"
                        value={announcementForm.title}
                        onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                        placeholder={lang === 'RO' ? "Introdu titlul..." : "Enter title..."}
                        className="w-full bg-(--surface-card) border border-(--accent)/40 rounded-2xl px-4 py-3 text-(--text-h) outline-none focus:border-(--accent) transition-all"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-bold text-(--text-h) px-1 uppercase tracking-widest">
                        {lang === 'RO' ? 'Conținut' : 'Content'}
                    </label>
                    <textarea
                        value={announcementForm.content}
                        onChange={(e) => setAnnouncementForm({ ...announcementForm, content: e.target.value })}
                        rows={4}
                        placeholder={lang === 'RO' ? "Scrie conținutul aici..." : "Write content here..."}
                        className="w-full bg-(--surface-card) border border-(--accent)/40 rounded-2xl px-4 py-3 text-(--text-h) outline-none focus:border-(--accent) transition-all resize-none"
                    />
                </div>
                <div className="flex justify-end gap-2">
                    {editingAnnouncementId && (
                        <button
                            type="button"
                            onClick={() => { setEditingAnnouncementId(null); setAnnouncementForm({ title: '', content: '' }); }}
                            className="rounded-2xl border border-(--accent)/40 px-6 py-2 text-(--text-h) font-bold hover:bg-(--accent)/10 transition-all"
                        >
                            {lang === 'RO' ? 'Anulează' : 'Cancel'}
                        </button>
                    )}
                    <button
                        type="submit"
                        disabled={isSavingAnnouncement}
                        className="rounded-2xl bg-(--accent) px-8 py-2 text-white font-bold hover:opacity-90 disabled:opacity-50 transition-all"
                    >
                        {isSavingAnnouncement ? '...' : (lang === 'RO' ? 'Salvează Anunțul' : 'Save Announcement')}
                    </button>
                </div>
            </motion.form>

            <motion.div variants={containerVariants} className="space-y-3">
                {announcements.map((announcement) => {
                    const isExpanded = selectedAnnouncementId === announcement.id;
                    return (
                        <motion.div
                            variants={itemVariants}
                            key={announcement.id}
                            className="p-4 rounded-2xl border border-(--accent)/20 bg-(--surface-muted) overflow-hidden"
                        >
                            <div className="flex items-center justify-between gap-4">
                                <div className="min-w-0 cursor-pointer flex-1" onClick={() => setSelectedAnnouncementId(isExpanded ? null : announcement.id)}>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="text-lg font-bold text-(--text-h) truncate">{announcement.title}</h3>
                                        <span className="text-[10px] uppercase tracking-widest text-(--text-muted) font-bold">
                                            {announcement.createdAt}
                                        </span>
                                    </div>
                                    <p className={`text-sm text-(--text-muted) ${isExpanded ? '' : 'truncate'}`}>
                                        {announcement.content}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => { setEditingAnnouncementId(announcement.id); setAnnouncementForm({ title: announcement.title, content: announcement.content }); }}
                                        className="p-2 rounded-full hover:bg-(--accent)/20 text-(--accent) transition-all"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536M4 20l4-1 9-9 1-4-13 13z" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => handleDeleteAnnouncement(announcement.id)}
                                        className="p-2 rounded-full hover:bg-red-500/20 text-red-500 transition-all"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </motion.div>
        </motion.div>
    );
}
