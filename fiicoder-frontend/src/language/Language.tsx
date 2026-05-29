import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { Difficulty } from '../types/difficulty';

type Language = 'RO' | 'EN';

export const translations = {
    RO: {
        // ─── Auth / Login ────────────────────────────────────────────────────────
        loginTitle: 'Autentificare',
        registerTitle: 'Înregistrare',
        emailLabel: 'Email',
        passwordLabel: 'Parolă',
        registerBtn: 'Creează cont',
        noAccount: 'Nu ai un cont?',
        hasAccount: 'Ai deja un cont?',
        nameLabel: 'Prenume',
        surnameLabel: 'Nume',
        emailPlaceholder: 'ion@fiicoder.com',
        namePlaceholder: 'Ion',
        surnamePlaceholder: 'Popescu',
        loginBtn: 'Autentificare',
        disconnectBtn: 'Deconectare',
        continueAsGuest: 'Continuă ca vizitator',

        // ─── Locale ──────────────────────────────────────────────────────────────
        dateLocale: 'ro-RO',

        // ─── Navbar ──────────────────────────────────────────────────────────────
        archiveBtn: 'Probleme',
        proposeBtn: 'Propune',
        profileBtn: 'Profil',
        adminBtn: 'Admin',
        themeLabel: 'Temă',
        languageLabel: 'Limbă',
        navSearchPlaceholder: 'Caută problemă...',
        navGreetingPrefix: 'Bună, ',
        navViewProfile: 'Vezi profil',
        navBackground: 'Fundal',
        navCorners: 'Colțuri',
        problemNotFound: 'Problema nu a fost găsită.',
        navCloseMenu: 'Închide meniu',
        navOpenMenu: 'Deschide meniu',

        // ─── Landing ─────────────────────────────────────────────────────────────
        welcomeTitle: 'Bine ai venit la',
        welcomeDesc:
            'Platforma competitivă de programare pentru studenți. Înscrie-te într-o clasă, rezolvă probleme și devino maestru în coding.',
        viewProblems: 'Vezi Problemele',
        authenticateBtn: 'Autentificare',
        startBtn: 'Să Începem!',
        readyText: 'Gata să-ți testezi abilitățile? Alege-ți nivelul și apasă start!',
        announcementsTitle: 'Anunțuri Importante',
        newProblems: '1000+ Probleme',
        newProblemsDesc: 'De la ușor la foarte greu, pentru orice nivel de abilitate',
        classesMentors: 'Clase și profesori',
        classesMentorsDesc: 'Creează clase, colaborează cu profesori și gestionează teme',
        advancedEditor: 'Editor Avansat',
        advancedEditorDesc: 'Monaco Editor cu syntax highlighting pentru C++, Python, Go...',
        activeStudents: 'Studenți Activi',
        problemsCount: 'Probleme',
        contestsCount: 'Soluții Acceptate',
        satisfactionRate: 'Satisfacție',
        closeBtn: 'Închide',
        showLess: 'Vezi mai puțin',
        showAll: 'Vezi toate',
        loadingAnnouncements: 'Se încarcă anunțurile...',
        announcementReadLabel: 'citit',
        noAnnouncements: 'Nu sunt anunțuri disponibile.',

        // ─── Problem List ─────────────────────────────────────────────────────────
        problemsTitle: 'Probleme',
        noProblemsFound: 'Nu am găsit nicio problemă.',
        easyDifficulty: 'Ușor',
        mediumDifficulty: 'Mediu',
        hardDifficulty: 'Greu',
        contestDifficulty: 'Concurs',
        proposeProblemBtn: 'Propune problemă',
        sortDefault: 'Implicit',
        sortEasyToHard: 'Ușor → Greu',
        sortHardToEasy: 'Greu → Ușor',
        endOfList: 'Ai ajuns la finalul listei',

        // ─── Filter Sidebar ───────────────────────────────────────────────────────
        filterTitle: 'Filtrare',
        searchLabel: 'Nume problemă',
        difficultyLabel: 'Dificultate',
        allOption: 'Toate',
        clearFilters: 'Șterge filtrele',
        filterSearchPlaceholder: 'Problema 3',
        filterTagsError: 'Nu s-au putut încărca tag-urile.',
        filterShowing: 'Afișate',
        filterOf: 'din',
        filterProblemsWord: 'probleme',

        // ─── Stats Sidebar ────────────────────────────────────────────────────────
        statsTitle: 'Statistici',
        statSolved: 'Rezolvate',
        statRate: 'Rată de Succes',
        statStreak: 'Zile consecutive',
        statPref: 'Dificultate preferată',
        topSolvers: 'Top Utilizatori',
        popularProblems: 'Probleme Populare',
        solvedLabel: 'rezolvate',
        attemptsLabel: 'încercări',

        // ─── Tags ────────────────────────────────────────────────────────────────
        tagsLabel: 'Tag-uri',
        noTagsAvailable: 'Niciun tag disponibil.',

        // ─── Problem Details ──────────────────────────────────────────────────────
        submitTitle: 'Trimite Soluția',
        submitAuthHelpful: 'Loghează-te pentru a trimite soluții și a-ți vedea progresul.',
        placeholderCode: 'Scrie soluția ta aici...',
        evalBtn: 'Evaluare soluție',
        evalPending: 'Evaluare în curs...',
        backToList: 'Înapoi la listă',
        systemEval: 'Sistem Evaluare',
        checking: '> Se verifică codul trimis...',
        success: '> 100 puncte!',
        resultTab: 'Rezultat',
        submissionsTab: 'Submisii',
        problemLabel: 'Problemă: ',
        submitToSeeResults: 'Trimite codul pentru a vedea rezultatele.',
        shortcutLabel: 'Scurtătură:',
        testsLabel: 'Teste',
        consoleComingSoon: 'Consolă — în curând',
        consoleLabel: 'Consolă',
        resetLayoutTitle: 'Resetează layout-ul la valorile implicite',
        connectingLabel: 'Conectare...',
        systemActiveLabel: 'Sistem Activ',
        submittingLabel: 'Trimitere...',
        submitLabel: 'Trimite',
        evaluatingPrefix: 'Evaluare... (',
        evaluatingSuffix: ' teste)',

        // ─── Submissions Panel ────────────────────────────────────────────────────
        loginToSeeHistory: 'Autentifică-te pentru istoricul tău.',
        noSubmissionsYet: 'Nu ai încă submisii.',
        loadMore: 'Afișează mai multe',
        submissionsLeft: 'rămase',

        // ─── Submission Detail Modal ──────────────────────────────────────────────
        submissionDetails: 'Detalii Submisie',
        scoreLabel: 'Scor',
        pointsLabel: 'puncte',
        subtasksLabel: 'Subtask-uri',
        timeLabel: 'Timp',
        memoryLabel: 'Memorie',
        loadingLabel: 'Se încarcă...',
        evaluatingLabel: 'În evaluare...',
        noResultsAvailable: 'Nu există rezultate disponibile.',
        copyCode: 'Copiază codul',

        // ─── Classes ─────────────────────────────────────────────────────────────
        classesTitle: 'Clase',
        classesHubTitle: 'Hub-ul de clase',
        createClassBtn: 'Creează clasa',
        inviteStudentBtn: 'Trimite invitație',
        homeworkTitle: 'Teme',
        openClassBtn: 'Deschide clasa',
        myInvitations: 'Invitațiile mele',
        activeHomework: 'Teme active',

        // ─── Auth / Login (additional) ───────────────────────────────────────────
        loginBannedMsg: 'Contul tău a fost suspendat.',
        loginBannedReason: 'Motiv: ',
        loginBannedContact: 'Contactează un administrator.',
        loginSuccess: 'Autentificare reușită.',
        passwordMismatch: 'Parolele nu coincid.',
        accountCreated: 'Cont creat cu succes! Te poți autentifica.',
        usernameLabel: 'Nume utilizator',
        confirmPasswordLabel: 'Confirmă parola',
        signUpLinkBtn: 'Înregistrează-te',
        loginLinkBtn: 'Autentifică-te',
        loginOr: 'sau',
        connectionError: 'Eroare de conexiune. Verifică serverul.',

        // ─── ClassesHub ──────────────────────────────────────────────────────────
        classNameRequired: 'Numele clasei este obligatoriu.',
        classCreatedSuccess: 'Clasa a fost creată cu succes!',
        classCreatedShort: 'Clasa a fost creată.',
        classCreateError: 'Eroare la crearea clasei.',
        classIdRequired: 'Introdu un ID valid.',
        classAccessDeniedInvite: 'Nu ai acces la această clasă. Cere o invitație de la creator.',
        classAccessDeniedLong: 'Nu ai acces la această clasă. Trebuie să fii membru, creator sau admin.',
        classNotFoundMsg: 'Clasa nu a fost găsită.',
        classLookupError: 'Eroare la căutarea clasei.',
        invitationAccepted: 'Invitație acceptată!',
        invitationAcceptedMsg: 'Invitația a fost acceptată.',
        invitationDeclined: 'Invitație refuzată.',
        invitationDeclinedMsg: 'Invitația a fost refuzată.',
        invitationAcceptError: 'Eroare la acceptare.',
        invitationDeclineError: 'Eroare la refuzare.',
        noRecentClasses: 'Nu ai clase salvate recent. Creează sau caută o clasă și va apărea aici.',
        noDescription: 'Fără descriere.',
        createdByLabel: 'Creată de',
        membersLabel: 'Membri',
        noActiveInvitations: 'Nu ai invitații active.',
        invitationsServerError: 'Eroare la comunicarea cu serverul pentru invitații.',
        invitedClassFallback: 'Clasă invitată',
        statusLabel: 'Status',
        acceptBtn: 'Acceptă',
        declineBtn: 'Refuză',
        goToProblems: 'Mergi la probleme',
        createClassSection: 'Creează o clasă',
        classNamePlaceholder: 'Nume clasă',
        classOptionalDesc: 'Descriere opțională',
        findClassSection: 'Găsește o clasă',
        classUuidPlaceholder: 'UUID clasă',
        recentClassesSection: 'Clase recente',
        clearBtn: 'Curăță',
        myGroupsSection: 'Grupurile mele',
        copyLinkTitle: 'Copiază link-ul clasei',
        linkCopied: 'Link copiat!',
        membersCount: 'membri',
        openBtn: 'Deschide',
        noMyGroups: 'Nu faci parte din niciun grup. Creează unul sau acceptă o invitație.',

        // ─── ClassDetails ─────────────────────────────────────────────────────────
        hwLoadError: 'Eroare la încărcare.',
        hwPublishedFeedback: 'Publicată!',
        hwPublishedMsg: 'Tema a fost publicată.',
        hwDeleteConfirm: 'Ștergi tema?',
        hwDeletedMsg: 'Tema a fost ștearsă.',
        hwUpdatedFeedback: 'Actualizat!',
        hwUpdatedMsg: 'Tema a fost actualizată.',
        hwItemsRemovedMsg: 'Elementele au fost eliminate.',
        hwHideBtn: 'Ascunde',
        hwDetailsBtn: 'Detalii',
        hwPublishBtn: 'Publică',
        hwProblemsLabel: 'Probleme',
        hwStudentsLabel: 'Elevi:',
        hwSubmissionsLabel: 'Submisii:',
        hwAddSection: 'Adaugă',
        hwRemoveSection: 'Șterge',
        hwStudentProgressTitle: 'Progres Elevi',
        hwStudentCol: 'Elev',
        hwAvgScoreCol: 'Scor Mediu',
        hwStatusDone: 'GATA',
        hwStatusWorking: 'ÎN LUCRU',
        hwStatusIdle: 'NU A ÎNCEPUT',
        hwProgressDetailsLabel: 'Detalii progres:',
        hwAvgScoreShort: 'Scor mediu:',
        hwAttemptsShort: 'înc',
        hwAttemptedProblems: 'probleme încercate',
        classLabel: 'Clasă',
        deleteClassBtn: 'Șterge clasa',
        backBtn: 'Înapoi',
        detailsSection: 'Detalii',
        descriptionLabel: 'Descriere',
        inviteMembersTitle: 'Invită colegi',
        inviteEmailPlaceholder: 'Email-uri (separate prin virgulă sau linie nouă)',
        inviteBtn: 'Invită',
        sendingBtn: 'Se trimite...',
        newHomeworkSection: 'Temă nouă',
        hwTitlePlaceholder: 'Titlu',
        hwInitialOptional: 'Inițial (opțional)',
        hwUsersPlaceholder: 'Utilizatori (user1, user2)',
        hwProblemsPlaceholder: 'Probleme (p1, p2)',
        createBtn: 'Creează',
        classMembersSection: 'Membrii clasei',
        teacherLabel: 'Profesor',
        noStudentsYet: 'Niciun student în clasă încă.',
        kickBtn: 'Elimină',
        homeworkSection: 'Teme',
        homeworkItems: 'teme',
        noHomeworkYet: 'Nicio temă creată încă. Creează una mai sus.',
        studentRemoved: 'Student eliminat.',
        studentRemoveError: 'Eroare la eliminare.',
        classDeleted: 'Clasa a fost ștearsă.',
        classDeleteError: 'Eroare la ștergere.',
        hwCreatedFeedback: 'Creat!',
        hwCreatedMsg: 'Tema a fost creată.',
        inviteAdminError: 'Conturile de admin nu pot fi invitate.',
        inviteAlreadyMember: 'Deja membru.',
        invitePendingError: 'Invitație deja în așteptare.',

        // ─── Profile ──────────────────────────────────────────────────────────────
        profileStatsTitle: 'Statistici',
        communityStats: 'Statistici',
        totalSubmissions: 'Total Submisii',
        acceptanceRate: 'Rată de Acceptare',
        dailyStreak: 'Zile Consecutive',
        streakCapped: 'Limitat',
        languagesLabel: 'Limbaje',
        languagesEmpty: 'Rezolvă cel puțin 5 probleme cu același limbaj pentru a apărea aici.',
        skillsLabel: 'Skills',
        skillsEmpty: 'Rezolvă probleme cu aceleași tag-uri pentru a-ți construi profilul de skills.',
        memberSince: 'Membru din',
        roleLabel: 'Rol',
        roleStudent: 'Elev',
        roleProfessor: 'Profesor',
        roleAdmin: 'Admin',
        changePhoto: 'Schimbă\npoza',
        changePhotoOnGravatar: 'Schimbă poza pe Gravatar',
        noAchievementsYet: 'Nicio realizare încă',
        problemsSolvedLabel: 'Probleme Rezolvate',
        monthlyActivity: 'Activitate Lunară',
        recentSubmissions: 'Submisii Recente',
        noRecentSubmissions: 'Nu există submisii recente.',
        heatmapLess: 'Mai puțin',
        heatmapMore: 'Mai mult',
        profileSolvedLabel: 'Rezolvate',
        profileSubmissionsLabel: 'Submisii',
        profileAcceptanceLabel: 'Acceptare',
        profileStreakLabel: 'Serie',
        performanceEasy: 'Ușoare',
        performanceMedium: 'Mediu',
        performanceHard: 'Grele',
        weekDays: ['L', 'Ma', 'Mi', 'J', 'V', 'S', 'D'],
        profileLoading: 'Se încarcă profilul...',
        profileError: 'Nu am putut încărca profilul. Încearcă din nou.',
        profileUnavailable: 'Profil indisponibil momentan.',
        profileTitle: 'Profil',
        profileTabOverview: 'Prezentare',
        profileAdminDashboard: 'Panou Administrare',
        proposalDeleted: 'Propunerea a fost ștearsă.',
        proposalDeleteError: 'Eroare la ștergerea propunerii.',
        visibilityUpdated: 'Vizibilitate actualizată.',
        visibilityUpdateError: 'Eroare la actualizarea vizibilității.',

        // ─── Profile Achievements ─────────────────────────────────────────────────
        achievementsTitle: 'Realizări',
        achievementsUnlockedCount: 'deblocate',
        achievementsProgress: 'Progres total',
        achievementsUnlockedSection: 'Deblocate',
        achievementsLockedSection: 'Nedeblocate',

        // ─── Profile Homework Panel ────────────────────────────────────────────────
        hwDeadlineLabel: 'Termen:',
        hwProgress: 'Progres',
        hwCompleted: 'Finalizat',
        hwOverdue: 'Depășit',
        hwNoAssigned: 'Nu ești asignat la nicio temă.',

        // ─── Profile Proposals Panel ───────────────────────────────────────────────
        myProposals: 'Propunerile Mele',
        proposalHowItWorks: 'Cum funcționează:',
        proposalNoProposals: 'Nu ai trimis nicio propunere încă.',
        proposalMakePrivate: 'Fă privat',
        proposalMakePublic: 'Fă public',
        proposalStatusChecked: 'verificată',
        proposalCheckedTooltip: 'Verificată automat de backend. Așteaptă aprobarea unui admin.',
        proposalDeleteConfirmPrefix: 'Ești sigur că vrei să ștergi',
        proposalDeleteConfirmSuffix: 'Acțiunea este ireversibilă.',
        proposalView: 'Vezi',
        proposalEdit: 'Editează',
        proposalDelete: 'Șterge',
        proposalEditUnavailableTooltip:
            'Editarea propunerilor existente este momentan indisponibilă. Folosește „Propune" pentru o versiune nouă.',

        // ─── Profile Homework Panel ────────────────────────────────────────────────
        homeworkPanelTitle: 'Temele Mele',

        // ─── Admin Panel ──────────────────────────────────────────────────────────
        adminPanelTitle: 'Admin Panel',
        adminOpenOverview: 'Deschide Rezumat',
        adminTabUsers: 'Utilizatori',
        adminTabProblems: 'Probleme',
        adminTabTags: 'Tag-uri',
        adminTabAnnouncements: 'Anunțuri',
        adminTabGroups: 'Grupe',
        adminTabAudit: 'Audit',

        // ─── Admin Sidebar (Overview) ──────────────────────────────────────────────
        adminOverviewTitle: 'Rezumat',
        adminLiveStats: 'STATISTICI LIVE',
        adminStatUsers: 'Utilizatori',
        adminStatProblems: 'Probleme',
        adminStatSubmissions: 'Submisii',
        adminStatClasses: 'Clase',
        adminStatHomework: 'Teme',
        adminStatProposals: 'Propuneri',

        // ─── Admin Audit Log Tab ───────────────────────────────────────────────────
        auditLogTitle: 'Jurnal Audit',
        auditLogUser: 'Utilizator:',

        // ─── Admin User Tab ────────────────────────────────────────────────────────
        userMgmtTitle: 'Gestionare Utilizatori',
        userRoleStudent: 'STUDENT',
        userRoleProfessor: 'PROFESOR',
        userRoleAdmin: 'ADMIN',
        userBanBtn: 'Ban',
        userUnbanBtn: 'Unban',
        userDeleteBtn: 'Delete',
        userBanReasonLabel: 'Motiv:',

        // ─── Admin Announcements Tab ───────────────────────────────────────────────
        announcementsTabTitle: 'Anunțuri Platformă',
        announcementTitleLabel: 'Titlu Anunț',
        announcementContentLabel: 'Conținut',
        announcementTitlePlaceholder: 'Introdu titlul...',
        announcementCancel: 'Anulează',
        announcementSave: 'Salvează Anunțul',
        announcementTranslateBtn: 'Translate to EN',

        // ─── Admin Tags Tab ────────────────────────────────────────────────────────
        tagMgmtTitle: 'Gestionare Tag-uri',
        tagEditLabel: 'Editează Tag',
        tagAddLabel: 'Adaugă Tag Nou',
        tagNamePlaceholder: 'Nume tag (ex: Grafuri)',
        tagSaveBtn: 'Salvează',
        tagAddBtn: 'Adaugă',
        tagCancelBtn: 'Anulează',
        tagSearchPlaceholder: 'Caută tag după titlu exact...',
        tagSearchBtn: 'Caută',
        tagNotFound: 'Niciun tag găsit.',

        // ─── Admin Groups Tab ──────────────────────────────────────────────────────
        groupMgmtTitle: 'Gestionare Grupe',
        groupSearchByName: 'Caută după nume...',
        groupCreatorPlaceholder: 'Creator (username)',
        groupCreatedAfter: 'Creată după',
        groupCreatedBefore: 'Creată înainte de',
        groupTotal: 'Total',
        groupSort: 'Sortează',
        groupSortNewest: 'Cele mai noi',
        groupSortOldest: 'Cele mai vechi',
        groupSortNameAZ: 'Nume A–Z',
        groupSortNameZA: 'Nume Z–A',
        groupResetFilters: 'Resetează filtrele',
        groupAvailable: 'Grupe disponibile',
        groupLoading: 'Se incarcă grupele...',
        groupNone: 'Nu există grupe.',
        groupSelectToSee: 'Selectează o grupă pentru detalii.',
        groupLoadingDetails: 'Se incarcă detaliile grupei...',
        groupCreatorLabel: 'Creator',
        groupMembersLabel: 'membri',
        groupOpenClass: 'Deschide clasa',
        groupDelete: 'Șterge',
        groupMembersTitle: 'Membri',
        groupMembersLoading: 'Se incarcă membrii...',
        groupTeacherLabel: 'Profesor',
        groupNoStudents: 'Niciun student.',
        groupRemoveMember: 'Elimină',
        groupPendingInvitations: 'Invitații pending',
        groupInvitationsLoading: 'Se incarcă invitațiile...',
        groupNoPendingInvitations: 'Nu există invitații pending.',
        groupRefreshing: 'Se actualizează detaliile...',

        // ─── Admin Proposals Tab ───────────────────────────────────────────────────
        problemMgmtTitle: 'Gestionare Probleme',
        proposalsPending: 'În așteptare',
        proposalsAccepted: 'Acceptate',
        proposalStatusCheckedBadge: 'VERIFICAT',
        proposalStatusCheckedDesc: 'Verificat automat de backend. Așteaptă review-ul tău.',
        proposalStatusPendingBadge: 'ÎN AȘTEPTARE',
        proposalStatusPendingDesc: 'Încă neverificată automat de backend.',
        proposalsPendingList: 'Propuneri în așteptare',
        proposalPendingWord: 'pending',
        proposalCheckedWord: 'verif.',
        proposalNoPending: 'Nu există propuneri în așteptare.',
        proposalByLabel: 'Propus de',
        proposalLoadingDetails: 'Se încarcă detaliile propunerii...',
        proposalSelectToSee: 'Selectează o propunere pentru a vedea detaliile.',
        proposalTestsLabel: 'Teste',
        proposalTestsLoading: 'Se încarcă testele...',
        proposalNoTests: 'Nu există teste generate pentru această propunere.',
        proposalDeleteBtn: 'Șterge',
        proposalRejectBtn: 'Respinge',
        proposalApproveBtn: 'Aprobă',
        acceptedProblemsTitle: 'Probleme acceptate (publice)',
        acceptedLoading: 'Se încarcă...',
        acceptedNone: 'Nu există probleme acceptate.',
        visibilityPublic: 'Public',
        visibilityPrivate: 'Privat',
        makePrivateBtn: 'Fă privat',
        makePublicBtn: 'Fă public',

        // ─── Propose Problem ──────────────────────────────────────────────────────
        proposePageTitle: 'Propune o Problemă',
        proposeEditTitle: 'Editează Propunerea',
        proposeTabGeneral: 'General',
        proposeTabStatement: 'Enunț',
        proposeTabFiles: 'Fișiere',
        proposeTabTests: 'Teste Manuale',
        proposeTabGenerator: 'Script Generator',
        proposeLoading: 'Se încarcă propunerea...',
        proposeEditMode: 'Mod editare',
        proposeEditModeDescPrefix: 'Editezi problema',
        proposeEditModeDescSuffix: 'Modificările de metadate se aplică imediat; schimbarea fișierelor declanșează din nou verificarea.',
        proposeNewProposal: '← Propunere Nouă',
        proposeDraftBanner: 'Ai o ciornă salvată. Vrei să o restaurezi?',
        proposeDraftRestore: 'Restaurează',
        proposeDraftDiscard: 'Renunță',
        // proposeNoteRO / proposeNoteEN: handled inline in ProposeProblem.tsx (JSX spans)
        proposeSuccessUpdated: 'Propunerea a fost actualizată cu succes!',
        proposeSuccessChecked: 'Propunere verificată automat! Așteaptă aprobarea unui admin.',
        proposeSuccessSubmitted:
            'Propunerea ta a fost trimisă cu succes! Vei fi notificat când va fi revizuită.',
        proposePendingReview:
            'Trimisă. Verificarea automată e încă în curs — vezi „Propunerile mele" peste câteva momente.',
        proposeVerifying: 'ZIP încărcat. Se rulează verificarea automată... (max ~20s)',
        proposeImporting: 'Se importă...',
        proposeImportZip: 'Import ZIP',
        proposeExportZip: 'Export ZIP',
        proposeReset: 'Resetează',
        proposeSubmitting: 'Se trimite...',
        proposeUpdateBtn: 'Actualizează Propunerea',
        proposeSubmitBtn: 'Trimite Propunere',

        // ─── Propose — General Tab ────────────────────────────────────────────────
        proposeTitleLabel: 'Titlu',
        proposeTitlePlaceholder: 'Titlu descriptiv al problemei',
        proposeDifficultyLabel: 'Nivel de Dificultate',
        proposeDifficultyPlaceholder: 'Alege dificultate',
        proposeDifficultyEasy: 'Ușoară',
        proposeDifficultyMedium: 'Medie',
        proposeDifficultyHard: 'Grea',
        proposeDifficultyContest: 'Concurs',
        proposeTimeLimitLabel: 'Timp Limită (s)',
        proposeMemoryLimitLabel: 'Memorie Limită (MB)',
        proposeInteractiveLabel: 'Problemă Interactivă',
        proposeInteractiveDesc:
            'Activează dacă problema necesită un interactor (comunicare bidirecțională cu soluția).',
        proposeInteractiveAriaLabel: 'Activează/dezactivează interactor problemă',
        proposeTagsLabel: 'Etichete',
        proposeTagsPlaceholder: 'Scrie pentru a căuta etichete...',
        proposeTagsHelper: 'Selectează din lista de etichete existente.',
        proposeTip: 'Sfat: Alege limite care sunt realiste pentru problema ta. Timp prea mic poate frustra utilizatorii.',
        proposePreviewTitle: 'Previzualizare:',
        proposePreviewTitleField: 'Titlu:',
        proposePreviewDifficulty: 'Dificultate:',
        proposePreviewLimits: 'Timp/Memorie:',
        proposePreviewTags: 'Etichete:',
        proposePreviewVisibilityNote:
            'Toate propunerile sunt private la trimitere. Vizibilitatea poate fi schimbată din profilul tău după aprobarea de către un admin.',

        // ─── Propose — Statement Tab ───────────────────────────────────────────────
        proposeHidePreview: 'Ascunde Preview',
        proposeShowPreview: 'Arată Preview',
        proposeInsertExample: 'Exemplu',
        proposeTranslating: 'Se traduce...',
        proposeAutoTranslate: 'Auto-Translate to EN',
        proposeFormatRequired: 'Format obligatoriu',
        proposeFormatDesc: 'Enunțul trebuie să urmeze exact structura din template.',
        proposeStatementLabel: 'Enunț',
        proposePreviewLabel: 'Previzualizare',
        proposeMarkdownHelper: 'Folosește Markdown pentru formatare. Poți folosi și LaTeX cu $...$ pentru ecuații.',
        proposePreviewPlaceholder: '*Enunțul tău va apărea aici...*',
        proposeStatementRequired: 'Enunțul este obligatoriu',

        // ─── Propose — Tests Tab ──────────────────────────────────────────────────
        proposeTestsInfo: 'Teste Manuale: Adaugă teste individuale cu input/output. Aceste teste sunt mereu vizibile în Subtask-uri, independent de generator.',
        proposeTestsColId: 'ID Test',
        proposeTestsColInput: 'Input',
        proposeTestsColOutput: 'Output',
        proposeTestsColPoints: 'Puncte',
        proposeTestsColActions: 'Acțiuni',
        proposeTestsEmpty: 'Nu ai adăugat niciun test. Fă clic pe butonul de mai jos pentru a adăuga.',
        proposeTestsAddBtn: 'Adaugă Test',
        proposeTestsDeleteTitle: 'Șterge test',
        proposeTestsTotal: 'Total teste:',

        // ─── Propose — Generator Tab ───────────────────────────────────────────────
        generatorTitle: 'Script Generator',
        generatorHideDocs: 'Ascunde Documentație',
        generatorShowDocs: 'Documentație',
        generatorValidating: 'Se validează...',
        generatorValid: 'Script valid!',
        generatorErrorsFound: 'Erori găsite',
        generatorExample: 'Exemplu',
        generatorUpload: 'Încarcă',
        generatorSave: 'Salvează',
        generatorErrorSingular: 'eroare în script',
        generatorErrorPlural: 'erori în script',
        generatorCannotSubmit: 'scriptul nu poate fi trimis',
        generatorSaveHint: 'apasă Salvează după corecții',
        generatorWarningSingular: 'avertisment',
        generatorWarningPlural: 'avertismente',
        generatorSyntaxOk: 'Sintaxă și referințe OK!',
        generatorRuntimeNote:
            'Verificarea de rulare (compilarea generatorului, output valid) se face automat la trimitere prin sandbox.',

        // ─── Error Boundary ───────────────────────────────────────────────────────
        errorBoundaryNewVersion: 'Versiune nouă disponibilă',
        errorBoundarySomethingWrong: 'Ceva a mers prost',
        errorBoundaryChunkMsg:
            'Aplicația a primit un update. Reîncărcăm pagina ca să primești ultima versiune.',
        errorBoundaryGenericMsg:
            'A apărut o eroare neașteptată. Poți reîncerca sau te poți întoarce la pagina principală.',
        errorBoundaryTechnicalDetails: 'Detalii tehnice',
        errorBoundaryReload: 'Reîncarcă pagina',
        errorBoundaryBackHome: 'Înapoi la pagina principală',

        // ─── Common Actions ───────────────────────────────────────────────────────
        cancel: 'Anulează',
        save: 'Salvează',
        delete: 'Șterge',
        edit: 'Editează',
        view: 'Vezi',
        search: 'Caută',
        loading: 'Se încarcă...',
        close: 'Închide',
        confirm: 'Confirmă',
        yes: 'Da',
        no: 'Nu',
        add: 'Adaugă',
        remove: 'Elimină',
        reset: 'Resetează',
        approve: 'Aprobă',
        reject: 'Respinge',
    },

    EN: {
        // ─── Auth / Login ────────────────────────────────────────────────────────
        loginTitle: 'Login',
        registerTitle: 'Sign Up',
        emailLabel: 'Email',
        passwordLabel: 'Password',
        registerBtn: 'Create Account',
        noAccount: "Don't have an account?",
        hasAccount: 'Already have an account?',
        loginBtn: 'Authentication',
        disconnectBtn: 'Logout',
        emailPlaceholder: 'john@fiicoder.com',
        namePlaceholder: 'John',
        surnamePlaceholder: 'Smith',
        nameLabel: 'Name',
        surnameLabel: 'Surname',
        continueAsGuest: 'Continue as Guest',

        // ─── Locale ──────────────────────────────────────────────────────────────
        dateLocale: 'en-US',

        // ─── Navbar ──────────────────────────────────────────────────────────────
        archiveBtn: 'Problems',
        proposeBtn: 'Propose',
        profileBtn: 'Profile',
        adminBtn: 'Admin',
        themeLabel: 'Theme',
        languageLabel: 'Language',
        navSearchPlaceholder: 'Search problem...',
        navGreetingPrefix: 'Hello, ',
        navViewProfile: 'View profile',
        navBackground: 'Background',
        navCorners: 'Corners',
        problemNotFound: 'Problem not found.',
        navCloseMenu: 'Close menu',
        navOpenMenu: 'Open menu',

        // ─── Landing ─────────────────────────────────────────────────────────────
        welcomeTitle: 'Welcome to',
        welcomeDesc:
            'A competitive programming platform for students. Join a class, solve problems, and become a coding master.',
        viewProblems: 'View Problems',
        authenticateBtn: 'Login / Sign Up',
        startBtn: "Let's Begin!",
        readyText: 'Ready to challenge yourself? Pick your level and get started!',
        announcementsTitle: 'Important Announcements',
        newProblems: '1000+ Problems',
        newProblemsDesc: 'From easy to expert, for every skill level',
        classesMentors: 'Classes and Teachers',
        classesMentorsDesc: 'Create classes, work with teachers, and manage homework',
        advancedEditor: 'Advanced Editor',
        advancedEditorDesc: 'Monaco Editor with syntax highlighting for C++, Python, Go...',
        activeStudents: 'Active Students',
        problemsCount: 'Problems',
        contestsCount: 'Accepted Solutions',
        satisfactionRate: 'Satisfaction',
        closeBtn: 'Close',
        showLess: 'Show less',
        showAll: 'View all',
        loadingAnnouncements: 'Loading announcements...',
        announcementReadLabel: 'read',
        noAnnouncements: 'No announcements available.',

        // ─── Problem List ─────────────────────────────────────────────────────────
        problemsTitle: 'Problems',
        noProblemsFound: 'No problems found.',
        easyDifficulty: 'Easy',
        mediumDifficulty: 'Medium',
        hardDifficulty: 'Hard',
        contestDifficulty: 'Contest',
        proposeProblemBtn: 'Propose problem',
        sortDefault: 'Default',
        sortEasyToHard: 'Easy → Hard',
        sortHardToEasy: 'Hard → Easy',
        endOfList: 'End of the list',

        // ─── Filter Sidebar ───────────────────────────────────────────────────────
        filterTitle: 'Filter',
        searchLabel: 'Problem Name',
        difficultyLabel: 'Difficulty',
        allOption: 'All',
        clearFilters: 'Clear Filters',
        filterSearchPlaceholder: 'Problem 3',
        filterTagsError: 'Failed to load tags.',
        filterShowing: 'Showing',
        filterOf: 'out of',
        filterProblemsWord: 'problems',

        // ─── Stats Sidebar ────────────────────────────────────────────────────────
        statsTitle: 'Statistics',
        statSolved: 'Solved',
        statRate: 'Success Rate',
        statStreak: 'Daily Streak',
        statPref: 'Preferred Difficulty',
        topSolvers: 'Top Solvers',
        popularProblems: 'Popular Problems',
        solvedLabel: 'solved',
        attemptsLabel: 'attempts',

        // ─── Tags ────────────────────────────────────────────────────────────────
        tagsLabel: 'Tags',
        noTagsAvailable: 'No tags available.',

        // ─── Problem Details ──────────────────────────────────────────────────────
        submitTitle: 'Submit Solution',
        submitAuthHelpful: 'Log in to submit solutions and track your progress.',
        placeholderCode: 'Type your solution here...',
        evalBtn: 'Submit Solution',
        evalPending: 'Evaluating...',
        backToList: 'Back to the problem list',
        systemEval: 'Evaluation System',
        checking: '> Checking submitted code...',
        success: '> 100 points!',
        resultTab: 'Result',
        submissionsTab: 'Submissions',
        problemLabel: 'Problem: ',
        submitToSeeResults: 'Submit your code to see results.',
        shortcutLabel: 'Shortcut:',
        testsLabel: 'Tests',
        consoleComingSoon: 'Console — coming soon',
        consoleLabel: 'Console',
        resetLayoutTitle: 'Reset layout to default',
        connectingLabel: 'Connecting...',
        systemActiveLabel: 'System Ready',
        submittingLabel: 'Submitting...',
        submitLabel: 'Submit',
        evaluatingPrefix: 'Evaluating... (',
        evaluatingSuffix: ' tests)',

        // ─── Submissions Panel ────────────────────────────────────────────────────
        loginToSeeHistory: 'Log in to see history.',
        noSubmissionsYet: 'No submissions yet.',
        loadMore: 'Load more',
        submissionsLeft: 'left',

        // ─── Submission Detail Modal ──────────────────────────────────────────────
        submissionDetails: 'Submission Details',
        scoreLabel: 'Score',
        pointsLabel: 'points',
        subtasksLabel: 'Subtasks',
        timeLabel: 'Time',
        memoryLabel: 'Memory',
        loadingLabel: 'Loading...',
        evaluatingLabel: 'Evaluating...',
        noResultsAvailable: 'No results available.',
        copyCode: 'Copy code',

        // ─── Classes ─────────────────────────────────────────────────────────────
        classesTitle: 'Classes',
        classesHubTitle: 'Class hub',
        createClassBtn: 'Create class',
        inviteStudentBtn: 'Send invite',
        homeworkTitle: 'Homework',
        openClassBtn: 'Open class',
        myInvitations: 'My invitations',
        activeHomework: 'Active homework',

        // ─── Auth / Login (additional) ───────────────────────────────────────────
        loginBannedMsg: 'Your account has been suspended.',
        loginBannedReason: 'Reason: ',
        loginBannedContact: 'Contact an administrator.',
        loginSuccess: 'Login successful.',
        passwordMismatch: 'Passwords do not match.',
        accountCreated: 'Account created successfully! You can now log in.',
        usernameLabel: 'Username',
        confirmPasswordLabel: 'Confirm password',
        signUpLinkBtn: 'Sign Up',
        loginLinkBtn: 'Login',
        loginOr: 'or',
        connectionError: 'Connection error. Check if the server is running.',

        // ─── ClassesHub ──────────────────────────────────────────────────────────
        classNameRequired: 'Class name is required.',
        classCreatedSuccess: 'Class created successfully!',
        classCreatedShort: 'Class created.',
        classCreateError: 'Error creating class.',
        classIdRequired: 'Enter a valid ID.',
        classAccessDeniedInvite: 'You do not have access to this class. Ask the creator for an invitation.',
        classAccessDeniedLong: 'You do not have access to this class. You must be a member, creator, or admin.',
        classNotFoundMsg: 'Class not found.',
        classLookupError: 'Error looking up class.',
        invitationAccepted: 'Invitation accepted!',
        invitationAcceptedMsg: 'Invitation accepted.',
        invitationDeclined: 'Invitation declined.',
        invitationDeclinedMsg: 'Invitation declined.',
        invitationAcceptError: 'Error accepting.',
        invitationDeclineError: 'Error declining.',
        noRecentClasses: 'No recent classes yet. Create or search a class and it will appear here.',
        noDescription: 'No description.',
        createdByLabel: 'Created by',
        membersLabel: 'Members',
        noActiveInvitations: 'You have no active invitations.',
        invitationsServerError: 'Server error while fetching invitations.',
        invitedClassFallback: 'Invited class',
        statusLabel: 'Status',
        acceptBtn: 'Accept',
        declineBtn: 'Decline',
        goToProblems: 'Go to problems',
        createClassSection: 'Create a class',
        classNamePlaceholder: 'Class name',
        classOptionalDesc: 'Optional description',
        findClassSection: 'Find a class',
        classUuidPlaceholder: 'Class UUID',
        recentClassesSection: 'Recent classes',
        clearBtn: 'Clear',
        myGroupsSection: 'My groups',
        copyLinkTitle: 'Copy class link',
        linkCopied: 'Link copied!',
        membersCount: 'members',
        openBtn: 'Open',
        noMyGroups: 'You are not part of any group. Create one or accept an invitation.',

        // ─── ClassDetails ─────────────────────────────────────────────────────────
        hwLoadError: 'Load error.',
        hwPublishedFeedback: 'Published!',
        hwPublishedMsg: 'Homework published.',
        hwDeleteConfirm: 'Delete homework?',
        hwDeletedMsg: 'Homework deleted.',
        hwUpdatedFeedback: 'Updated!',
        hwUpdatedMsg: 'Homework updated.',
        hwItemsRemovedMsg: 'Items removed.',
        hwHideBtn: 'Hide',
        hwDetailsBtn: 'Details',
        hwPublishBtn: 'Publish',
        hwProblemsLabel: 'Problems',
        hwStudentsLabel: 'Users:',
        hwSubmissionsLabel: 'Submissions:',
        hwAddSection: 'Add',
        hwRemoveSection: 'Remove',
        hwStudentProgressTitle: 'Student Progress',
        hwStudentCol: 'Student',
        hwAvgScoreCol: 'Avg Score',
        hwStatusDone: 'DONE',
        hwStatusWorking: 'WORKING',
        hwStatusIdle: 'IDLE',
        hwProgressDetailsLabel: 'Progress details:',
        hwAvgScoreShort: 'Avg score:',
        hwAttemptsShort: 'try',
        hwAttemptedProblems: 'attempted problems',
        classLabel: 'Class',
        deleteClassBtn: 'Delete class',
        backBtn: 'Back',
        detailsSection: 'Details',
        descriptionLabel: 'Description',
        inviteMembersTitle: 'Invite members',
        inviteEmailPlaceholder: 'Emails (comma or newline separated)',
        inviteBtn: 'Invite',
        sendingBtn: 'Sending...',
        newHomeworkSection: 'New homework',
        hwTitlePlaceholder: 'Title',
        hwInitialOptional: 'Initial setup (optional)',
        hwUsersPlaceholder: 'Users (user1, user2)',
        hwProblemsPlaceholder: 'Problems (p1, p2)',
        createBtn: 'Create',
        classMembersSection: 'Class members',
        teacherLabel: 'Teacher',
        noStudentsYet: 'No students in this class yet.',
        kickBtn: 'Kick',
        homeworkSection: 'Homework',
        homeworkItems: 'items',
        noHomeworkYet: 'No homework yet. Create one above.',
        studentRemoved: 'Student removed.',
        studentRemoveError: 'Failed to remove student.',
        classDeleted: 'Class deleted.',
        classDeleteError: 'Delete failed.',
        hwCreatedFeedback: 'Created!',
        hwCreatedMsg: 'Homework created.',
        inviteAdminError: 'Admin accounts cannot be invited.',
        inviteAlreadyMember: 'Already a member.',
        invitePendingError: 'Invitation already pending.',

        // ─── Profile ──────────────────────────────────────────────────────────────
        profileStatsTitle: 'Statistics',
        communityStats: 'Community Stats',
        totalSubmissions: 'Total Submissions',
        acceptanceRate: 'Acceptance Rate',
        dailyStreak: 'Daily Streak',
        streakCapped: 'Capped',
        languagesLabel: 'Languages',
        languagesEmpty: 'Solve at least 5 problems in the same language to appear here.',
        skillsLabel: 'Skills',
        skillsEmpty: 'Solve problems sharing the same tags to build your skill profile.',
        memberSince: 'Joined',
        roleLabel: 'Role',
        roleStudent: 'Student',
        roleProfessor: 'Professor',
        roleAdmin: 'Admin',
        changePhoto: 'Change\nphoto',
        changePhotoOnGravatar: 'Change photo on Gravatar',
        noAchievementsYet: 'No achievements yet',
        problemsSolvedLabel: 'Problems Solved',
        monthlyActivity: 'Monthly Activity',
        recentSubmissions: 'Recent Submissions',
        noRecentSubmissions: 'No recent submissions.',
        heatmapLess: 'Less',
        heatmapMore: 'More',
        profileSolvedLabel: 'Solved',
        profileSubmissionsLabel: 'Submissions',
        profileAcceptanceLabel: 'Acceptance',
        profileStreakLabel: 'Streak',
        performanceEasy: 'Easy',
        performanceMedium: 'Medium',
        performanceHard: 'Hard',
        weekDays: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
        profileLoading: 'Loading profile...',
        profileError: 'Could not load profile. Please try again.',
        profileUnavailable: 'Profile is currently unavailable.',
        profileTitle: 'Profile',
        profileTabOverview: 'Overview',
        profileAdminDashboard: 'Admin Dashboard',
        proposalDeleted: 'Proposal deleted.',
        proposalDeleteError: 'Failed to delete proposal.',
        visibilityUpdated: 'Visibility updated.',
        visibilityUpdateError: 'Failed to update visibility.',

        // ─── Profile Achievements ─────────────────────────────────────────────────
        achievementsTitle: 'Achievements',
        achievementsUnlockedCount: 'unlocked',
        achievementsProgress: 'Overall progress',
        achievementsUnlockedSection: 'Unlocked',
        achievementsLockedSection: 'Locked',

        // ─── Profile Homework Panel ────────────────────────────────────────────────
        hwDeadlineLabel: 'Deadline:',
        hwProgress: 'Progress',
        hwCompleted: 'Completed',
        hwOverdue: 'Overdue',
        hwNoAssigned: 'You have no assigned homework.',

        // ─── Profile Proposals Panel ───────────────────────────────────────────────
        myProposals: 'My Proposals',
        proposalHowItWorks: 'How it works:',
        proposalNoProposals: "You haven't submitted any proposals yet.",
        proposalMakePrivate: 'Make private',
        proposalMakePublic: 'Make public',
        proposalStatusChecked: 'checked',
        proposalCheckedTooltip: 'Auto-checked by backend. Awaiting admin approval.',
        proposalDeleteConfirmPrefix: 'Are you sure you want to delete',
        proposalDeleteConfirmSuffix: 'This cannot be undone.',
        proposalView: 'View',
        proposalEdit: 'Edit',
        proposalDelete: 'Delete',
        proposalEditUnavailableTooltip:
            'Editing existing proposals is currently unavailable. Use "Propose" to submit a new version.',

        // ─── Profile Homework Panel ────────────────────────────────────────────────
        homeworkPanelTitle: 'My Homework',

        // ─── Admin Panel ──────────────────────────────────────────────────────────
        adminPanelTitle: 'Admin Panel',
        adminOpenOverview: 'Open Overview',
        adminTabUsers: 'Users',
        adminTabProblems: 'Problems',
        adminTabTags: 'Tags',
        adminTabAnnouncements: 'Announcements',
        adminTabGroups: 'Groups',
        adminTabAudit: 'Audit Log',

        // ─── Admin Sidebar (Overview) ──────────────────────────────────────────────
        adminOverviewTitle: 'Overview',
        adminLiveStats: 'LIVE STATISTICS',
        adminStatUsers: 'Users',
        adminStatProblems: 'Problems',
        adminStatSubmissions: 'Submissions',
        adminStatClasses: 'Classes',
        adminStatHomework: 'Homework',
        adminStatProposals: 'Proposals',

        // ─── Admin Audit Log Tab ───────────────────────────────────────────────────
        auditLogTitle: 'Audit Log',
        auditLogUser: 'User:',

        // ─── Admin User Tab ────────────────────────────────────────────────────────
        userMgmtTitle: 'User Management',
        userRoleStudent: 'STUDENT',
        userRoleProfessor: 'PROFESSOR',
        userRoleAdmin: 'ADMIN',
        userBanBtn: 'Ban',
        userUnbanBtn: 'Unban',
        userDeleteBtn: 'Delete',
        userBanReasonLabel: 'Reason:',

        // ─── Admin Announcements Tab ───────────────────────────────────────────────
        announcementsTabTitle: 'Platform Announcements',
        announcementTitleLabel: 'Announcement Title',
        announcementContentLabel: 'Content',
        announcementTitlePlaceholder: 'Enter title...',
        announcementCancel: 'Cancel',
        announcementSave: 'Save Announcement',
        announcementTranslateBtn: 'Translate to EN',

        // ─── Admin Tags Tab ────────────────────────────────────────────────────────
        tagMgmtTitle: 'Tag Management',
        tagEditLabel: 'Edit Tag',
        tagAddLabel: 'Add New Tag',
        tagNamePlaceholder: 'Tag name (ex: Graphs)',
        tagSaveBtn: 'Save',
        tagAddBtn: 'Add',
        tagCancelBtn: 'Cancel',
        tagSearchPlaceholder: 'Search tag by exact title...',
        tagSearchBtn: 'Search',
        tagNotFound: 'No tag found.',

        // ─── Admin Groups Tab ──────────────────────────────────────────────────────
        groupMgmtTitle: 'Group Management',
        groupSearchByName: 'Search by name...',
        groupCreatorPlaceholder: 'Creator (username)',
        groupCreatedAfter: 'Created after',
        groupCreatedBefore: 'Created before',
        groupTotal: 'Total',
        groupSort: 'Sort',
        groupSortNewest: 'Newest first',
        groupSortOldest: 'Oldest first',
        groupSortNameAZ: 'Name A–Z',
        groupSortNameZA: 'Name Z–A',
        groupResetFilters: 'Reset filters',
        groupAvailable: 'Available groups',
        groupLoading: 'Loading groups...',
        groupNone: 'No groups found.',
        groupSelectToSee: 'Select a group to see details.',
        groupLoadingDetails: 'Loading group details...',
        groupCreatorLabel: 'Creator',
        groupMembersLabel: 'members',
        groupOpenClass: 'Open class',
        groupDelete: 'Delete',
        groupMembersTitle: 'Members',
        groupMembersLoading: 'Loading members...',
        groupTeacherLabel: 'Teacher',
        groupNoStudents: 'No students.',
        groupRemoveMember: 'Remove',
        groupPendingInvitations: 'Pending invitations',
        groupInvitationsLoading: 'Loading invitations...',
        groupNoPendingInvitations: 'No pending invitations.',
        groupRefreshing: 'Refreshing details...',

        // ─── Admin Proposals Tab ───────────────────────────────────────────────────
        problemMgmtTitle: 'Problem Management',
        proposalsPending: 'Pending',
        proposalsAccepted: 'Accepted',
        proposalStatusCheckedBadge: 'CHECKED',
        proposalStatusCheckedDesc: 'Auto-checked by backend. Awaiting your review.',
        proposalStatusPendingBadge: 'PENDING',
        proposalStatusPendingDesc: 'Not yet auto-checked by backend.',
        proposalsPendingList: 'Pending proposals',
        proposalPendingWord: 'pending',
        proposalCheckedWord: 'checked',
        proposalNoPending: 'There are no pending proposals.',
        proposalByLabel: 'By',
        proposalLoadingDetails: 'Loading proposal details...',
        proposalSelectToSee: 'Select a proposal to see the details.',
        proposalTestsLabel: 'Tests',
        proposalTestsLoading: 'Loading tests...',
        proposalNoTests: 'No tests generated for this proposal.',
        proposalDeleteBtn: 'Delete',
        proposalRejectBtn: 'Reject',
        proposalApproveBtn: 'Approve',
        acceptedProblemsTitle: 'Accepted problems (public)',
        acceptedLoading: 'Loading...',
        acceptedNone: 'No accepted problems.',
        visibilityPublic: 'Public',
        visibilityPrivate: 'Private',
        makePrivateBtn: 'Make private',
        makePublicBtn: 'Make public',

        // ─── Propose Problem ──────────────────────────────────────────────────────
        proposePageTitle: 'Propose a Problem',
        proposeEditTitle: 'Edit Proposal',
        proposeTabGeneral: 'General',
        proposeTabStatement: 'Statement',
        proposeTabFiles: 'Files',
        proposeTabTests: 'Manual Tests',
        proposeTabGenerator: 'Generator Script',
        proposeLoading: 'Loading proposal...',
        proposeEditMode: 'Edit mode',
        proposeEditModeDescPrefix: 'Editing problem',
        proposeEditModeDescSuffix: 'Metadata changes apply immediately; changing the files triggers verification again.',
        proposeNewProposal: '← New Proposal',
        proposeDraftBanner: 'You have a saved draft. Do you want to restore it?',
        proposeDraftRestore: 'Restore',
        proposeDraftDiscard: 'Discard',
        // proposeNoteRO / proposeNoteEN: handled inline in ProposeProblem.tsx (JSX spans)
        proposeSuccessUpdated: 'Proposal updated successfully!',
        proposeSuccessChecked: 'Proposal auto-checked! Awaiting admin approval.',
        proposeSuccessSubmitted:
            'Your proposal was submitted successfully! You will be notified when it is reviewed.',
        proposePendingReview:
            'Submitted. Automated check is still in progress — check "My Proposals" in a moment.',
        proposeVerifying: 'ZIP uploaded. Running automated check... (max ~20s)',
        proposeImporting: 'Importing...',
        proposeImportZip: 'Import ZIP',
        proposeExportZip: 'Export ZIP',
        proposeReset: 'Reset',
        proposeSubmitting: 'Submitting...',
        proposeUpdateBtn: 'Update Proposal',
        proposeSubmitBtn: 'Submit Proposal',

        // ─── Propose — General Tab ────────────────────────────────────────────────
        proposeTitleLabel: 'Title',
        proposeTitlePlaceholder: 'Descriptive problem title',
        proposeDifficultyLabel: 'Difficulty Level',
        proposeDifficultyPlaceholder: 'Choose difficulty',
        proposeDifficultyEasy: 'Easy',
        proposeDifficultyMedium: 'Medium',
        proposeDifficultyHard: 'Hard',
        proposeDifficultyContest: 'Contest',
        proposeTimeLimitLabel: 'Time Limit (s)',
        proposeMemoryLimitLabel: 'Memory Limit (MB)',
        proposeInteractiveLabel: 'Interactive Problem',
        proposeInteractiveDesc:
            'Enable if the problem requires an interactor (bidirectional communication with the solution).',
        proposeInteractiveAriaLabel: 'Toggle problem interactor',
        proposeTagsLabel: 'Tags',
        proposeTagsPlaceholder: 'Type to search tags...',
        proposeTagsHelper: 'Select from the list of existing tags.',
        proposeTip: 'Tip: Choose limits that are realistic for your problem. A time limit that is too small may frustrate users.',
        proposePreviewTitle: 'Preview:',
        proposePreviewTitleField: 'Title:',
        proposePreviewDifficulty: 'Difficulty:',
        proposePreviewLimits: 'Time/Memory:',
        proposePreviewTags: 'Tags:',
        proposePreviewVisibilityNote:
            'All proposals are private at submission. Visibility can be changed from your profile after admin approval.',

        // ─── Propose — Statement Tab ───────────────────────────────────────────────
        proposeHidePreview: 'Hide Preview',
        proposeShowPreview: 'Show Preview',
        proposeInsertExample: 'Example',
        proposeTranslating: 'Translating...',
        proposeAutoTranslate: 'Auto-Translate to EN',
        proposeFormatRequired: 'Required format',
        proposeFormatDesc: 'The statement must follow the exact template structure.',
        proposeStatementLabel: 'Statement',
        proposePreviewLabel: 'Preview',
        proposeMarkdownHelper: 'Use Markdown for formatting. You can also use LaTeX with $...$ for equations.',
        proposePreviewPlaceholder: '*Your statement will appear here...*',
        proposeStatementRequired: 'Statement is required',

        // ─── Propose — Tests Tab ──────────────────────────────────────────────────
        proposeTestsInfo: 'Manual Tests: Add individual tests with input/output. These tests are always visible in Subtasks, independent of the generator.',
        proposeTestsColId: 'Test ID',
        proposeTestsColInput: 'Input',
        proposeTestsColOutput: 'Output',
        proposeTestsColPoints: 'Points',
        proposeTestsColActions: 'Actions',
        proposeTestsEmpty: 'No tests added yet. Click the button below to add one.',
        proposeTestsAddBtn: 'Add Test',
        proposeTestsDeleteTitle: 'Delete test',
        proposeTestsTotal: 'Total tests:',

        // ─── Propose — Generator Tab ───────────────────────────────────────────────
        generatorTitle: 'Script Generator',
        generatorHideDocs: 'Hide Documentation',
        generatorShowDocs: 'Documentation',
        generatorValidating: 'Validating...',
        generatorValid: 'Script valid!',
        generatorErrorsFound: 'Errors found',
        generatorExample: 'Example',
        generatorUpload: 'Upload',
        generatorSave: 'Save',
        generatorErrorSingular: 'error in script',
        generatorErrorPlural: 'errors in script',
        generatorCannotSubmit: 'script cannot be submitted',
        generatorSaveHint: 'press Save after corrections',
        generatorWarningSingular: 'warning',
        generatorWarningPlural: 'warnings',
        generatorSyntaxOk: 'Syntax and references OK!',
        generatorRuntimeNote:
            'Runtime check (generator compilation, valid output) is performed automatically at submission via sandbox.',

        // ─── Error Boundary ───────────────────────────────────────────────────────
        errorBoundaryNewVersion: 'New version available',
        errorBoundarySomethingWrong: 'Something went wrong',
        errorBoundaryChunkMsg:
            'The app received an update. Reloading the page to get the latest version.',
        errorBoundaryGenericMsg:
            'An unexpected error occurred. You can retry or go back to the home page.',
        errorBoundaryTechnicalDetails: 'Technical details',
        errorBoundaryReload: 'Reload page',
        errorBoundaryBackHome: 'Back to home page',

        // ─── Common Actions ───────────────────────────────────────────────────────
        cancel: 'Cancel',
        save: 'Save',
        delete: 'Delete',
        edit: 'Edit',
        view: 'View',
        search: 'Search',
        loading: 'Loading...',
        close: 'Close',
        confirm: 'Confirm',
        yes: 'Yes',
        no: 'No',
        add: 'Add',
        remove: 'Remove',
        reset: 'Reset',
        approve: 'Approve',
        reject: 'Reject',
    },
};

