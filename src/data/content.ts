// All page copy and destinations, in English and French, taken from the careers.un.org home page
// (?language=en and ?language=fr), its pop-up dialogs and the official Job Openings page.
// Text is reproduced verbatim. Where the official French site keeps English (for example the
// Consultancies/Internships dialog labels), so does this file. The few strings that exist on
// neither site are marked "Concept-only" below.

export type Lang = 'en' | 'fr';

export const OFFICIAL = 'https://careers.un.org';

/** Official job search deep link. The portal reads its filters from a URL-encoded JSON `data` param. */
export function officialSearchUrl(
  filters: { keyword?: string; ds?: string[]; jn?: string[]; jc?: string[] } = {},
  lang: Lang = 'en',
) {
  const base = `${OFFICIAL}/jobopening?language=${lang}`;
  const clean = Object.fromEntries(
    Object.entries(filters).filter(([, v]) => (Array.isArray(v) ? v.length > 0 : Boolean(v))),
  );
  if (Object.keys(clean).length === 0) return base;
  return `${base}&data=${encodeURIComponent(encodeURI(JSON.stringify(clean)))}`;
}

export const jobDetailUrl = (jobId: number | string, lang: Lang = 'en') =>
  `${OFFICIAL}/jobSearchDescription/${jobId}?language=${lang}`;

export const WORKFORCE_VIDEO = 'https://careers.un.org/media/home/files-1751253405544.mp4';

/** Featured markers on the location globe: the duty stations named on the home page plus main offices. */
export const featuredHubs = [
  'NEWYORK',
  'Geneva',
  'VIENNA',
  'NAIROBI',
  'ADDISABABA',
  'BANGKOK',
  'SANTIAGO',
  'BEIRUT',
  'BONN',
  'ENTEBBE',
  'BRINDISI',
  'JUBA',
];

export type SearchBy = {
  id: string;
  label: string;
  emphasis: string;
  question: string;
  image: string;
  alt: string;
  caption: string[];
  href: string;
  focus: { lat: number; lng: number };
  hubs: string[];
};

export type ExploreCard = {
  title: string;
  body: string;
  icon: string;
  iconAlt: string;
  href?: string;
  dialog?: 'roster' | 'joinUs' | 'consultancies' | 'internships';
};

type RichLine = string | { before: string; link: string; href: string; after: string };

export type Content = ReturnType<typeof buildContent>;

