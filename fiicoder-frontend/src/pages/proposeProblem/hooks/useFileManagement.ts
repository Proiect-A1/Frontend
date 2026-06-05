import { useState, useCallback, useRef } from 'react';
import type { ProblemFile, FileCategory } from '../types/proposeProblem';

function detectLanguage(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();
    const map: Record<string, string> = {
        cpp: 'cpp',
        c: 'c',
        h: 'cpp',
        hpp: 'cpp',
        py: 'python',
        java: 'java',
        js: 'javascript',
        ts: 'typescript',
        txt: 'plaintext',
    };
    return map[ext || ''] || 'plaintext';
}

interface UseFileManagementProps {
    files: ProblemFile[];
    onFilesChange: (files: ProblemFile[]) => void;
    activeCategory: FileCategory;
}

export function useFileManagement({ files, onFilesChange, activeCategory }: UseFileManagementProps) {
    const [editingFileId, setEditingFileId] = useState<string | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const addFile = useCallback(
        (file: File) => {
            const reader = new FileReader();
            reader.onload = (ev) => {
                const content = ev.target?.result as string;
                const newFile: ProblemFile = {
                    id: `file_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
                    name: file.name,
                    size: file.size,
                    category: activeCategory,
                    content,
                    language: detectLanguage(file.name),
                };
                onFilesChange([...files, newFile]);
            };
            reader.readAsText(file);
        },
        [files, onFilesChange, activeCategory],
    );

    const removeFile = useCallback(
        (fileId: string) => {
            if (editingFileId === fileId) setEditingFileId(null);
            onFilesChange(files.filter((f) => f.id !== fileId));
        },
        [files, onFilesChange, editingFileId],
    );

    const updateFileContent = useCallback(
        (fileId: string, content: string) => {
            onFilesChange(files.map((f) => (f.id === fileId ? { ...f, content } : f)));
        },
        [files, onFilesChange],
    );

    const createNewFile = useCallback(
        (filename: string) => {
            const ext = filename.split('.').pop()?.toLowerCase();
            let content = '';
            if (ext === 'cpp' || ext === 'c') {
                content = '#include <iostream>\n\nusing namespace std;\n\nint main() {\n    \n    return 0;\n}\n';
            }
            
            const newFile: ProblemFile = {
                id: `file_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
                name: filename,
                size: content.length,
                category: activeCategory,
                content,
                language: detectLanguage(filename),
            };
            
            onFilesChange([...files, newFile]);
            setEditingFileId(newFile.id);
        },
        [files, onFilesChange, activeCategory],
    );

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
        else if (e.type === 'dragleave') setDragActive(false);
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setDragActive(false);
            if (e.dataTransfer.files) Array.from(e.dataTransfer.files).forEach(addFile);
        },
        [addFile],
    );

    const handleFileInput = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            if (e.currentTarget.files) Array.from(e.currentTarget.files).forEach(addFile);
            e.target.value = '';
        },
        [addFile],
    );

    return {
        editingFileId,
        setEditingFileId,
        dragActive,
        fileInputRef,
        removeFile,
        updateFileContent,
        createNewFile,
        handleDrag,
        handleDrop,
        handleFileInput,
    };
}