// ─── Difficulty helpers ─────────────────────────────────────────────────────

const difficultyKeyByValue: Record<
    Difficulty,
    'easyDifficulty' | 'mediumDifficulty' | 'hardDifficulty' | 'contestDifficulty'
> = {
    EASY: 'easyDifficulty',
    MEDIUM: 'mediumDifficulty',
    HARD: 'hardDifficulty',
    CONTEST: 'contestDifficulty',
};

export function getDifficultyLabel(lang: Language, difficulty: Difficulty) {
    return translations[lang][difficultyKeyByValue[difficulty]];
}

/** Maps lowercase propose-form difficulty values to their display labels */
export function getProposeDifficultyLabel(
    lang: Language,
    difficulty: 'easy' | 'medium' | 'hard' | 'contest',
): string {
    const map = {
        easy: translations[lang].proposeDifficultyEasy,
        medium: translations[lang].proposeDifficultyMedium,
        hard: translations[lang].proposeDifficultyHard,
        contest: translations[lang].proposeDifficultyContest,
    } as const;
    return map[difficulty];
}

// ─── Parametrized string helpers ────────────────────────────────────────────

/** "Ești sigur că vrei să ștergi „{title}"? ..." / "Are you sure you want to delete "{title}"? ..." */
export function getDeleteConfirmMsg(lang: Language, title: string): string {
    const t = translations[lang];
    return lang === 'RO'
        ? `${t.proposalDeleteConfirmPrefix} „${title}"? ${t.proposalDeleteConfirmSuffix}`
        : `${t.proposalDeleteConfirmPrefix} "${title}"? ${t.proposalDeleteConfirmSuffix}`;
}