function buildContent(lang: Lang) {
  const fr = lang === 'fr';
  const page = (route: string) => `${OFFICIAL}/${route}?language=${lang}`;
  const un = (path: string) => `https://www.un.org/${lang}/${path}`;

  const links = {
    home: page('home'),
    jobs: page('jobopening'),
    workforce: page('work-force'),
    payBenefits: page('payandbenefits'),
    careerJourneys: page('career-development'),
    careerOptions: page('job-level'),
    howToApply: page('how-to-apply'),
    expertise: page('area-of-expertise'),
    ypp: page('young-professionals-programme'),
    languageExams: page('competitive-examinations-for-language-position'),
    talentPool: fr
      ? 'https://inspira.un.org/psc/REGISTER/EMPLOYEE/HRMS/c/UN_SKILL_REG.UN_SKILL_REG.GBL?pool=UNS&langcd=FRA'
      : 'https://inspira.un.org/psc/REGISTER/EMPLOYEE/HRMS/c/UN_SKILL_REG.UN_SKILL_REG.GBL&languagecd=ENG',
    volunteer: 'https://www.unv.org/opportunities',
    unSystem: 'https://onehr.un.org/united-nation-job/#/home',
    earlyCareers: page('un-entities'),
    globalRosterGjos: officialSearchUrl({ jc: ['P'] }, lang),
    // The home page's Consultancies/Internships dialogs link to the English search in both languages.
    consultancies: officialSearchUrl({ jc: ['CON'] }, 'en'),
    internships: officialSearchUrl({ jc: ['INT'] }, 'en'),
    unHome: un(''),
    contact: `https://careers.un.org/contactus/search/ExternalContactus?lang=${fr ? 'FR' : 'EN'}`,
  };

  return {
    lang,
    links,
    ui: {
      skip: 'Skip to main content',
      applyNow: fr ? 'Postulez' : 'Apply Now',
      menu: 'Menu',
      close: 'Close',
      searchJobs: fr ? 'Recherchez des postes' : 'Search Jobs',
      searchByKeyword: 'Search By keyword',
      placeholder: fr ? 'Saisissez un mot-clé ou un lieu' : 'Enter keyword(s) or location',
      scrollToMain: 'Scroll to main content',
      previousSlide: 'Previous slide',
      nextSlide: 'next slide',
      seeMore: 'See More',
      languages: { en: 'English', fr: 'Français' },
      // Concept-only: the official site has no equivalent for these.
      concept: 'Concept',
      conceptNotice: fr
        ? 'Concept de design. Ce site n’est pas un site officiel de l’Organisation des Nations Unies. Site officiel :'
        : 'Design concept. Not an official United Nations website. Official site:',
      credits: fr ? 'Crédits' : 'Credits',
      opensInNewTab: (host: string) => (fr ? `(ouvre ${host} dans un nouvel onglet)` : `(opens ${host} in a new tab)`),
    },
    brand: {
      descriptor: fr ? 'Carrières' : 'Careers',
      label: fr ? 'Nations Unies Carrières' : 'United Nations Careers',
      logo: fr ? '/brand/un-logo-reverse-fr.svg' : '/brand/un-logo-reverse.svg',
    },
    nav: fr
      ? [
          { label: 'Le personnel de l’ONU', href: links.workforce },
          { label: 'Rémunération et prestations', href: links.payBenefits },
          { label: 'Parcours professionnels', href: links.careerJourneys },
          { label: 'Possibilités de carrière', href: links.careerOptions },
          { label: 'Modalités de candidature', href: links.howToApply },
        ]
      : [
          { label: 'The UN Workforce', href: links.workforce },
          { label: 'Pay and Benefits', href: links.payBenefits },
          { label: 'Career Journeys', href: links.careerJourneys },
          { label: 'Career Options', href: links.careerOptions },
          { label: 'How to Apply', href: links.howToApply },
        ],
    hero: fr
      ? { before: 'Travaillez p', after: 'ur', line2: 'L’Organisation des Nations Unies', label: 'Travaillez pour l’Organisation des Nations Unies' }
      : { before: 'W', after: 'rk', line2: 'for the United Nations', label: 'Work for the United Nations' },
    searchBy: [
      {
        id: 'location',
        label: fr ? 'Recherchez par' : 'Search by',
        emphasis: fr ? 'Emplacement' : 'Location',
        question: fr ? 'Où aimeriez-vous travailler ?' : 'Where would you like to work?',
        image: '/home/location-jiwon-kim.webp',
        alt: fr ? 'Une femme souriante avec le logo de l’ONU derrière elle' : 'A woman is smiling in front of the UN emblem',
        // "Headquarters" is misspelled ("Headquaters") on the live English page; corrected here.
        caption: fr
          ? ['Jiwon Kim, Fonctionnaire associée des ressources humaines', 'Siège de l’ONU, New York']
          : ['Jiwon Kim, Associate Human Resources Officer', 'UN Headquarters, New York'],
        href: '#presence',
        focus: { lat: 38, lng: -40 },
        hubs: ['NEWYORK', 'Geneva', 'VIENNA', 'NAIROBI', 'SANTIAGO', 'ADDISABABA'],
      },
      {
        id: 'expertise',
        label: fr ? 'Recherchez par' : 'Search by',
        emphasis: 'Expertise',
        question: fr ? 'Qu’aimeriez-vous faire ?' : 'What would you like to do?',
        image: '/home/expertise-alexander-kiselinchev.webp',
        alt: fr
          ? 'Un homme en costume devant des arbres et un immeuble de bureaux'
          : 'A man in a suit in front of trees and an office building.',
        // "la crime" on the live French page is corrected to "le crime".
        caption: fr
          ? ['Alexander Kiselinchev, Administrateur chargé de la gestion de programme,', 'Office des Nations Unies contre la drogue et le crime, Vienne']
          : ['Alexander Kiselinchev, Programme Management Officer,', 'United Nations Office on Drugs and Crime, Vienna'],
        href: links.expertise,
        focus: { lat: 35, lng: 30 },
        hubs: ['VIENNA', 'Geneva', 'NAIROBI', 'ADDISABABA', 'BEIRUT', 'BANGKOK'],
      },
    ] satisfies SearchBy[],
    jobs: {
      heading: fr ? 'Recherchez des postes' : 'Search Jobs',
      dutyStation: fr ? 'Lieu d’affectation' : 'Duty Station',
      jobNetwork: fr ? 'Réseau d’emploi' : 'Job Network',
      category: fr ? 'Catégorie' : 'Category',
      clearFilters: fr ? 'Supprimer les filtres' : 'Clear Filters',
      results: fr ? 'Postes vacants' : 'Job Openings',
      found: (n: string) => (fr ? `(${n} avis de vacance trouvés)` : `(${n} Jobs found)`),
      viewDescription: fr ? 'Consulter la description du poste' : 'View Job Description',
      fields: fr
        ? {
            id: 'Référence',
            network: 'Réseau d’emplois',
            family: 'Famille d’emplois',
            categoryAndLevel: 'Catégorie et classe',
            // The live page spells this "Type de recruitment"; corrected here.
            recruitmentType: 'Type de recrutement',
            dutyStation: 'Lieu d’affectation',
            department: 'Département/Bureau',
            posted: 'Date de publication',
            deadline: 'Date limite de candidature',
          }
        : {
            id: 'Job ID',
            network: 'Job Network',
            family: 'Job Family',
            categoryAndLevel: 'Category and Level',
            recruitmentType: 'Recruitment Type',
            dutyStation: 'Duty Station',
            department: 'Department/Office',
            posted: 'Date Posted',
            deadline: 'Deadline',
          },
    },
    presence: {
      label: fr ? 'Recherchez par' : 'Search by',
      emphasis: fr ? 'Emplacement' : 'Location',
      question: fr ? 'Où aimeriez-vous travailler ?' : 'Where would you like to work?',
    },
    workforce: {
      title: fr
        ? 'Rejoignez une équipe issue du monde entier, au service du monde entier.'
        : 'Become part of a workforce of the world, for the world.',
      poster: '/home/video-poster.webp',
      video: WORKFORCE_VIDEO,
    },
    updates: {
      announcements: fr ? 'Avis et annonces' : 'Announcements',
      // The French site has no empty-state text, so the block is hidden there when empty.
      announcementsEmpty: fr ? null : 'No announcements have been posted yet',
      news: fr ? 'Actualités' : 'Latest News',
    },
    spotlight: {
      heading: fr ? 'Pleins feux sur notre personnel' : 'Staff in the Spotlight',
      items: fr ? spotlightFr : spotlightEn,
    },
    explore: {
      keepExploring: fr ? 'Poursuivre l’exploration' : 'Keep Exploring',
      latest: fr ? 'Nouvelles possibilités d’emploi' : 'Latest Opportunities',
      keepCards: (fr
        ? [
            { title: 'Programme Jeunes administrateurs', body: 'Découvrez cette initiative de recrutement à l’intention de jeunes actifs qui aspirent à une carrière à l’ONU', icon: '/home/icon-ypp.webp', iconAlt: 'Programme Jeunes administrateurs', href: links.ypp },
            { title: 'Exercices de constitution de listes', body: 'En savoir plus sur les offres d’emploi génériques', icon: '/home/icon-roster.svg', iconAlt: 'Exercices de constitution de listes', dialog: 'roster' },
            { title: 'Concours de recrutement de personnel linguistique', body: 'Découvrez les possibilités de recrutement pour les professionnels des langues', icon: '/home/icon-ypp.webp', iconAlt: 'Concours de recrutement de personnel linguistique', href: links.languageExams },
            { title: 'Intégrez notre vivier de talents', body: 'Inscrivez-vous pour recevoir des alertes concernant de futurs recrutements', icon: '/home/icon-talent-pool.webp', iconAlt: 'Tell us about your skills and experience', href: links.talentPool },
            { title: 'Rejoignez-nous !', body: 'Nous nous employons à renforcer la diversité de nos équipes. Découvrez si votre pays figure sur la liste des pays sous-représentés ou non représentés.', icon: '/home/icon-join-us.svg', iconAlt: 'Join Us', dialog: 'joinUs' },
          ]
        : [
            { title: 'Young Professionals Programme', body: 'Learn about an international civil service career with the UN Secretariat', icon: '/home/icon-ypp.webp', iconAlt: 'Young Professionals Programme', href: links.ypp },
            { title: 'Roster Exercises', body: 'Learn more about Generic Job Openings', icon: '/home/icon-roster.svg', iconAlt: 'Roster Exercises', dialog: 'roster' },
            { title: 'Competitive Examinations for Language Positions', body: 'Learn about opportunities for language professionals', icon: '/home/icon-ypp.webp', iconAlt: 'Competitive Examinations for Language Positions', href: links.languageExams },
            { title: 'Join our Global Talent Pool', body: 'Stay in touch by subscribing to the UN Global Talent Pool to receive email notifications for job vacancies, career events, and more!', icon: '/home/icon-talent-pool.webp', iconAlt: 'Tell us about your skills and experience', href: links.talentPool },
            { title: 'Join Us!', body: 'The UN Secretariat is building a diverse workforce. Find out if your country is on the un- and under-represented list.', icon: '/home/icon-join-us.svg', iconAlt: 'Join us', dialog: 'joinUs' },
          ]) satisfies ExploreCard[],
      latestCards: (fr
        ? [
            { title: 'Consultants', body: 'Contrats temporaires (consultants et vacataires)', icon: '/home/icon-consultancies.svg', iconAlt: 'Consultancies', dialog: 'consultancies' },
            { title: 'Stagiaires', body: 'Possibilités de stage pour les étudiants et les personnes récemment diplômées', icon: '/home/icon-internships.svg', iconAlt: 'Stagiaires', dialog: 'internships' },
            { title: 'Volontaires des Nations Unies', body: 'Mettez vos compétences au service de l’Organisation des Nations Unies', icon: '/home/icon-volunteer.svg', iconAlt: 'Volontaires des Nations Unies', href: links.volunteer },
            { title: 'Le système des Nations Unies', body: 'Découvrez les emplois proposés dans le système des Nations Unies', icon: '/home/icon-un-system.svg', iconAlt: 'Le système des Nations Unies', href: links.unSystem },
            { title: 'Programmes de début de carrière – Système des Nations Unies', body: 'Découvrez les programmes destinés aux jeunes professionnels à travers le système des Nations Unies.', icon: '/home/icon-early-careers.webp', iconAlt: 'Programmes de début de carrière – Système des Nations Unies', href: links.earlyCareers },
          ]
        : [
            { title: 'Consultancies', body: 'Openings for temporary consultants and contractors', icon: '/home/icon-consultancies.svg', iconAlt: 'Consultancies', dialog: 'consultancies' },
            { title: 'Internships', body: 'Opportunities for students and recent graduates', icon: '/home/icon-internships.svg', iconAlt: 'Internships', dialog: 'internships' },
            { title: 'Volunteer Opportunities', body: 'Bring your skills to the UN', icon: '/home/icon-volunteer.svg', iconAlt: 'Volunteer Opportunities', href: links.volunteer },
            { title: 'The UN System of Organizations', body: 'Explore jobs across the UN system', icon: '/home/icon-un-system.svg', iconAlt: 'The UN Family of Organizations', href: links.unSystem },
            { title: 'Early Careers – UN System', body: 'Explore programmes for young professionals across the UN system', icon: '/home/icon-early-careers.webp', iconAlt: 'Early Careers Programmes UN System', href: links.earlyCareers },
          ]) satisfies ExploreCard[],
      dialogTitles: {
        consultancies: fr ? 'Consultants' : 'Consultancies',
        internships: fr ? 'Stagiaires' : 'Internships',
      },
    },
    roster: fr ? rosterFr(links.globalRosterGjos) : rosterEn(links.globalRosterGjos),
    joinUs: fr ? joinUsFr : joinUsEn,
    footer: {
      welcome: fr ? 'Bienvenue à l’Organisation des Nations Unies' : 'Welcome to the United Nations',
      contactUs: 'Contact Us',
      social: [
        { name: 'Twitter', href: 'http://twitter.com/un_careers' },
        { name: 'LinkedIn', href: 'https://www.linkedin.com/company/united-nations' },
        { name: 'Facebook', href: 'https://www.facebook.com/UN.Careers' },
        { name: 'YouTube', href: 'http://www.youtube.com/user/unitednations?blend=3&ob=4' },
        { name: 'RSS', href: 'https://careers.un.org/jobfeed?isPage=true' },
      ],
      legal: [
        { label: fr ? 'Index du site A-Z' : 'A-Z Site Index', href: page('site-map') },
        { label: fr ? 'Contactez-nous' : 'Contact', href: links.contact },
        { label: fr ? 'Droits d’auteur' : 'Copyright', href: un('about-us/copyright/') },
        { label: 'FAQ', href: un('about-us/frequently-asked-questions') },
        { label: fr ? 'Alerte à la fraude' : 'Fraud Alert', href: un('about-us/fraud-alert') },
        { label: fr ? 'Avis de confidentialité' : 'Privacy Notice', href: un('about-us/privacy-notice') },
        { label: fr ? 'Conditions d’utilisation' : 'Terms of Use', href: un('about-us/terms-of-use') },
      ],
    },
  };
}

