import { Controller, useFormContext } from 'react-hook-form';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ProposeProblemForm } from '../../types/proposeProblem';
import { itemVariants, staggerConfig } from '../../utils/motionConfig';

export default function AccessTab() {
    const { control, watch, setValue } = useFormContext<ProposeProblemForm>();
    const visibility = watch('visibility');
    const [isOpen, setIsOpen] = useState(false);

    const options = [
        { value: 'private', label: '🔒 Privată - Doar tu și moderatorii' },
        { value: 'unlisted', label: '🔗 Ascunsă - Link pentru oameni selectați' },
        { value: 'public', label: '🌍 Publică - Vizibilă pentru toți' },
    ] as const;

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
                className="p-4 bg-theme-surface-secondary rounded-xl border border-(--accent)/20"
            >
                <p className="text-sm text-theme-text">
                    <strong>Instrucțiuni:</strong> Alege cine poate vedea și accesa propunerea ta.
                </p>
            </motion.div>

            {/* Visibility (custom dropdown) */}
            <motion.div variants={itemVariants} className="space-y-2">
                <label className="text-theme-text font-semibold text-sm">Vizibilitate</label>
                <div className="relative">
                    <button
                        type="button"
                        onClick={() => setIsOpen(!isOpen)}
                        className="w-full flex items-center justify-between rounded-xl border border-(--accent)/30 theme-surface-input px-3 py-2 text-sm text-(--text) outline-none transition hover:border-(--accent)"
                    >
                        <span>{options.find((o) => o.value === visibility)?.label}</span>
                        <motion.span animate={{ rotate: isOpen ? 180 : 0 }}>
                          ▼
                        </motion.span>
                    </button>

                    <AnimatePresence>
                        {isOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: -6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -6 }}
                                transition={{ duration: 0.12 }}
                                className="absolute z-50 left-0 top-full mt-2 w-full theme-surface-dropdown border border-(--accent)/30 rounded-xl shadow-2xl overflow-hidden"
                            >
                                {options.map((opt) => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => {
                                            setValue('visibility', opt.value);
                                            setIsOpen(false);
                                        }}
                                        className={`w-full text-left px-4 py-2 text-sm hover:bg-(--accent)/20 transition-colors`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <p className="text-xs text-theme-text-muted">
                    {visibility === 'private' &&
                        'Propunerea ta este privată. Va fi vizibilă doar pentru moderatori și pentru tine.'}
                    {visibility === 'unlisted' &&
                        'Propunerea ta este ascunsă. Poți partaja linkul cu oameni specifici.'}
                    {visibility === 'public' &&
                        'Propunerea ta va fi vizibilă pentru toți. Va apărea în lista propunerilor publice.'}
                </p>
            </motion.div>

            {/* Allowed Users */}
            {visibility === 'unlisted' && (
                <motion.div variants={itemVariants} className="space-y-2">
                    <label className="text-theme-text font-semibold text-sm">
                        Utilizatori Permisi (opțional)
                    </label>
                    <Controller
                        name="allowedUsers"
                        control={control}
                        render={({ field }) => (
                            <div className="space-y-2">
                                <input
                                    type="text"
                                    placeholder="Introdu usernames separate prin virgulă"
                                    className="w-full px-4 py-2 bg-theme-surface-secondary border border-(--accent)/30 rounded-xl text-theme-text placeholder-theme-text-muted focus:outline-none transition-all"
                                    onChange={(e) => {
                                        const usernames = e.target.value
                                            .split(',')
                                            .map((u) => u.trim());
                                        field.onChange(usernames.filter((u) => u.length > 0));
                                    }}
                                    value={field.value?.join(', ') || ''}
                                />
                                <p className="text-xs text-theme-text-muted">
                                    Lasă gol pentru a permite accesul pentru oricine cu linkul.
                                </p>
                            </div>
                        )}
                    />
                </motion.div>
            )}

            {/* Allowed Groups */}
            {visibility === 'unlisted' && (
                <motion.div variants={itemVariants} className="space-y-2">
                    <label className="text-theme-text font-semibold text-sm">
                        Clase/Grupuri Permise (opțional)
                    </label>
                    <Controller
                        name="allowedGroups"
                        control={control}
                        render={({ field }) => (
                            <div className="space-y-2">
                                <input
                                    type="text"
                                    placeholder="Introdu ID-uri de clase separate prin virgulă"
                                    className="w-full px-4 py-2 bg-theme-surface-secondary border border-(--accent)/30 rounded-xl text-theme-text placeholder-theme-text-muted focus:outline-none transition-all"
                                    onChange={(e) => {
                                        const groupIds = e.target.value
                                            .split(',')
                                            .map((g) => g.trim());
                                        field.onChange(groupIds.filter((g) => g.length > 0));
                                    }}
                                    value={field.value?.join(', ') || ''}
                                />
                                <p className="text-xs text-theme-text-muted">
                                    Specifică clasele care pot accesa această propunere.
                                </p>
                            </div>
                        )}
                    />
                </motion.div>
            )}

            {/* Preview */}
            <motion.div
                variants={itemVariants}
                className="p-4 bg-theme-surface-secondary rounded-xl border border-(--accent)/30 space-y-3"
            >
                <h3 className="font-semibold text-theme-text">Rezumat Acces:</h3>
                <div className="space-y-2 text-sm text-theme-text-muted">
                    <p>
                        <strong>Vizibilitate:</strong>{' '}
                        {visibility === 'private'
                            ? '🔒 Privată'
                            : visibility === 'unlisted'
                              ? '🔗 Ascunsă'
                              : '🌍 Publică'}
                    </p>
                    {visibility === 'unlisted' && (
                        <>
                            {watch('allowedUsers')?.length ? (
                                <p>
                                    <strong>Utilizatori permisi:</strong>{' '}
                                    {watch('allowedUsers')?.join(', ')}
                                </p>
                            ) : (
                                <p className="italic text-theme-text-muted">
                                    Oricine cu linkul poate accesa.
                                </p>
                            )}
                            {watch('allowedGroups')?.length ? (
                                <p>
                                    <strong>Clase permise:</strong>{' '}
                                    {watch('allowedGroups')?.join(', ')}
                                </p>
                            ) : null}
                        </>
                    )}
                </div>
            </motion.div>

            {/* Info Box */}
            <motion.div
                variants={itemVariants}
                className="p-4 bg-theme-surface-secondary rounded-xl border border-(--accent)/20 space-y-2"
            >
                <h4 className="font-semibold text-theme-text">Sfaturi de Siguranță:</h4>
                <ul className="text-xs text-theme-text-muted space-y-1 list-disc list-inside">
                    <li>
                        Propunerile private nu vor fi niciodată publicate fără consimțământul tău.
                    </li>
                    <li>Moderatorii au acces la toate propunerile pentru revizuire.</li>
                    <li>Poți schimba vizibilitatea mai târziu, chiar și după publicare.</li>
                </ul>
            </motion.div>
        </motion.div>
    );
}