/** "Editezi problema {id}. ..." / "Editing problem {id}. ..." */
export function getEditModeDesc(lang: Language, proposalId: string): string {
    const t = translations[lang];
    return `${t.proposeEditModeDescPrefix} ${proposalId}. ${t.proposeEditModeDescSuffix}`;
}

/** "{n} rămase" / "{n} left" — for load-more button */
export function getLoadMoreLabel(lang: Language, remaining: number): string {
    const t = translations[lang];
    return `${t.loadMore} (${remaining} ${t.submissionsLeft})`;
}

/** "{n} eroare/erori în script" / "{n} error/errors in script" */
export function getGeneratorErrorLabel(lang: Language, count: number): string {
    const t = translations[lang];
    const word = count === 1 ? t.generatorErrorSingular : t.generatorErrorPlural;
    return `${count} ${word}`;
}

/** "{n} avertisment/avertismente" / "{n} warning/warnings" */
export function getGeneratorWarningLabel(lang: Language, count: number): string {
    const t = translations[lang];
    const word = count === 1 ? t.generatorWarningSingular : t.generatorWarningPlural;
    return `${count} ${word}`;
}

/** "Evaluare... (N teste)" / "Evaluating... (N tests)" */
export function getEvaluatingLabel(lang: Language, count: number): string {
    const t = translations[lang];
    return `${t.evaluatingPrefix}${count}${t.evaluatingSuffix}`;
}

