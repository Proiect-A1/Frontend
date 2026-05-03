import { Controller, useFormContext } from 'react-hook-form';
import { useState } from 'react';
import { motion } from 'framer-motion';
import type { ProposeProblemForm } from '../../types/proposeProblem';
import { itemVariants, staggerConfig } from '../../utils/motionConfig';

export default function AttachmentsTab() {
    const { control, watch } = useFormContext<ProposeProblemForm>();
    const attachments = watch('attachments') || [];
    const [dragActive, setDragActive] = useState(false);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent, onChange: any) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            Array.from(files).forEach((file) => {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const newAttachment = {
                        id: `file_${Date.now()}_${Math.random()}`,
                        name: file.name,
                        size: file.size,
                        type: file.type,
                        content: event.target?.result as string,
                    };
                    onChange([...attachments, newAttachment]);
                };
                reader.readAsDataURL(file);
            });
        }
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>, onChange: any) => {
        const files = e.currentTarget.files;
        if (files && files.length > 0) {
            Array.from(files).forEach((file) => {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const newAttachment = {
                        id: `file_${Date.now()}_${Math.random()}`,
                        name: file.name,
                        size: file.size,
                        type: file.type,
                        content: event.target?.result as string,
                    };
                    onChange([...attachments, newAttachment]);
                };
                reader.readAsDataURL(file);
            });
        }
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: staggerConfig } }}
            className="space-y-6"
        >
            {/* Info */}
            <motion.div
                variants={itemVariants}
                className="p-4 bg-(--surface-muted) rounded-xl border border-(--accent)/25"
            >
                <p className="text-sm text-(--text)">
                    <strong>Instrucțiuni:</strong> Atașează fișiere suport (imagini, date, etc.).
                    Dimensiune maximă: 10MB per fișier.
                </p>
            </motion.div>

            {/* File Upload Area */}
            <Controller
                name="attachments"
                control={control}
                render={({ field }) => (
                    <div className="space-y-4">
                        {/* Drag & Drop Zone */}
                        <div
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={(e) => handleDrop(e, field.onChange)}
                            className={`relative p-8 border-2 border-dashed rounded-xl transition-colors ${
                                dragActive
                                    ? 'border-(--accent) bg-(--accent)/20'
                                    : 'border-(--accent)/50 hover:border-(--accent)'
                            }`}
                        >
                            <input
                                type="file"
                                multiple
                                onChange={(e) => handleFileInput(e, field.onChange)}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <div className="flex flex-col items-center justify-center text-center">
                                <span className="text-4xl mb-2">📤</span>
                                <p className="text-(--text) font-semibold">
                                    Trage fișierele aici sau fă clic pentru a selecta
                                </p>
                                <p className="text-xs text-(--text-muted) mt-1">
                                    PNG, JPG, PDF, TXT și alte formate suportate
                                </p>
                            </div>
                        </div>

                        {/* Uploaded Files List */}
                        {attachments.length > 0 && (
                            <motion.div variants={itemVariants} className="space-y-2">
                                <h3 className="text-sm font-semibold text-(--text)">
                                    Fișiere Atașate ({attachments.length})
                                </h3>
                                <div className="space-y-2">
                                    {attachments.map((file: any, index) => (
                                        <div
                                            key={file.id || index}
                                            className="flex items-center justify-between p-3 bg-(--surface-muted) border border-(--accent)/25 rounded-xl hover:bg-(--surface-muted)/70 transition-colors"
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <span className="text-lg shrink-0">📄</span>
                                                <div className="min-w-0">
                                                    <p className="text-sm text-(--text) truncate font-mono">
                                                        {file.name}
                                                    </p>
                                                    <p className="text-xs text-(--text-muted)">
                                                        {formatFileSize(file.size)}
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const updated = attachments.filter(
                                                        (_, i) => i !== index,
                                                    );
                                                    field.onChange(updated);
                                                }}
                                                className="p-2 text-red-400 hover:bg-red-500/20 rounded transition-colors shrink-0"
                                                title="Șterge fișier"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* Stats */}
                        <motion.div
                            variants={itemVariants}
                            className="p-4 bg-(--surface-muted) rounded-xl border border-(--accent)/25"
                        >
                            <p className="text-sm text-(--text)">
                                <strong>Total fișiere:</strong> {attachments.length}
                            </p>
                            <p className="text-sm text-(--text-muted) mt-1">
                                <strong>Dimensiune totală:</strong>{' '}
                                {formatFileSize(
                                    attachments.reduce((sum, f) => sum + (f.size || 0), 0),
                                )}
                            </p>
                        </motion.div>

                        {/* Usage Examples */}
                        <motion.div
                            variants={itemVariants}
                            className="p-4 bg-(--surface-muted) rounded-xl border border-(--accent)/25 space-y-2"
                        >
                            <h4 className="font-semibold text-(--text)">Cazuri de Utilizare:</h4>
                            <ul className="text-xs text-(--text-muted) space-y-1 list-disc list-inside">
                                <li>Imagine cu diagramă pentru enunț (PNG/JPG)</li>
                                <li>Fișiere de suport sau biblioteci necesare (ZIP)</li>
                                <li>Note suplimentare (TXT/PDF)</li>
                                <li>Date de test în formă preformatată (TXT)</li>
                            </ul>
                        </motion.div>
                    </div>
                )}
            />
        </motion.div>
    );
}