const spotlightLinks = [
  'nina-machado-figueira',
  'polina-koroleva',
  'salma-ahmed-yousry',
  'wendy-oludhe',
  'roaa-al-feel',
  'cecile-barayre-el-shami',
  'jessica-summers',
  'munyiva-mbithi-ngea',
].map((slug) => `https://unite.un.org/en/WomenInTech-UN/${slug}`);

const spotlightEn = [
  ['spotlight-1-nina', 'Graphic featuring Nina Machado Figueira, Information & Communication Technologies Servicer with the UN Mission for the Referendum in Western Sahara, sharing advice encouraging women in tech to stay inspired and give their best every day.'],
  ['spotlight-2-polina', 'Graphic featuring Polina Koroleva, Digital Community of Practice Coordinator at UNEP, encouraging women to take the first step into technology and let curiosity guide their journey.'],
  ['spotlight-3-salma', 'Graphic featuring Salma Ahmed Yousry, Urban Development Programme Manager at UN-Habitat, discussing how technology can support planning, implementation and collaboration among women professionals.'],
  ['spotlight-4-wendy', 'Graphic featuring Wendy Oludhe, Software Developer with UNODC, encouraging women to explore technology careers, take risks, learn from failure and grow through experience.'],
  ['spotlight-5-roaa', 'Graphic featuring Roaa Al Feel, Data Scientist with the UN Economic and Social Commission for Western Asia, encouraging women to follow their passion, fight for their beliefs and challenge social norms in technology.'],
  ['spotlight-6-cecile', 'Graphic featuring Cecile Barayre-El Shami, Chief of Digital Economy Capacity-building Section at UNCTAD, encouraging girls interested in technology to embrace lifelong learning and evolving innovations.'],
  ['spotlight-7-jessica', 'Graphic featuring Jessica Summers, Planning Officer, Data Analyst and Digital Solutions Architect in the Executive Office of the Secretary-General, encouraging women to believe in their potential to succeed in technology.'],
  ['spotlight-8-munyiva', 'Graphic featuring Munyiva Mbithi Ngea, Data Engineer with the United Nations Support Office in Somalia, highlighting innovation, continuous learning and the creative side of programming and scripting.'],
].map(([file, alt], i) => ({ href: spotlightLinks[i], image: `/home/${file}.webp`, alt }));