/** "N invitație trimisă / N invitații trimise" / "N invitation sent / N invitations sent" */
export function getInvitesSentMsg(lang: Language, count: number): string {
    if (lang === 'RO') {
        return `${count} invitație${count > 1 ? ' trimise' : ' trimisă'}.`;
    }
    return `${count} invitation${count > 1 ? 's' : ''} sent.`;
}

/** "Invitații în așteptare (N)" / "Pending invitations (N)" */
export function getPendingInvitationsTitle(lang: Language, count: number): string {
    if (lang === 'RO') return `Invitații în așteptare (${count})`;
    return `Pending invitations (${count})`;
}

/** Confirm dialog for removing a student */
export function getRemoveStudentConfirm(lang: Language, username: string): string {
    if (lang === 'RO') return `Elimini studentul "${username}" din clasă?`;
    return `Remove student "${username}" from this class?`;
}

/** Confirm dialog for deleting a class */
export function getDeleteClassConfirm(lang: Language, name: string): string {
    if (lang === 'RO') return `Sigur vrei să ștergi clasa "${name}"? Această acțiune este ireversibilă.`;
    return `Delete class "${name}"? This action cannot be undone.`;
}

/** "Afișate N din M probleme" / "Showing N out of M problems" */
export function getFilterCountLabel(lang: Language, shown: number, total: number): string {
    const t = translations[lang];
    return `${t.filterShowing} ${shown} ${t.filterOf} ${total} ${t.filterProblemsWord}`;
}

/** "Contul tău a fost suspendat. Motiv: {reason} Contactează un administrator." */
export function getBannedMsg(lang: Language, reason?: string | null): string {
    const t = translations[lang];
    const reasonPart = reason ? ` ${t.loginBannedReason}${reason}` : '';
    return `${t.loginBannedMsg}${reasonPart} ${t.loginBannedContact}`;
}

// ─── Context ────────────────────────────────────────────────────────────────

interface LanguageContextType {
    lang: Language;
    setLang: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType>({
    lang: 'RO',
    setLang: () => {},
});

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [lang, setLang] = useState<Language>('RO');

    return (
        <LanguageContext.Provider value={{ lang, setLang }}>{children}</LanguageContext.Provider>
    );
}

export function useLanguage() {
    return useContext(LanguageContext);
}

/** Convenience hook — returns the full translation object for the current language */
export function useT() {
    const { lang } = useLanguage();
    return translations[lang];
}
