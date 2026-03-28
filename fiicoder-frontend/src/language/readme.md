aici practic schimbi limba, am un obiect cu toate traducerile la fiecare chestie ca sa fie mai usor de scris :)

explicatie de la *geanina*:

Structura Modulului
1. Obiectul translations
Conține toate textele statice ale interfeței (butoane, etichete, mesaje de sistem), grupate pe chei de identificare.

2. LanguageProvider
Este componenta de tip "Wrapper" care înconjoară întreaga aplicație în main.tsx. Aceasta deține starea actuală (lang) și funcția de actualizare (setLang).

3. useLanguage()
Un hook personalizat care permite oricărei componente să:

Afle limba curentă.

Schimbe limba (ex: din Navbar).

Acceseze obiectul de traduceri.