const spotlightFr = [
  ['spotlight-fr-1-nina', 'Illustration de Nina Machado Figueira encourageant les femmes à donner le meilleur d’elles-mêmes et à s’inspirer des femmes pionnières dans la technologie. Campagne ONU'],
  ['spotlight-fr-2-polina', 'Illustration de Polina Koroleva encourageant les femmes à faire le premier pas dans la technologie et à laisser la curiosité guider leur parcours. Campagne ONU'],
  ['spotlight-fr-3-salma', 'Illustration de Salma Ahmed Yousry expliquant que la technologie peut aider toutes les femmes à planifier et atteindre leurs objectifs. Campagne ONU'],
  ['spotlight-fr-4-wendy', 'Illustration de Wendy Oludhe encourageant les femmes à prendre des risques, apprendre de leurs échecs et évoluer dans les carrières technologiques. Campagne ONU'],
  ['spotlight-fr-5-roaa', 'Illustration de Roaa Al Feel encourageant les femmes à suivre leur passion et à remettre en question les normes sociales pour réussir dans la technologie. Campagne ONU'],
  ['spotlight-fr-6-cecile', 'Illustration de Cécile Barayre-El Shami avec un message sur les opportunités pour les filles dans la technologie et l’importance d’apprendre en continu. Campagne ONU'],
  ['spotlight-fr-7-jessica', 'Illustration de Jessica Summers partageant un message encourageant les femmes à croire en leur potentiel dans le domaine de la technologie. Campagne ONU'],
  ['spotlight-fr-8-munyiva', 'Illustration de Munyiva Mbithi Ngea expliquant l’importance de la passion, de l’apprentissage pratique et de l’innovation dans les métiers technologiques. Campagne ONU'],
].map(([file, alt], i) => ({ href: spotlightLinks[i], image: `/home/${file}.webp`, alt }));

