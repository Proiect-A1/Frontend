import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { tagService, type TagResponseDTO } from '../../../services/tagService';
import { toast } from 'sonner';
import { useLanguage, translations, getDeleteTagConfirm } from '../../../language/Language';
import { extractErrorMessage } from '../utils/errorUtils';

export function useAdminTags(isAdmin: boolean, activeTab: string) {
    const { lang } = useLanguage();
    const t = translations[lang];
    const queryClient = useQueryClient();

    const [tagForm, setTagForm] = useState({ title: '' });
    const [editingTag, setEditingTag] = useState<TagResponseDTO | null>(null);
    const [isSavingTag, setIsSavingTag] = useState(false);

    const [tagSearch, setTagSearch] = useState('');
    const [tagSearchResult, setTagSearchResult] = useState<TagResponseDTO | null | 'not_found'>(null);
    const [isSearchingTag, setIsSearchingTag] = useState(false);

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
            toast.success(t.adminTagSaved);
            await queryClient.invalidateQueries({ queryKey: ['admin', 'tags'] });
        } catch (err) {
            toast.error(extractErrorMessage(err, t.adminTagSaveError));
        } finally {
            setIsSavingTag(false);
        }
    };

    const handleDeleteTag = async (tag: TagResponseDTO) => {
        const confirmMsg = getDeleteTagConfirm(lang, tag.title);
        if (!window.confirm(confirmMsg)) return;

        try {
            await tagService.deleteTag(tag.title);
            queryClient.setQueryData<TagResponseDTO[]>(['admin', 'tags'], prev => prev?.filter(t => t.id !== tag.id) ?? []);
            toast.success(t.adminTagDeleted);
            await queryClient.invalidateQueries({ queryKey: ['admin', 'tags'] });
        } catch (err) {
            toast.error(extractErrorMessage(err, t.adminTagDeleteError));
        }
    };

    const handleTagSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        const query = tagSearch.trim();
        if (!query) {
            setTagSearchResult(null);
            return;
        }
        setIsSearchingTag(true);
        try {
            const result = await tagService.getTagByTitle(query);
            setTagSearchResult(result);
        } catch {
            setTagSearchResult('not_found');
        } finally {
            setIsSearchingTag(false);
        }
    };

    const clearTagSearch = () => {
        setTagSearch('');
        setTagSearchResult(null);
    };

    const allTags = tagsQuery.data ?? [];
    const displayedTags =
        tagSearchResult === 'not_found'
            ? []
            : tagSearchResult
            ? [tagSearchResult]
            : tagSearch
            ? allTags.filter(t => t.title.toLowerCase().includes(tagSearch.toLowerCase()))
            : allTags;

    return {
        tags: displayedTags,
        isLoading: tagsQuery.isLoading,
        tagForm,
        setTagForm,
        editingTag,
        setEditingTag,
        isSavingTag,
        handleTagSubmit,
        handleDeleteTag,
        tagSearch,
        setTagSearch,
        tagSearchResult,
        isSearchingTag,
        handleTagSearch,
        clearTagSearch,
    };
}
