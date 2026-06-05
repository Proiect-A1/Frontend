import { useLanguage } from '../../language/Language';
import LegalLayout, { LegalSection } from './LegalLayout';

// NOTĂ: Text TEMPLATE — trebuie revizuit juridic înainte de publicare.
const LAST_UPDATED = '2026-06-01';

const content = {
    RO: {
        title: 'Termeni și condiții',
        updated: `Ultima actualizare: ${LAST_UPDATED}`,
        intro: 'Prin crearea unui cont și utilizarea platformei Fiicoder, ești de acord cu termenii de mai jos.',
        sections: [
            {
                heading: '1. Utilizarea contului',
                text: 'Ești responsabil pentru confidențialitatea credențialelor tale și pentru activitatea desfășurată din contul tău. Trebuie să furnizezi informații reale la înregistrare.',
            },
            {
                heading: '2. Conduită acceptabilă',
                text: 'Nu este permisă utilizarea platformei pentru activități ilegale, fraudarea evaluărilor, partajarea de conținut abuziv sau încercarea de a compromite securitatea sistemului.',
            },
            {
                heading: '3. Conținutul tău',
                text: 'Soluțiile și problemele pe care le trimiți rămân ale tale, dar ne acorzi dreptul de a le stoca și afișa în cadrul platformei pentru funcționarea normală a acesteia (evaluare, clasamente, teme).',
            },
            {
                heading: '4. Suspendarea contului',
                text: 'Putem suspenda sau bana un cont care încalcă acești termeni. Vei fi informat asupra motivului atunci când este posibil.',
            },
            {
                heading: '5. Disponibilitatea serviciului',
                text: 'Platforma este oferită „ca atare", fără garanții de disponibilitate neîntreruptă. Putem modifica sau întrerupe funcționalități.',
            },
            {
                heading: '6. Protecția datelor',
                text: 'Prelucrarea datelor tale personale este descrisă în Politica de confidențialitate, parte integrantă a acestor termeni.',
            },
        ],
    },
    EN: {
        title: 'Terms and Conditions',
        updated: `Last updated: ${LAST_UPDATED}`,
        intro: 'By creating an account and using the Fiicoder platform, you agree to the terms below.',
        sections: [
            {
                heading: '1. Account usage',
                text: 'You are responsible for keeping your credentials confidential and for any activity carried out from your account. You must provide accurate information at registration.',
            },
            {
                heading: '2. Acceptable conduct',
                text: 'You may not use the platform for illegal activities, cheating on evaluations, sharing abusive content, or attempting to compromise the security of the system.',
            },
            {
                heading: '3. Your content',
                text: 'The solutions and problems you submit remain yours, but you grant us the right to store and display them within the platform for its normal operation (evaluation, leaderboards, homeworks).',
            },
            {
                heading: '4. Account suspension',
                text: 'We may suspend or ban an account that violates these terms. You will be informed of the reason where possible.',
            },
            {
                heading: '5. Service availability',
                text: 'The platform is provided "as is", without guarantees of uninterrupted availability. We may modify or discontinue features.',
            },
            {
                heading: '6. Data protection',
                text: 'The processing of your personal data is described in the Privacy Policy, which is an integral part of these terms.',
            },
        ],
    },
} as const;

export default function Terms() {
    const { lang } = useLanguage();
    const c = content[lang];

    return (
        <LegalLayout title={c.title} updatedAt={c.updated}>
            <p className="text-(--text-muted)">{c.intro}</p>
            {c.sections.map((section) => (
                <LegalSection key={section.heading} heading={section.heading}>
                    <p className="text-(--text-muted)">{section.text}</p>
                </LegalSection>
            ))}
        </LegalLayout>
    );
}