/** Verbatim text of the home page's "Roster Exercises" dialog. */
const rosterEn = (gjos: string) => ({
  title: 'Roster Exercises',
  intro: [
    'Roster Exercises for the UN Secretariat are conducted through Generic Job Openings (GJO). A GJO is a type of job announcement used to identify and assess qualified candidates for roles that are regularly needed across the Organization.',
    'Successful applicants are placed on a roster – a pool of pre-screened candidates – who can be considered for relevant job openings across UN offices, departments and field missions.',
  ],
  whyTitle: 'Why apply to a GJO?',
  why: [
    'Be pre-assessed and added to a roster for future job opportunities.',
    'Faster selection: When a suitable position becomes available, rostered candidates can be selected more quickly.',
    'Increased visibility: While roster membership does not guarantee a job, it enhances your chances of being selected.',
    'Support for diversity: Rosters help streamline hiring while promoting diversity, gender parity and multilingualism.',
  ] as RichLine[],
  howTitle: 'How it works:',
  how: [
    {
      before: 'GJOs are posted on ',
      link: 'careers.un.org',
      href: gjos,
      after: ' throughout the year, based on workforce needs of the UN Secretariat.',
    },
    'If you apply and successfully complete the assessment process, you will be placed on a roster for a period of four to six years.',
    'Once rostered, you may be considered for relevant positions, often without having to go through the full recruitment process again.',
  ] as RichLine[],
  tip: {
    before: 'Tip: Keep an eye on ',
    link: 'current Global Roster GJOs',
    href: gjos,
    after: ' and apply to maintain or renew your roster membership.',
  },
});

