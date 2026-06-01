import { useLanguage } from '../../language/Language';
import LegalLayout, { LegalSection, LegalList } from './LegalLayout';

// NOTĂ: Acesta este un text TEMPLATE, aliniat la datele pe care platforma le
// colectează efectiv (vezi entitatea User din backend). Trebuie revizuit de o
// persoană cu competențe juridice și completat cu operatorul de date real și
// datele de contact (DPO) înainte de a fi considerat conform legal.
const CONTACT_EMAIL = 'privacy@fiicoder.top'; // TODO: confirmă adresa reală
const LAST_UPDATED = '2026-06-01';

const content = {
    RO: {
        title: 'Politica de confidențialitate',
        updated: `Ultima actualizare: ${LAST_UPDATED}`,
        intro: 'Această politică explică ce date personale colectăm despre tine, de ce le colectăm, pe ce temei legal și ce drepturi ai conform Regulamentului General privind Protecția Datelor (GDPR).',
        sections: {
            data: 'Ce date colectăm',
            dataList: [
                'Date de cont: nume, prenume, nume de utilizator și adresă de email.',
                'Parola: stocată exclusiv sub formă de hash (nu o putem citi).',
                'Activitate pe platformă: soluțiile trimise, temele, clasele/grupurile din care faci parte, anunțurile și problemele create.',
                'Imagine de profil: generată automat pe baza unui hash al adresei tale de email (Gravatar/DiceBear); nu încărcăm și nu stocăm fotografii.',
                'Date tehnice minime: token de sesiune (cookie strict necesar) și marcaje de timp ale contului.',
            ],
            purpose: 'De ce le folosim',
            purposeText: 'Folosim aceste date pentru a-ți crea și securiza contul, a-ți afișa progresul și clasamentele, a gestiona apartenența la clase și a permite trimiterea de soluții. Nu vindem datele tale și nu le folosim pentru publicitate.',
            legal: 'Temeiul legal',
            legalText: 'Prelucrăm datele pe baza executării contractului (furnizarea platformei la cererea ta) și a consimțământului tău exprimat la înregistrare. Îți poți retrage consimțământul oricând ștergându-ți contul.',
            cookies: 'Cookie-uri',
            cookiesText: 'Folosim un singur cookie strict necesar (httpOnly) pentru a menține sesiunea autentificată. Token-ul de acces este păstrat doar în memoria browserului, nu în localStorage, pentru a reduce riscul de furt. Nu folosim cookie-uri de marketing sau de urmărire.',
            retention: 'Cât timp păstrăm datele',
            retentionText: 'Păstrăm datele contului cât timp contul este activ. La ștergerea contului, datele de identificare sunt anonimizate, iar soluțiile trimise sunt păstrate într-o formă anonimă pentru integritatea clasamentelor.',
            rights: 'Drepturile tale (GDPR)',
            rightsList: [
                'Dreptul de acces la datele tale (Art. 15).',
                'Dreptul la rectificare a datelor inexacte (Art. 16).',
                'Dreptul la ștergere / „a fi uitat" (Art. 17).',
                'Dreptul la portabilitatea datelor (Art. 20).',
                'Dreptul de a te opune prelucrării (Art. 21).',
                'Dreptul de a depune o plângere la autoritatea de supraveghere (ANSPDCP).',
            ],
            contact: 'Contact',
            contactText: `Pentru orice solicitare legată de datele tale, ne poți contacta la ${CONTACT_EMAIL}.`,
        },
    },
    EN: {
        title: 'Privacy Policy',
        updated: `Last updated: ${LAST_UPDATED}`,
        intro: 'This policy explains what personal data we collect about you, why we collect it, on what legal basis, and what rights you have under the General Data Protection Regulation (GDPR).',
        sections: {
            data: 'What data we collect',
            dataList: [
                'Account data: first name, last name, username and email address.',
                'Password: stored only as a hash (we cannot read it).',
                'Platform activity: your submissions, homeworks, the classes/groups you belong to, and the announcements and problems you create.',
                'Profile picture: generated automatically from a hash of your email address (Gravatar/DiceBear); we do not upload or store photos.',
                'Minimal technical data: a session token (strictly necessary cookie) and account timestamps.',
            ],
            purpose: 'Why we use it',
            purposeText: 'We use this data to create and secure your account, show your progress and leaderboards, manage class membership and allow you to submit solutions. We do not sell your data or use it for advertising.',
            legal: 'Legal basis',
            legalText: 'We process your data based on the performance of a contract (providing the platform at your request) and on the consent you give at registration. You can withdraw your consent at any time by deleting your account.',
            cookies: 'Cookies',
            cookiesText: 'We use a single strictly necessary cookie (httpOnly) to keep your authenticated session. The access token is kept only in browser memory, not in localStorage, to reduce the risk of theft. We do not use marketing or tracking cookies.',
            retention: 'How long we keep data',
            retentionText: 'We keep account data for as long as the account is active. When an account is deleted, identifying data is anonymized and submissions are kept in anonymized form to preserve leaderboard integrity.',
            rights: 'Your rights (GDPR)',
            rightsList: [
                'The right to access your data (Art. 15).',
                'The right to rectification of inaccurate data (Art. 16).',
                'The right to erasure / "to be forgotten" (Art. 17).',
                'The right to data portability (Art. 20).',
                'The right to object to processing (Art. 21).',
                'The right to lodge a complaint with a supervisory authority.',
            ],
            contact: 'Contact',
            contactText: `For any request regarding your data, you can contact us at ${CONTACT_EMAIL}.`,
        },
    },
} as const;

export default function PrivacyPolicy() {
    const { lang } = useLanguage();
    const c = content[lang];
    const s = c.sections;

    return (
        <LegalLayout title={c.title} updatedAt={c.updated}>
            <p className="text-(--text-muted)">{c.intro}</p>

            <LegalSection heading={s.data}>
                <LegalList items={s.dataList} />
            </LegalSection>

            <LegalSection heading={s.purpose}>
                <p className="text-(--text-muted)">{s.purposeText}</p>
            </LegalSection>

            <LegalSection heading={s.legal}>
                <p className="text-(--text-muted)">{s.legalText}</p>
            </LegalSection>

            <LegalSection heading={s.cookies}>
                <p className="text-(--text-muted)">{s.cookiesText}</p>
            </LegalSection>

            <LegalSection heading={s.retention}>
                <p className="text-(--text-muted)">{s.retentionText}</p>
            </LegalSection>

            <LegalSection heading={s.rights}>
                <LegalList items={s.rightsList} />
            </LegalSection>

            <LegalSection heading={s.contact}>
                <p className="text-(--text-muted)">{s.contactText}</p>
            </LegalSection>
        </LegalLayout>
    );
}
