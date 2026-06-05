import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../services/adminService';
import type { Announcement } from '../../../types/announcement';
import { toast } from 'sonner';
import { useLanguage, translations } from '../../../language/Language';
import { extractErrorMessage } from '../utils/errorUtils';
import { packTranslation, getTranslationParts } from '../../../utils/translationPacker';

export type AnnouncementFormState = {
    titleRo: string; titleEn: string; contentRo: string; contentEn: string;
};

export function useAdminAnnouncements(isAdmin: boolean, activeTab: string) {
    const { lang } = useLanguage();
    const t = translations[lang];
    const queryClient = useQueryClient();

    const [editingAnnouncementId, setEditingAnnouncementId] = useState<string | null>(null);
    const [selectedAnnouncementId, setSelectedAnnouncementId] = useState<string | null>(null);
    
    const [announcementForm, setAnnouncementForm] = useState<AnnouncementFormState>({ 
        titleRo: '', titleEn: '', contentRo: '', contentEn: '' 
    });
    const [isSavingAnnouncement, setIsSavingAnnouncement] = useState(false);

    const announcementsQuery = useQuery({
        queryKey: ['admin', 'announcements'],
        enabled: isAdmin && activeTab === 'announcements',
        queryFn: () => adminService.getAnnouncements(),
        staleTime: 1000 * 60 * 5,
    });

    const handleEditStart = (announcement: Announcement) => {
        setEditingAnnouncementId(announcement.id);
        const titleParts = getTranslationParts(announcement.title);
        const contentParts = getTranslationParts(announcement.content);
        setAnnouncementForm({
            titleRo: titleParts.ro, titleEn: titleParts.en,
            contentRo: contentParts.ro, contentEn: contentParts.en
        });
    };

    const handleAnnouncementSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!announcementForm.titleRo.trim() || !announcementForm.contentRo.trim()) return;

        setIsSavingAnnouncement(true);
        const payload = {
            title: packTranslation(announcementForm.titleRo, announcementForm.titleEn),
            content: packTranslation(announcementForm.contentRo, announcementForm.contentEn)
        };

        try {
            if (editingAnnouncementId) {
                const updated = await adminService.updateAnnouncement(editingAnnouncementId, payload);
                queryClient.setQueryData<Announcement[]>(['admin', 'announcements'], (prev) =>
                    prev?.map((a) => a.id === editingAnnouncementId ? updated : a) ?? []
                );
            } else {
                const created = await adminService.createAnnouncement(payload);
                queryClient.setQueryData<Announcement[]>(['admin', 'announcements'], (prev) => [created, ...(prev ?? [])]);
            }
            setAnnouncementForm({ titleRo: '', titleEn: '', contentRo: '', contentEn: '' });
            setEditingAnnouncementId(null);
            toast.success(t.adminAnnouncementSaved);
            await queryClient.invalidateQueries({ queryKey: ['admin', 'announcements'] });
        } finally {
            setIsSavingAnnouncement(false);
        }
    };

    const handleDeleteAnnouncement = async (announcementId: string) => {
        try {
            await adminService.deleteAnnouncement(announcementId);
            queryClient.setQueryData<Announcement[]>(['admin', 'announcements'], (prev) =>
                prev?.filter((a) => a.id !== announcementId) ?? []
            );
            toast.success(t.adminAnnouncementDeleted);
            await queryClient.invalidateQueries({ queryKey: ['admin', 'announcements'] });
        } catch (error) {
            toast.error(extractErrorMessage(error, 'Error'));
        }
    };

    return {
        announcements: announcementsQuery.data ?? [],
        isLoading: announcementsQuery.isLoading,
        announcementForm,
        setAnnouncementForm,
        editingAnnouncementId,
        setEditingAnnouncementId,
        handleEditStart,
        selectedAnnouncementId,
        setSelectedAnnouncementId,
        isSavingAnnouncement,
        handleAnnouncementSubmit,
        handleDeleteAnnouncement
    };
}