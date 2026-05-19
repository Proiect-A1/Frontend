import { useFormContext } from 'react-hook-form';
import { motion } from 'framer-motion';
import type { ProposeProblemForm } from '../types/proposeProblem';
import { itemVariants, staggerConfig } from '../../../utils/motionConfig';
import TitleInput from './TitleInput';
import DifficultySelect from './DifficultySelect';
import LimitsInput from './LimitsInput';
import InteractiveToggle from './InteractiveToggle';
import TagsAutocomplete from './TagsAutocomplete';
import GeneralPreview from './GeneralPreview';

export default function GeneralTab() {
    const { watch, setValue } = useFormContext<ProposeProblemForm>();
    const formData = watch();

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: staggerConfig } }}
            className="space-y-6"
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div variants={itemVariants}>
                    <TitleInput />
                </motion.div>
                <motion.div variants={itemVariants}>
                    <DifficultySelect
                        value={formData.difficulty}
                        onChange={(value) => setValue('difficulty', value)}
                    />
                </motion.div>
            </div>

            <motion.div variants={itemVariants}>
                <LimitsInput />
            </motion.div>

            <motion.div variants={itemVariants}>
                <InteractiveToggle
                    value={!!formData.isInteractive}
                    onChange={(value) => setValue('isInteractive', value)}
                />
            </motion.div>

            <motion.div variants={itemVariants}>
                <TagsAutocomplete
                    selectedTags={formData.tags}
                    onTagsChange={(tags) => setValue('tags', tags)}
                />
            </motion.div>

            <motion.div
                variants={itemVariants}
                className="p-4 bg-(--surface-muted) rounded-2xl border border-(--accent)/25 text-sm text-(--text-muted)"
            >
                <p>
                    <strong>Sfat:</strong> Alege limite care sunt realiste pentru problema ta. Timp
                    prea mic poate frustra utilizatorii.
                </p>
            </motion.div>

            <GeneralPreview data={formData} />
        </motion.div>
    );
}