/** Verbatim text of the French "Exercices de constitution de listes" dialog. */
const rosterFr = (gjos: string) => ({
  title: 'Exercices de constitution de listes',
  intro: [
    'Les exercices de constitution de listes pour le Secrétariat de l’ONU sont menés par le biais d’offres d’emploi génériques (GJO). Une GJO est un type d’annonce d’emploi utilisé pour identifier et évaluer les candidats qualifiés pour des postes régulièrement recherchés au sein de l’Organisation.',
    'Les candidats retenus sont inscrits sur une liste – un vivier de candidats présélectionnés – qui peuvent être pris en considération pour des offres d’emploi pertinentes dans les bureaux, départements et missions des Nations Unies sur le terrain.',
  ],
  whyTitle: 'Pourquoi postuler à une GJO ?',
  why: [
    'Être pré-évalué et ajouté à une liste pour de futures opportunités d’emploi.',
    'Sélection plus rapide : lorsqu’un poste approprié devient disponible, les candidats inscrits sur la liste peuvent être sélectionnés plus rapidement.',
    'Visibilité accrue : bien que l’inscription sur la liste ne garantisse pas un emploi, elle augmente vos chances d’être sélectionné.',
    'Soutien à la diversité : les listes permettent de rationaliser le processus de recrutement tout en favorisant la diversité, la parité entre les sexes et le multilinguisme.',
  ] as RichLine[],
  howTitle: 'Comment cela fonctionne-t-il ?',
  how: [
    {
      before: 'Les GJO sont publiés sur ',
      link: 'careers.un.org',
      href: gjos,
      after: ' tout au long de l’année, en fonction des besoins en personnel du Secrétariat des Nations Unies.',
    },
    'Si vous postulez et réussissez le processus d’évaluation, vous serez inscrit sur une liste pour une période de quatre à six ans.',
    'Une fois inscrit, vous pourrez être pris en considération pour des postes pertinents, souvent sans avoir à passer à nouveau par le processus de recrutement complet.',
  ] as RichLine[],
  tip: {
    before: 'Conseil : gardez un œil sur ',
    link: 'les offres d’emploi mondiales actuellement disponibles',
    href: gjos,
    after: ' et postulez pour conserver ou renouveler votre inscription sur la liste.',
  },
});

