import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { tagService, type TagResponseDTO } from '../../../services/tagService';
import { toast } from 'sonner';
import { useLanguage } from '../../../language/Language';
import { extractErrorMessage } from '../utils/errorUtils';

export function useAdminTags(isAdmin: boolean, activeTab: string) {
    const { lang } = useLanguage();
    const queryClient = useQueryClient();
    
    const [tagForm, setTagForm] = useState({ title: '' });
    const [editingTag, setEditingTag] = useState<TagResponseDTO | null>(null);
    const [isSavingTag, setIsSavingTag] = useState(false);

    const tagsQuery = useQuery({
        queryKey: ['admin', 'tags'],
        enabled: isAdmin && activeTab === 'tags',
        queryFn: () => tagService.getAllTags(),
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    const handleTagSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!tagForm.title.trim()) return;

        setIsSavingTag(true);
        try {
            if (editingTag) {
                const updated = await tagService.updateTag(editingTag.title, tagForm.title);
                queryClient.setQueryData<TagResponseDTO[]>(['admin', 'tags'], prev => prev?.map(t => t.id === updated.id ? updated : t) ?? []);
                setEditingTag(null);
            } else {
                const created = await tagService.createTag(tagForm.title);
                queryClient.setQueryData<TagResponseDTO[]>(['admin', 'tags'], prev => [...(prev ?? []), created]);
            }
            setTagForm({ title: '' });
            toast.success(lang === 'RO' ? 'Tag salvat.' : 'Tag saved.');
            await queryClient.invalidateQueries({ queryKey: ['admin', 'tags'] });
        } catch (err) {
            toast.error(extractErrorMessage(err, lang === 'RO' ? 'Eroare la salvarea tag-ului.' : 'Failed to save tag.'));
        } finally {
            setIsSavingTag(false);
        }
    };

    const handleDeleteTag = async (tag: TagResponseDTO) => {
        const confirmMsg = lang === 'RO' ? `Sigur vrei să ștergi tag-ul "${tag.title}"?` : `Delete tag "${tag.title}"?`;
        if (!window.confirm(confirmMsg)) return;

        try {
            await tagService.deleteTag(tag.title);
            queryClient.setQueryData<TagResponseDTO[]>(['admin', 'tags'], prev => prev?.filter(t => t.id !== tag.id) ?? []);
            toast.success(lang === 'RO' ? 'Tag șters.' : 'Tag deleted.');
            await queryClient.invalidateQueries({ queryKey: ['admin', 'tags'] });
        } catch (err) {
            toast.error(extractErrorMessage(err, lang === 'RO' ? "Eroare la ștergere (posibil tag-ul e folosit deja)." : "Error deleting tag (it might be in use)."));
        }
    };

    return {
        tags: tagsQuery.data ?? [],
        isLoading: tagsQuery.isLoading,
        tagForm,
        setTagForm,
        editingTag,
        setEditingTag,
        isSavingTag,
        handleTagSubmit,
        handleDeleteTag
    };
}
