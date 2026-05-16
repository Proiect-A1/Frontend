import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../services/adminService';
import type { Announcement } from '../../../types/announcement';
import { toast } from 'sonner';
import { useLanguage } from '../../../language/Language';

export function useAdminAnnouncements(isAdmin: boolean, activeTab: string) {
    const { lang } = useLanguage();
    const queryClient = useQueryClient();
    
    const [editingAnnouncementId, setEditingAnnouncementId] = useState<string | null>(null);
    const [selectedAnnouncementId, setSelectedAnnouncementId] = useState<string | null>(null);
    const [announcementForm, setAnnouncementForm] = useState({ title: '', content: '' });
    const [isSavingAnnouncement, setIsSavingAnnouncement] = useState(false);

    const announcementsQuery = useQuery({
        queryKey: ['admin', 'announcements'],
        enabled: isAdmin && activeTab === 'announcements',
        queryFn: () => adminService.getAnnouncements(),
    });

    const handleAnnouncementSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!announcementForm.title.trim() || !announcementForm.content.trim()) return;

        setIsSavingAnnouncement(true);
        try {
            if (editingAnnouncementId) {
                const updated = await adminService.updateAnnouncement(editingAnnouncementId, announcementForm);
                queryClient.setQueryData<Announcement[]>(['admin', 'announcements'], (prev) =>
                    prev?.map((a) => a.id === editingAnnouncementId ? updated : a) ?? []
                );
            } else {
                const created = await adminService.createAnnouncement(announcementForm);
                queryClient.setQueryData<Announcement[]>(['admin', 'announcements'], (prev) => [created, ...(prev ?? [])]);
            }
            setAnnouncementForm({ title: '', content: '' });
            setEditingAnnouncementId(null);
            toast.success(lang === 'RO' ? 'Anunț salvat.' : 'Announcement saved.');
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
            toast.success(lang === 'RO' ? 'Anunț șters.' : 'Announcement deleted.');
            await queryClient.invalidateQueries({ queryKey: ['admin', 'announcements'] });
        } catch (error) {
            toast.error('Error');
        }
    };

    return {
        announcements: announcementsQuery.data ?? [],
        isLoading: announcementsQuery.isLoading,
        announcementForm,
        setAnnouncementForm,
        editingAnnouncementId,
        setEditingAnnouncementId,
        selectedAnnouncementId,
        setSelectedAnnouncementId,
        isSavingAnnouncement,
        handleAnnouncementSubmit,
        handleDeleteAnnouncement
    };
}