/**
 * "Join Us!" dialog. The list is loaded live from the same endpoint as careers.un.org;
 * these verbatim copies (September 2026) are shown only if that request fails.
 */
const joinUsEn = {
  title: 'Join Us!',
  intro:
    'Applicants from the following Member States, which are unrepresented or underrepresented in the UN Secretariat as of September 2026, are strongly encouraged to apply to geographical posts, which are marked with (G) or (R) in the Job Opening number.',
  countries: [
    'Afghanistan', 'Andorra', 'Angola', 'Antigua and Barbuda', 'Belize', 'Brunei Darussalam', 'Cabo Verde',
    "China (People's Republic of)", 'Cuba', "Democratic People's Republic of Korea", 'Dominica', 'Equatorial Guinea',
    'Grenada', 'Indonesia', 'Israel', 'Japan', 'Kiribati', 'Kuwait', "Lao People's Democratic Republic", 'Liberia',
    'Libya', 'Liechtenstein', 'Luxembourg', 'Marshall Islands', 'Micronesia (Federated States of)', 'Monaco', 'Nauru',
    'Nicaragua', 'Oman', 'Palau', 'Papua New Guinea', 'Paraguay', 'Qatar', 'Saint Vincent and the Grenadines',
    'San Marino', 'Saint Lucia', 'Sao Tome and Principe', 'Saudi Arabia', 'Singapore', 'Slovenia', 'Solomon Islands',
    'Timor-Leste', 'Turkmenistan', 'Tuvalu', 'United Arab Emirates', 'United States of America', 'Vanuatu',
  ],
};

const joinUsFr = {
  title: 'Rejoignez-nous !',
  intro:
    'Les personnes originaires des États Membres suivants, qui étaient sous-représentés ou n’étaient pas représentés au Secrétariat de l’ONU au septembre 2026, sont vivement encouragées à faire acte de candidature aux postes géographiques, qui sont marqués d’un (G) ou (R) dans le référence de l’avis de vacance.',
  countries: [
    'Afghanistan', 'Andorre', 'Angola', 'Antigua-et-Barbuda', 'Arabie Saoudite', 'Belize', 'Brunéi Darussalam',
    'Cabo Verde', 'Chine (République populaire de)', 'Cuba', 'Dominique', 'Émirats arabes unis', 'États-Unis d’Amérique',
    'Grenade', 'Guinée équatoriale', 'Îles Marshall', 'Îles Salomon', 'Indonésie', 'Israël', 'Japon', 'Kiribati',
    'Koweït', 'Libéria', 'Libye', 'Liechtenstein', 'Luxembourg', 'Micronésie (États fédérés de)', 'Monaco', 'Nicaragua',
    'Nauru', 'Oman', 'Palaos', 'Papouasie-Nouvelle-Guinée', 'Paraguay', 'Qatar', 'République démocratique populaire lao',
    'République populaire démocratique de Corée', 'Saint-Marin', 'Saint-Vincent-et-les Grenadines', 'Sainte-Lucie',
    'Sao Tomé-et-Principe', 'Singapour', 'Slovénie', 'Timor oriental', 'Turkménistan', 'Tuvalu', 'Vanuatu',
  ],
};

const cache = new Map<Lang, Content>();
export function getContent(lang: Lang): Content {
  if (!cache.has(lang)) cache.set(lang, buildContent(lang));
  return cache.get(lang)!;
}
