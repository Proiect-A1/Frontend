import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { containerVariants, itemVariants } from '../../../utils/motionConfig';
import { useLanguage } from '../../../language/Language';
import type { Announcement } from '../../../types/announcement';
import { unpackTranslation } from '../../../utils/translationPacker';
import type { AnnouncementFormState } from '../hooks/useAdminAnnouncements';

type Props = {
    announcements: Announcement[];
    announcementForm: AnnouncementFormState;
    setAnnouncementForm: (form: AnnouncementFormState) => void;
    editingAnnouncementId: string | null;
    setEditingAnnouncementId: (id: string | null) => void;
    handleEditStart: (a: Announcement) => void;
    selectedAnnouncementId: string | null;
    setSelectedAnnouncementId: (id: string | null) => void;
    isSavingAnnouncement: boolean;
    handleAnnouncementSubmit: (e: React.FormEvent) => void;
    handleDeleteAnnouncement: (id: string) => void;
};

export default function AnnouncementsTab({
    announcements, announcementForm, setAnnouncementForm, editingAnnouncementId,
    setEditingAnnouncementId, handleEditStart, selectedAnnouncementId, setSelectedAnnouncementId,
    isSavingAnnouncement, handleAnnouncementSubmit, handleDeleteAnnouncement
}: Props) {
    const { lang } = useLanguage();
    const [formLang, setFormLang] = useState<'ro' | 'en'>('ro');
    const [isTranslating, setIsTranslating] = useState(false);

    const handleTranslate = async () => {
        if (!announcementForm.titleRo && !announcementForm.contentRo) return;
        setIsTranslating(true);
        try {
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
                },
                body: JSON.stringify({
                    model: 'deepseek/deepseek-chat-v3-0324',
                    response_format: { type: 'json_object' },
                    messages: [
                        { 
                            role: 'system', 
                            content: 'Translate the following JSON object values from Romanian to English. Respond ONLY with a valid JSON object keeping the exact keys "title" and "content". Keep all markdown/formatting intact.' 
                        },
                        { 
                            role: 'user', 
                            content: JSON.stringify({ title: announcementForm.titleRo, content: announcementForm.contentRo }) 
                        }
                    ]
                })
            });
            const data = await response.json();
            if (data.choices && data.choices[0]) {
                const translated = JSON.parse(data.choices[0].message.content);
                setAnnouncementForm({
                    ...announcementForm,
                    titleEn: translated.title || announcementForm.titleEn,
                    contentEn: translated.content || announcementForm.contentEn
                });
                setFormLang('en');
            }
        } catch (e) {
            console.error('Translation failed', e);
        } finally {
            setIsTranslating(false);
        }
    };

    return (
        <motion.div variants={containerVariants} className="space-y-6">
            <motion.div variants={itemVariants} className="mb-6 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-(--text-h)">
                    {lang === 'RO' ? 'Anunțuri Platformă' : 'Platform Announcements'}
                </h2>
            </motion.div>
            
            <motion.form variants={itemVariants} onSubmit={handleAnnouncementSubmit} className="p-5 rounded-2xl border border-(--accent)/30 bg-(--surface-muted) space-y-4">
                <div className="flex justify-between items-center mb-2">
                    <div className="relative flex items-center bg-(--surface-input) border-2 border-(--accent)/50 rounded-full p-1 h-9.5 w-24 overflow-hidden whitespace-nowrap">
                        <div
                            className={`absolute top-1 bottom-1 w-10 bg-(--accent)/40 border border-(--accent)/60 rounded-full transition-all duration-300 ease-out ${
                                formLang === 'ro' ? 'left-1' : 'left-11.5'
                            }`}
                        />
                        <button
                            type="button"
                            onClick={() => setFormLang('ro')}
                            className={`relative z-10 flex-1 text-sm font-bold transition-colors duration-300 ${
                                formLang === 'ro' ? 'text-(--text-h)' : 'text-(--text-muted)'
                            }`}
                        >
                            RO
                        </button>
                        <button
                            type="button"
                            onClick={() => setFormLang('en')}
                            className={`relative z-10 flex-1 text-sm font-bold transition-colors duration-300 ${
                                formLang === 'en' ? 'text-(--text-h)' : 'text-(--text-muted)'
                            }`}
                        >
                            EN
                        </button>
                    </div>
                    <button type="button" disabled={isTranslating || (!announcementForm.titleRo && !announcementForm.contentRo)} onClick={handleTranslate} className="inline-flex items-center text-xs font-bold border border-(--accent) bg-(--accent)/10 text-(--accent) px-3 py-1.5 rounded-full hover:bg-(--accent)/20 transition-all disabled:opacity-50">
                        {isTranslating ? '...' : 'Translate to EN'}
                    </button>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-(--text-h) px-1 uppercase tracking-widest">
                        {lang === 'RO' ? 'Titlu Anunț' : 'Announcement Title'} ({formLang.toUpperCase()})
                    </label>
                    <input
                        type="text"
                        value={formLang === 'ro' ? announcementForm.titleRo : announcementForm.titleEn}
                        onChange={(e) => setAnnouncementForm({ ...announcementForm, [formLang === 'ro' ? 'titleRo' : 'titleEn']: e.target.value })}
                        placeholder={lang === 'RO' ? "Introdu titlul..." : "Enter title..."}
                        className="w-full bg-(--surface-card) border border-(--accent)/40 rounded-2xl px-4 py-3 text-(--text-h) outline-none focus:border-(--accent) transition-all"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-bold text-(--text-h) px-1 uppercase tracking-widest">
                        {lang === 'RO' ? 'Conținut' : 'Content'} ({formLang.toUpperCase()})
                    </label>
                    <textarea
                        value={formLang === 'ro' ? announcementForm.contentRo : announcementForm.contentEn}
                        onChange={(e) => setAnnouncementForm({ ...announcementForm, [formLang === 'ro' ? 'contentRo' : 'contentEn']: e.target.value })}
                        rows={4}
                        className="w-full bg-(--surface-card) border border-(--accent)/40 rounded-2xl px-4 py-3 text-(--text-h) outline-none focus:border-(--accent) transition-all resize-none"
                    />
                </div>
                <div className="flex justify-end gap-2">
                    {editingAnnouncementId && (
                        <button type="button" onClick={() => { setEditingAnnouncementId(null); setAnnouncementForm({ titleRo: '', titleEn: '', contentRo: '', contentEn: '' }); }} className="rounded-2xl border border-(--accent)/40 px-6 py-2 text-(--text-h) font-bold hover:bg-(--accent)/10 transition-all">
                            {lang === 'RO' ? 'Anulează' : 'Cancel'}
                        </button>
                    )}
                    <button type="submit" disabled={isSavingAnnouncement} className="rounded-2xl bg-transparent border border-(--accent)/40 px-8 py-2 text-(--text-h) font-bold hover:bg-(--accent)/10 disabled:opacity-50 transition-all">
                        {isSavingAnnouncement ? '...' : (lang === 'RO' ? 'Salvează Anunțul' : 'Save Announcement')}
                    </button>
                </div>
            </motion.form>

            <motion.div variants={containerVariants} className="space-y-3">
                {announcements.map((announcement) => {
                    const isExpanded = selectedAnnouncementId === announcement.id;
                    const displayTitle = unpackTranslation(announcement.title, lang);
                    const displayContent = unpackTranslation(announcement.content, lang);

                    return (
                        <motion.div variants={itemVariants} key={announcement.id} className="p-4 rounded-2xl border border-(--accent)/20 bg-(--surface-muted) overflow-hidden">
                            <div className="flex items-center justify-between gap-4">
                                <div className="min-w-0 cursor-pointer flex-1" onClick={() => setSelectedAnnouncementId(isExpanded ? null : announcement.id)}>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="text-lg font-bold text-(--text-h) truncate">{displayTitle}</h3>
                                        <span className="text-[10px] uppercase tracking-widest text-(--text-muted) font-bold">{announcement.createdAt}</span>
                                    </div>
                                    <p className={`text-sm text-(--text-muted) ${isExpanded ? '' : 'truncate'}`}>{displayContent}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => handleEditStart(announcement)} className="p-2 rounded-full hover:bg-(--accent)/20 text-(--accent) transition-all">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536M4 20l4-1 9-9 1-4-13 13z" /></svg>
                                    </button>
                                    <button onClick={() => handleDeleteAnnouncement(announcement.id)} className="p-2 rounded-full hover:bg-red-500/20 text-red-500 transition-all">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
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