import { motion } from 'framer-motion';
import { containerVariants, itemVariants } from '../../../utils/motionConfig';
import { useLanguage } from '../../../language/Language';
import type { TagResponseDTO } from '../../../services/tagService';

type Props = {
    tags: TagResponseDTO[];
    tagForm: { title: string };
    setTagForm: (form: { title: string }) => void;
    editingTag: TagResponseDTO | null;
    setEditingTag: (tag: TagResponseDTO | null) => void;
    isSavingTag: boolean;
    handleTagSubmit: (e: React.FormEvent) => void;
    handleDeleteTag: (tag: TagResponseDTO) => void;
};

export default function TagsTab({
    tags,
    tagForm,
    setTagForm,
    editingTag,
    setEditingTag,
    isSavingTag,
    handleTagSubmit,
    handleDeleteTag
}: Props) {
    const { lang } = useLanguage();

    return (
        <motion.div variants={containerVariants} className="space-y-6">
            <motion.div variants={itemVariants} className="mb-6">
                <h2 className="text-2xl font-bold text-(--text-h)">
                    {lang === 'RO' ? 'Gestionare Tag-uri' : 'Tag Management'}
                </h2>
            </motion.div>
            <motion.form
                variants={itemVariants}
                onSubmit={handleTagSubmit}
                className="p-5 rounded-3xl border-2 border-(--accent)/30 bg-(--surface-muted) space-y-4"
            >
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-(--text-h) px-1 uppercase tracking-widest">
                        {editingTag
                            ? (lang === 'RO' ? 'Editează Tag' : 'Edit Tag')
                            : (lang === 'RO' ? 'Adaugă Tag Nou' : 'Add New Tag')}
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={tagForm.title}
                            onChange={(e) => setTagForm({ title: e.target.value })}
                            placeholder={lang === 'RO' ? "Nume tag (ex: Grafuri)" : "Tag name (ex: Graphs)"}
                            className="flex-1 bg-(--surface-card) border border-(--accent)/40 rounded-2xl px-4 py-2 text-(--text-h) outline-none focus:border-(--accent) transition-all"
                        />
                        <button
                            type="submit"
                            disabled={isSavingTag}
                            className="rounded-2xl bg-(--accent) px-6 py-2 text-white font-bold hover:opacity-90 disabled:opacity-50 transition-all"
                        >
                            {isSavingTag ? '...' : (editingTag ? (lang === 'RO' ? 'Salvează' : 'Save') : (lang === 'RO' ? 'Adaugă' : 'Add'))}
                        </button>
                        {editingTag && (
                            <button
                                type="button"
                                onClick={() => { setEditingTag(null); setTagForm({ title: '' }); }}
                                className="rounded-2xl border border-(--accent)/40 px-4 py-2 text-(--text-h) font-bold hover:bg-(--accent)/10 transition-all"
                            >
                                {lang === 'RO' ? 'Anulează' : 'Cancel'}
                            </button>
                        )}
                    </div>
                </div>
            </motion.form>

            <motion.div
                variants={containerVariants}
                className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
            >
                {tags.map((tag) => (
                    <motion.div
                        variants={itemVariants}
                        key={tag.id}
                        className="p-4 rounded-2xl border border-(--accent)/20 bg-(--surface-muted) flex items-center justify-between group"
                    >
                        <span className="font-bold text-(--text-h) px-2">#{tag.title}</span>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => { setEditingTag(tag); setTagForm({ title: tag.title }); }}
                                className="p-2 rounded-full hover:bg-(--accent)/20 text-(--accent) transition-all"
                                title="Edit"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536M4 20l4-1 9-9 1-4-13 13z" />
                                </svg>
                            </button>
                            <button
                                onClick={() => handleDeleteTag(tag)}
                                className="p-2 rounded-full hover:bg-red-500/20 text-red-500 transition-all"
                                title="Delete"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </div>
                    </motion.div>
                ))}
            </motion.div>
        </motion.div>
    );
}
