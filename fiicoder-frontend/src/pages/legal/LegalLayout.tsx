import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage, translations } from '../../language/Language';

// Container comun pentru paginile legale (Privacy / Terms). Tine doar layout-ul si
// stilurile; continutul concret (bilingv) vine din paginile care il folosesc.
//
// Intentionat NU are animatie proprie (framer-motion): tranzitia de pagina e deja
// facuta de <motion.main> din App (fade). Daca am suprapune inca un fade + stagger
// aici, tranzitia ar parea "rough". Layout-ul copiaza structura de la Landing
// (h-full + zona interna care scrolleaza) ca inaltimea sa ramana stabila.
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
        <div className="w-full max-w-5xl mx-auto rounded-3xl border-2 border-(--accent) bg-(--surface-card) h-full overflow-hidden relative flex flex-col card-glow">
            <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-6 md:px-10 md:py-12">
                <Link
                    to="/"
                    className="inline-block mb-4 text-sm font-semibold text-(--accent) underline underline-offset-4 hover:text-(--text-h) transition-colors"
                >
                    ← {t.legalBack}
                </Link>
                <h1 className="text-3xl font-bold text-(--text-h) mb-2">{title}</h1>
                <p className="text-xs text-(--text-muted) mb-2">{updatedAt}</p>
                <div className="page-line-horizontal" />

                <div className="mt-6 flex flex-col gap-5 text-sm leading-relaxed text-(--text)">
                    {children}
                </div>
            </div>
        </div>
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
