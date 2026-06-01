import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage, translations } from '../../language/Language';
import { containerVariants, itemVariants } from '../../utils/motionConfig';

// Container comun pentru paginile legale (Privacy / Terms). Tine doar layout-ul si
// stilurile; continutul concret (bilingv) vine din paginile care il folosesc.
export default function LegalLayout({
    title,
    updatedAt,
    children,
}: {
    title: string;
    updatedAt: string;
    children: ReactNode;
}) {
    const { lang } = useLanguage();
    const t = translations[lang];

    return (
        <motion.div
            className="p-6 md:p-8 w-full max-w-3xl mx-auto bg-(--surface-card) backdrop-blur-sm border-2 border-(--accent) rounded-3xl card-glow"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            <motion.div variants={itemVariants}>
                <Link
                    to="/"
                    className="inline-block mb-4 text-sm font-semibold text-(--accent) underline underline-offset-4 hover:text-(--text-h) transition-colors"
                >
                    ← {t.legalBack}
                </Link>
                <h1 className="text-3xl font-bold text-(--text-h) mb-2">{title}</h1>
                <p className="text-xs text-(--text-muted) mb-2">{updatedAt}</p>
                <div className="page-line-horizontal" />
            </motion.div>

            <motion.div
                variants={itemVariants}
                className="mt-6 flex flex-col gap-5 text-sm leading-relaxed text-(--text)"
            >
                {children}
            </motion.div>
        </motion.div>
    );
}

// Mici helpere de tipografie ca paginile sa ramana lizibile fara un framework de prose.
export function LegalSection({ heading, children }: { heading: string; children: ReactNode }) {
    return (
        <section className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold text-(--text-h)">{heading}</h2>
            {children}
        </section>
    );
}

export function LegalList({ items }: { items: readonly string[] }) {
    return (
        <ul className="list-disc pl-5 flex flex-col gap-1 text-(--text-muted)">
            {items.map((item, i) => (
                <li key={i}>{item}</li>
            ))}
        </ul>
    );
}
