import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { tagService, type TagResponseDTO } from '../../services/tagService';
import { hoverTransition } from '../../utils/motionConfig';

interface TagsAutocompleteProps {
    selectedTags: string[];
    onTagsChange: (tags: string[]) => void;
}

export default function TagsAutocomplete({ selectedTags, onTagsChange }: TagsAutocompleteProps) {
    const [availableTags, setAvailableTags] = useState<TagResponseDTO[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [suggestions, setSuggestions] = useState<TagResponseDTO[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const inputRef = useRef<HTMLInputElement>(null);
    const suggestionsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        tagService.getAllTags().then(setAvailableTags).catch(console.error);
    }, []);

    useEffect(() => {
        if (inputValue.trim()) {
            const filtered = availableTags.filter(
                (tag) =>
                    tag.title.toLowerCase().includes(inputValue.toLowerCase()) &&
                    !selectedTags.includes(tag.title),
            );
            setSuggestions(filtered.slice(0, 5));
            setShowSuggestions(filtered.length > 0);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
        setSelectedIndex(-1);
    }, [inputValue, availableTags, selectedTags]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                suggestionsRef.current &&
                !suggestionsRef.current.contains(e.target as Node) &&
                !inputRef.current?.contains(e.target as Node)
            ) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const addTag = (tag: string) => {
        const trimmedTag = tag.trim();
        const tagExists = availableTags.some(
            (t) => t.title.toLowerCase() === trimmedTag.toLowerCase(),
        );
        if (trimmedTag && tagExists && !selectedTags.includes(trimmedTag)) {
            onTagsChange([...selectedTags, trimmedTag]);
        }
        setInputValue('');
        setShowSuggestions(false);
        inputRef.current?.focus();
    };

    const removeTag = (tagToRemove: string) => {
        onTagsChange(selectedTags.filter((t) => t !== tagToRemove));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (selectedIndex >= 0 && suggestions[selectedIndex]) {
                addTag(suggestions[selectedIndex].title);
            }
        } else if (e.key === 'Escape') {
            setShowSuggestions(false);
        } else if (e.key === 'Backspace' && !inputValue && selectedTags.length > 0) {
            removeTag(selectedTags[selectedTags.length - 1]);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
    };

    const handleInputFocus = () => {
        if (inputValue.trim() && suggestions.length > 0) {
            setShowSuggestions(true);
        }
    };

    return (
        <div className="space-y-2">
            <label className="text-(--text) font-semibold text-sm">Etichete</label>
            <div className="relative">
                <div className="flex flex-wrap gap-1.5 pb-1 mb-1">
                    {selectedTags.map((tag) => (
                        <span
                            key={tag}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-(--accent)/20 text-(--text-h)"
                        >
                            {tag}
                            <button
                                type="button"
                                onClick={() => removeTag(tag)}
                                className="hover:text-red-400 transition-colors"
                            >
                                ✕
                            </button>
                        </span>
                    ))}
                </div>
                <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onFocus={handleInputFocus}
                    placeholder={
                        selectedTags.length === 0 ? 'Scrie pentru a căuta etichete...' : ''
                    }
                    className="w-full rounded-2xl border border-(--accent)/25 bg-(--surface-input) px-3 py-2 text-sm text-(--text) placeholder:text-(--text-muted) outline-none transition hover:border-(--accent)"
                />

                <AnimatePresence>
                    {showSuggestions && (
                        <motion.div
                            ref={suggestionsRef}
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.12 }}
                            className="absolute z-50 mt-1 w-full bg-(--surface-dropdown) border border-(--accent)/25 rounded-2xl overflow-hidden max-h-48 overflow-y-auto"
                        >
                            {suggestions.map((tag, index) => (
                                <motion.button
                                    key={tag.id}
                                    type="button"
                                    onClick={() => addTag(tag.title)}
                                    whileHover={{ scale: 1.01, transition: hoverTransition }}
                                    className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                                        index === selectedIndex
                                            ? 'bg-(--accent)/30 text-(--text-h)'
                                            : 'text-(--text) hover:bg-(--accent)/20'
                                    }`}
                                >
                                    {tag.title}
                                </motion.button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            <p className="text-xs text-(--text-muted)">
                Selectează din lista de etichete existente.
            </p>
        </div>
    );
}
