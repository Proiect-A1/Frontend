import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Configurarea căilor
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LOCALES_DIR = path.join(__dirname, 'src', 'language', 'locales');

// Limba de bază (Sursă)
const SOURCE_LANG = 'ro';
// Limbile în care vrem să traducem
const TARGET_LANGS = ['en']; 
const PENDING_SUFFIX = '.pending.json';

// Funcție care apelează API-ul Google Translate gratuit (fără cheie API!)
async function translateText(text, sourceLang, targetLang) {
    const query = encodeURIComponent(text);
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${query}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        // Google returnează un array urât, textul tradus este în primul element
        return data[0].map(item => item[0]).join('');
    } catch (error) {
        console.error(`❌ Eroare la traducerea textului "${text}":`, error);
        return text; // Returnăm textul original în caz de eroare
    }
}

async function run() {
    console.log('🚀 Începem auto-traducerea...');

    // Asigură-te că folderul există
    if (!fs.existsSync(LOCALES_DIR)) {
        fs.mkdirSync(LOCALES_DIR, { recursive: true });
    }

    const sourcePath = path.join(LOCALES_DIR, `${SOURCE_LANG}.json`);
    
    // Dacă nu ai încă ro.json, creăm unul de test
    //
    if (!fs.existsSync(sourcePath)) {
        console.log(`📝 Nu am găsit ${sourcePath}. Creez un fișier de bază...`);
        fs.writeFileSync(sourcePath, JSON.stringify({ 
            "welcomeMessage": "Bine ai venit pe platformă!", 
            "loginBtn": "Autentificare" 
        }, null, 4));
    }

    const sourceData = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));

    for (const targetLang of TARGET_LANGS) {
        const targetPath = path.join(LOCALES_DIR, `${targetLang}.json`);
        // Load existing final translations (do not overwrite)
        let finalData = {};
        if (fs.existsSync(targetPath)) {
            finalData = JSON.parse(fs.readFileSync(targetPath, 'utf8'));
        }

        // Pending file holds auto-translated drafts for review
        const pendingPath = path.join(LOCALES_DIR, `${targetLang}${PENDING_SUFFIX}`);
        let pendingData = {};
        if (fs.existsSync(pendingPath)) {
            pendingData = JSON.parse(fs.readFileSync(pendingPath, 'utf8'));
        }

        let keysAdded = 0;

        // Simple glossary of tokens we don't want translated
        const GLOSSARY = ['Monaco', 'C++', 'Python', 'Java', 'JavaScript', 'JS', 'badge', 'badges', 'Contest', 'Problems', 'Problem'];

        function maskGlossary(text) {
            const tokens = {};
            let idx = 0;
            let out = text;

            // Patterns to preserve: {{var}}, {var}, %s, :name, <tags>, `inline`, acronyms
            const placeholderPatterns = [ /\{\{[^}]+\}\}/g, /\{[^}]+\}/g, /%[sdifo]/g, /:\w+/g, /<[^>]+>/g, /`[^`]+`/g, /\b[A-Z]{2,}\b/g ];
            for (const pat of placeholderPatterns) {
                let m;
                while ((m = pat.exec(out)) !== null) {
                    const token = `__P_${idx}__`;
                    tokens[token] = m[0];
                    out = out.slice(0, m.index) + token + out.slice(m.index + m[0].length);
                    // reset regex lastIndex to continue correctly
                    pat.lastIndex = 0;
                    idx++;
                }
            }

            // Now mask glossary words
            for (const word of GLOSSARY) {
                const re = new RegExp(word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
                let m;
                while ((m = re.exec(out)) !== null) {
                    const token = `__G_${idx}__`;
                    tokens[token] = m[0];
                    out = out.slice(0, m.index) + token + out.slice(m.index + m[0].length);
                    re.lastIndex = 0;
                    idx++;
                }
            }

            return { out, tokens };
        }

        function restoreGlossary(text, tokens) {
            let out = text;
            // Replace tokens with original values; token keys do not overlap so order is not critical
            for (const [token, word] of Object.entries(tokens)) {
                out = out.split(token).join(word);
            }
            return out;
        }

        for (const [key, value] of Object.entries(sourceData)) {
            // Skip if there's already a curated translation
            if (finalData[key]) continue;
            // Skip if already present in pending
            if (pendingData[key]) continue;

            console.log(`⏳ Draft traducere [${key}]: "${value}" -> ${targetLang.toUpperCase()}...`);
            await new Promise(r => setTimeout(r, 500));

            // Mask glossary tokens so they aren't mangled by the translator
            const { out: masked, tokens } = maskGlossary(value);

            // Include key as minimal context to assist translation
            const toTranslate = `${masked}\n\n[context: ${key}]`;

            const translatedMasked = await translateText(toTranslate, SOURCE_LANG, targetLang);

            // Try to remove the appended context from the result if it was mirrored
            const translatedClean = translatedMasked.replace(/\[context:\s.*\]$/i, '').trim();

            const translated = restoreGlossary(translatedClean, tokens);

            pendingData[key] = {
                source: value,
                translation: translated,
                context: key,
            };
            keysAdded++;
            console.log(`   ✅ Draft: "${translated}" (saved to ${targetLang}${PENDING_SUFFIX})`);
        }

        if (keysAdded > 0) {
            fs.writeFileSync(pendingPath, JSON.stringify(pendingData, null, 4));
            console.log(`🎉 Am creat/actualizat ${pendingPath} cu ${keysAdded} traduceri automate (draft).`);
            console.log('ℹ️  Nu am suprascris en.json — revizuiește drafturile și le copiezi manual în en.json când ești gata.');
        } else {
            console.log(`✅ Nicio traducere nouă de adăugat în ${targetLang}${PENDING_SUFFIX}.`);
        }
    }
}

run();
