// In-page i18n. English is the source language in the markup; Romanian and
// Russian are applied client-side via a header switcher (remembered per visitor,
// shareable with ?lang=ro / ?lang=ru). Project names, campaign titles and media
// are language-neutral and never translated.
//
// Each entry is [en, ro, ru]. The client builds an English→translation map from
// the `en` values and swaps matching text nodes, so most UI translates with no
// markup changes. Placeholders/JS strings are looked up by key.

export const LOCALES = ['en', 'ro', 'ru'] as const;
export type Locale = (typeof LOCALES)[number];

/** key -> [en, ro, ru] */
export const STRINGS: Record<string, [string, string, string]> = {
  'nav.contact': ['Contact us', 'Contactează-ne', 'Связаться'],
  'footer.copy': [
    '© Marketing Solutions — Design Portfolio 2026',
    '© Marketing Solutions — Portofoliu de design 2026',
    '© Marketing Solutions — Портфолио дизайна 2026',
  ],

  'home.eyebrow': ['iGaming Creative Studio', 'Studio de creație iGaming', 'Креативная студия iGaming'],
  'home.h1a': ['Creatives that', 'Creative care', 'Креативы, которые'],
  'home.h1b': ['convert.', 'convertesc.', 'конвертируют.'],
  'home.lede': [
    'Brand systems, promo landings, banners and videos for casino & sportsbook operators — across Romania, Ukraine and worldwide markets.',
    'Sisteme de brand, landing-uri promoționale, bannere și video pentru operatori de cazino și pariuri sportive — în România, Ucraina și pe piețe internaționale.',
    'Бренд-системы, промо-лендинги, баннеры и видео для операторов казино и спортивных ставок — в Румынии, Украине и на мировых рынках.',
  ],
  'home.projects': ['Projects', 'Proiecte', 'Проекты'],

  // Hero stats (numbers are language-neutral; labels translate by English text)
  'stat.brands': ['brands', 'branduri', 'брендов'],
  'stat.landings': ['promo landings', 'landing-uri promo', 'промо-лендингов'],
  'stat.banners': ['banner sets', 'seturi de bannere', 'серий баннеров'],
  'stat.videos': ['videos', 'videouri', 'видео'],
  'stat.markets': ['markets', 'piețe', 'рынков'],

  'hint.spin': ['Tap the logo to spin', 'Atinge logo-ul pentru un spin', 'Нажмите на логотип, чтобы покрутить'],

  // Conversion CTAs
  'cta.start': ['Start a project', 'Începe un proiect', 'Начать проект'],
  'cta.browse': ['Browse the work', 'Vezi lucrările', 'Смотреть работы'],
  'ctab.h': [
    'Need creative like this for your brand?',
    'Ai nevoie de creative ca acestea pentru brandul tău?',
    'Нужны такие креативы для вашего бренда?',
  ],
  'ctab.p': [
    'We ship brand systems, landings, banners and video for iGaming operators — in EN, RO and RU.',
    'Livrăm sisteme de brand, landing-uri, bannere și video pentru operatori iGaming — în EN, RO și RU.',
    'Мы создаём бренд-системы, лендинги, баннеры и видео для iGaming-операторов — на EN, RO и RU.',
  ],

  // Services section (home)
  'svc.head': ['What we do', 'Ce facem', 'Что мы делаем'],
  'svc.sub': [
    'Everything a gambling brand needs to launch and promote — delivered in EN, RO and RU.',
    'Tot ce îi trebuie unui brand de gambling pentru lansare și promovare — livrat în EN, RO și RU.',
    'Всё, что нужно гемблинг-бренду для запуска и продвижения — на EN, RO и RU.',
  ],
  'svc.brand': ['Brand systems', 'Sisteme de brand', 'Бренд-системы'],
  'svc.brand.desc': [
    'Logo, colors, typography and full usage guidelines, ready for every channel.',
    'Logo, culori, tipografie și ghid complet de utilizare, pregătite pentru orice canal.',
    'Логотип, цвета, типографика и полный гайдлайн — для всех каналов.',
  ],
  'svc.landings': ['Promo landings', 'Landing-uri promo', 'Промо-лендинги'],
  'svc.landings.desc': [
    'Campaign landing pages designed mobile-first, with tablet and desktop versions.',
    'Landing-uri de campanie proiectate mobile-first, cu versiuni pentru tabletă și desktop.',
    'Лендинги кампаний — сначала мобильные, с версиями для планшета и десктопа.',
  ],
  'svc.banners': ['Banner sets', 'Seturi de bannere', 'Серии баннеров'],
  'svc.banners.desc': [
    'Static creative in every placement size: 1:1, 9:16, 16:9 and 4:5.',
    'Creative statice în fiecare dimensiune de plasare: 1:1, 9:16, 16:9 și 4:5.',
    'Статичные креативы во всех размерах: 1:1, 9:16, 16:9 и 4:5.',
  ],
  'svc.video': ['Video & motion', 'Video & motion', 'Видео и моушн'],
  'svc.video.desc': [
    'Promo videos and motion creative for campaigns and social.',
    'Videouri promo și creative motion pentru campanii și social media.',
    'Промо-видео и моушн-креативы для кампаний и соцсетей.',
  ],
  // Team section (home)
  'team.head': ['Our team', 'Echipa noastră', 'Наша команда'],
  'team.sub': [
    'Young, fast-moving and focused — 10+ designers and growing.',
    'Tineri, rapizi și concentrați — peste 10 designeri, și creștem.',
    'Молодая, быстрая и сфокусированная команда — более 10 дизайнеров, и нас становится больше.',
  ],
  'team.geo.ro': ['Romania', 'România', 'Румыния'],
  'team.geo.ua': ['Ukraine', 'Ucraina', 'Украина'],
  'team.geo.md': ['Moldova', 'Moldova', 'Молдова'],
  'team.geo.more': ['and beyond', 'și nu numai', 'и не только'],
  'team.members': ['team members', 'membri în echipă', 'человек в команде'],
  'team.graphic': ['graphic designers', 'graphic designeri', 'графических дизайнеров'],
  'team.motion': ['motion designers', 'motion designeri', 'моушн-дизайнеров'],
  'team.uiux': ['UI/UX designers', 'UI/UX designeri', 'UI/UX-дизайнеров'],
  'team.ai.head': ['AI-boosted workflow', 'Flux de lucru accelerat cu AI', 'AI в рабочем процессе'],
  'team.ai.p': [
    'AI is wired into our pipeline — concepting, upscaling, motion and voice — with every deliverable art-directed by our designers. Better quality, shipped faster.',
    'AI-ul este integrat în procesul nostru — concepte, upscaling, motion și voce — iar fiecare livrabil este coordonat artistic de designerii noștri. Calitate mai bună, livrată mai repede.',
    'AI встроен в наш процесс — концепты, апскейлинг, моушн и озвучка — при этом каждый материал контролируют наши дизайнеры. Лучше качество, быстрее результат.',
  ],

  // Cross-brand work overview pages (/work/*)
  'work.items': ['items across', 'lucrări în', 'работ в'],
  'work.brands': ['brands', 'branduri', 'брендах'],
  'work.open': ['Open gallery', 'Deschide galeria', 'Открыть галерею'],
  'svc.more': ['See all', 'Vezi tot', 'Смотреть все'],

  // Service card deliverable chips ('Logo' and the ratio chips are universal;
  // Mobile/Tablet/Desktop reuse the dev.* rows via the same EN text)
  'svc.chip.colors': ['Colors', 'Culori', 'Цвета'],
  'svc.chip.guides': ['Guidelines', 'Ghid', 'Гайдлайны'],
  'svc.chip.promo': ['Promo', 'Promo', 'Промо'],
  'svc.chip.motion': ['Motion', 'Motion', 'Моушн'],
  'svc.chip.social': ['Social', 'Social', 'Соцсети'],

  'svc.point.mobile': ['Mobile-first design', 'Design mobile-first', 'Mobile-first дизайн'],
  'svc.point.speed': ['Campaign-speed turnaround', 'Livrare în ritmul campaniilor', 'Скорость под график кампаний'],
  'svc.point.langs': ['Creative in EN, RO and RU', 'Creative în EN, RO și RU', 'Креативы на EN, RO и RU'],

  'footer.age': [
    '18+ · Responsible, compliance-aware creative for licensed iGaming operators.',
    '18+ · Creative responsabile și conforme pentru operatori iGaming licențiați.',
    '18+ · Ответственные креативы с учётом требований — для лицензированных iGaming-операторов.',
  ],

  'proj.all': ['← All projects', '← Toate proiectele', '← Все проекты'],
  'proj.brandbook': ['Brand Book', 'Brand book', 'Брендбук'],
  'proj.brandbook.desc': [
    'Logo, colors, typography, and usage guidelines.',
    'Logo, culori, tipografie și ghid de utilizare.',
    'Логотип, цвета, типографика и гайдлайн.',
  ],
  'proj.portfolio': ['Portfolio', 'Portofoliu', 'Портфолио'],
  'proj.portfolio.desc': [
    'Banners, landing pages, and video creative.',
    'Bannere, landing-uri și creative video.',
    'Баннеры, лендинги и видео.',
  ],
  'tag.brandbook': ['Brandbook', 'Brand book', 'Брендбук'],
  'tag.portfolio': ['Portfolio', 'Portofoliu', 'Портфолио'],

  // Project taglines (rendered from src/data/projects.ts). Matched by English text.
  'tagline.winboss': [
    'Full brand system and campaign production.',
    'Sistem complet de brand și producție de campanii.',
    'Полная система бренда и производство кампаний.',
  ],
  'tagline.win2': [
    'Performance creative across every placement.',
    'Creative de performanță pentru fiecare plasare.',
    'Перформанс-креативы для каждого размещения.',
  ],
  'tagline.guidelines': [
    'Brand identity and guidelines.',
    'Identitate de brand și ghid de utilizare.',
    'Фирменный стиль и гайдлайн.',
  ],
  'tagline.rebrand': ['Rebrand in progress.', 'Rebranding în curs.', 'Ребрендинг в процессе.'],
  'proj.comingSoon': [
    'Brand book and creative are coming soon.',
    'Brand book-ul și creativele urmează în curând.',
    'Брендбук и креативы скоро появятся.',
  ],

  // GEO / market labels (rendered on the home grid). Matched by English text.
  'geo.romania': ['Romania', 'România', 'Румыния'],
  'geo.ukraine': ['Ukraine', 'Ucraina', 'Украина'],
  'geo.georgia': ['Georgia', 'Georgia', 'Грузия'],
  'geo.uzbekistan': ['Uzbekistan', 'Uzbekistan', 'Узбекистан'],
  'geo.worldwide': ['Worldwide · Asia, Europe', 'Global · Asia, Europa', 'Весь мир · Азия, Европа'],

  'pf.choose': [
    'Choose a format to browse the creative.',
    'Alege un format pentru a explora creativele.',
    'Выберите формат, чтобы просмотреть материалы.',
  ],
  'fmt.banners': ['Banners', 'Bannere', 'Баннеры'],
  'fmt.banners.desc': [
    'Static creative in every placement size.',
    'Creative statice în fiecare dimensiune.',
    'Статичные креативы во всех размерах.',
  ],
  'fmt.landings': ['Landings', 'Landing-uri', 'Лендинги'],
  'fmt.landings.desc': ['Landing page designs.', 'Design de landing-uri.', 'Дизайн лендингов.'],
  'fmt.videos': ['Videos', 'Video', 'Видео'],
  'fmt.videos.desc': ['Motion and video creative.', 'Creative video și motion.', 'Видео и моушн-креативы.'],
  'fmt.store': ['Store listing creative.', 'Creative pentru magazinul de aplicații.', 'Креативы для магазина приложений.'],
  'back.portfolio': ['← Portfolio', '← Portofoliu', '← Портфолио'],

  'bb.openFigma': ['Open in Figma', 'Deschide în Figma', 'Открыть в Figma'],
  'bb.download': ['Download PDF', 'Descarcă PDF', 'Скачать PDF'],
  'bb.ctaText': [
    'The full brand book lives in Figma — logo, colors, typography, and usage guidelines.',
    'Brand book-ul complet este în Figma — logo, culori, tipografie și ghid de utilizare.',
    'Полный брендбук находится в Figma — логотип, цвета, типографика и гайдлайн.',
  ],

  'banners.lede': [
    'Each tile shows the 1080×1080 version. Open one to see every size.',
    'Fiecare miniatură este 1080×1080. Deschide una pentru a vedea toate dimensiunile.',
    'Каждая плитка — 1080×1080. Откройте, чтобы увидеть все размеры.',
  ],
  'landings.lede': [
    'Mobile-first. Tap any landing to view it full-length and switch between mobile, tablet, and desktop.',
    'Mobile-first. Atinge orice landing pentru a-l vedea integral și a comuta între mobil, tabletă și desktop.',
    'Сначала мобильные. Нажмите на лендинг, чтобы увидеть его целиком и переключаться между мобильной, планшетной и десктопной версией.',
  ],
  'videos.lede': ['Tap a video to play it.', 'Atinge un video pentru a-l reda.', 'Нажмите на видео, чтобы воспроизвести.'],
  'store.lede': [
    'Store listing creative. Tap a screenshot to view it full-size.',
    'Creative pentru magazinul de aplicații. Atinge o captură pentru a o vedea la dimensiune completă.',
    'Креативы для магазина приложений. Нажмите на скриншот, чтобы открыть в полном размере.',
  ],
  'g.viewAll': ['View all sizes', 'Vezi toate dimensiunile', 'Все размеры'],

  // Device labels (tile chips + lightbox toggle). Matched by English text.
  'dev.mobile': ['Mobile', 'Mobil', 'Мобильный'],
  'dev.tablet': ['Tablet', 'Tabletă', 'Планшет'],
  'dev.desktop': ['Desktop', 'Desktop', 'Десктоп'],

  // Count words — rendered as their own text node next to a numeric span so the
  // English-text matcher can translate them (counts stay language-neutral).
  'cnt.projects': ['projects', 'proiecte', 'проектов'],
  'cnt.sizes': ['sizes', 'dimensiuni', 'размера'],
  'cnt.size': ['size', 'dimensiune', 'размер'],
  'cnt.formats': ['formats', 'formate', 'формата'],
  'cnt.format': ['format', 'format', 'формат'],
  'cnt.pages': ['pages', 'pagini', 'страниц'],

  // 404
  'nf.h': ['Page not found', 'Pagina nu a fost găsită', 'Страница не найдена'],
  'nf.p': [
    "The page you're looking for doesn't exist or has moved.",
    'Pagina pe care o cauți nu există sau a fost mutată.',
    'Страница, которую вы ищете, не существует или была перемещена.',
  ],
  'nf.btn': ['Back to projects', 'Înapoi la proiecte', 'К проектам'],

  'contact.h1': ['Contact us', 'Contactează-ne', 'Свяжитесь с нами'],
  'contact.eyebrow': ['Get in touch', 'Ia legătura', 'Напишите нам'],
  'crumb.contact': ['Contact', 'Contact', 'Контакты'],
  'contact.lede': [
    'Tell us about your project — brand, campaign, or creative. We reply within one business day.',
    'Spune-ne despre proiectul tău — brand, campanie sau creativ. Răspundem în cel mult o zi lucrătoare.',
    'Расскажите о вашем проекте — бренд, кампания или креатив. Мы отвечаем в течение одного рабочего дня.',
  ],
  'contact.name': ['Name', 'Nume', 'Имя'],
  'contact.email': ['Email', 'Email', 'Email'],
  'contact.message': ['Message', 'Mesaj', 'Сообщение'],
  'contact.send': ['Send message', 'Trimite mesajul', 'Отправить'],
  'contact.prefer': ['Prefer email?', 'Preferi emailul?', 'Предпочитаете email?'],
  // placeholders / JS status (looked up by key)
  'contact.ph.name': ['Your name', 'Numele tău', 'Ваше имя'],
  'contact.ph.message': ['Brand, market, timeline and budget', 'Brand, piață, termen și buget', 'Бренд, рынок, сроки и бюджет'],
  'contact.sending': ['Sending…', 'Se trimite…', 'Отправка…'],
  'contact.seeWork': ['Meanwhile, browse the work →', 'Între timp, vezi lucrările →', 'А пока посмотрите работы →'],
  'contact.ok': [
    'Thanks! Your message has been sent.',
    'Mulțumim! Mesajul tău a fost trimis.',
    'Спасибо! Ваше сообщение отправлено.',
  ],
  'contact.errPrefix': [
    "Couldn't send. Please email us directly at",
    'Nu s-a putut trimite. Scrie-ne direct la',
    'Не удалось отправить. Напишите нам напрямую на',
  ],

  // Consent banner + dialog (ConsentPreferences.astro), matched by English text
  'consent.title': ['Analytics preferences', 'Preferințe de analiză', 'Настройки аналитики'],
  'consent.desc': ['We use optional analytics to understand which portfolio content is useful. Form values and contact details are never included.', 'Folosim analiză opțională ca să înțelegem ce conținut din portofoliu e util. Valorile din formulare și datele de contact nu sunt incluse niciodată.', 'Мы используем необязательную аналитику, чтобы понять, какой контент портфолио полезен. Данные форм и контакты никогда не передаются.'],
  'consent.accept': ['Accept analytics', 'Accept analiza', 'Разрешить аналитику'],
  'consent.reject': ['Reject non-essential', 'Refuz opționalele', 'Только необходимые'],
  'consent.manage': ['Manage preferences', 'Gestionează preferințele', 'Управлять настройками'],
  'consent.settings': ['Privacy settings', 'Setări de confidențialitate', 'Настройки конфиденциальности'],
  'consent.eyebrow': ['Privacy controls', 'Control confidențialitate', 'Конфиденциальность'],
  'consent.dialogDesc': ['Essential storage is always active. Optional categories can be changed at any time.', 'Stocarea esențială e mereu activă. Categoriile opționale se pot schimba oricând.', 'Необходимое хранение всегда включено. Необязательные категории можно изменить в любой момент.'],
  'consent.essential': ['Essential', 'Esențiale', 'Необходимые'],
  'consent.essential.desc': ['Required for saved language and privacy choices.', 'Necesare pentru limba salvată și alegerile de confidențialitate.', 'Нужны для сохранения языка и настроек конфиденциальности.'],
  'consent.essential.aria': ['Essential storage enabled', 'Stocare esențială activă', 'Необходимое хранение включено'],
  'consent.analytics': ['Analytics', 'Analiză', 'Аналитика'],
  'consent.analytics.desc': ['Measures meaningful portfolio and contact interactions.', 'Măsoară interacțiunile relevante cu portofoliul și contactul.', 'Измеряет значимые действия в портфолио и контактах.'],
  'consent.ads': ['Advertising', 'Publicitate', 'Реклама'],
  'consent.ads.desc': ['Allows advertising storage and personalization signals.', 'Permite stocarea pentru publicitate și semnalele de personalizare.', 'Разрешает рекламное хранение и сигналы персонализации.'],
  'consent.save': ['Save preferences', 'Salvează preferințele', 'Сохранить настройки'],
  'consent.cancel': ['Cancel', 'Anulează', 'Отмена'],

  // Page-title phrases (translated in <title> by longest match, see localize.mjs)
  'title.banners': ['Banner Design', 'Design de bannere', 'Дизайн баннеров'],
  'title.landings': ['Landing Pages', 'Landing-uri', 'Лендинги'],
  'title.videos': ['Video & Motion', 'Video și motion', 'Видео и моушн'],
  'title.store': ['App Store Creative', 'Creative App Store', 'Креативы для App Store'],
  'title.project': ['iGaming Brand & Creative', 'Brand și creative iGaming', 'Бренд и креативы iGaming'],
  'title.work': ['iGaming Design Portfolio', 'Portofoliu de design iGaming', 'Портфолио дизайна iGaming'],
  'title.asiaEurope': ['Asia & Europe', 'Asia și Europa', 'Азия и Европа'],
  'title.contact': ['Contact Marketing Solutions', 'Contactează Marketing Solutions', 'Связаться с Marketing Solutions'],

  // Screen-reader labels (aria-label), matched by English text
  'aria.skip': ['Skip to content', 'Sari la conținut', 'К содержимому'],
  'aria.work': ['Work', 'Lucrări', 'Работы'],
  'aria.pause': ['Pause animation', 'Oprește animația', 'Остановить анимацию'],
  'aria.home': ['Marketing Solutions — home', 'Marketing Solutions — acasă', 'Marketing Solutions — главная'],
  'aria.breadcrumb': ['Breadcrumb', 'Navigare', 'Навигация'],
  'aria.language': ['Language', 'Limbă', 'Язык'],
  'aria.linkedin': ['Marketing Solutions on LinkedIn', 'Marketing Solutions pe LinkedIn', 'Marketing Solutions в LinkedIn'],
  'aria.close': ['Close (Esc)', 'Închide (Esc)', 'Закрыть (Esc)'],
  'aria.prev': ['Previous', 'Anterior', 'Назад'],
  'aria.next': ['Next', 'Următor', 'Вперёд'],
  'aria.prevLanding': ['Previous landing', 'Landing-ul anterior', 'Предыдущий лендинг'],
  'aria.nextLanding': ['Next landing', 'Landing-ul următor', 'Следующий лендинг'],
  'aria.device': ['Device', 'Dispozitiv', 'Устройство'],
  'aria.sizes': ['Sizes', 'Dimensiuni', 'Размеры'],
  'aria.formats': ['Formats', 'Formate', 'Форматы'],
  'aria.mediaViewer': ['Media viewer', 'Vizualizare', 'Просмотр'],
  'aria.landingViewer': ['Landing viewer', 'Vizualizare landing', 'Просмотр лендинга'],
  'aria.storeViewer': ['Store screenshot', 'Captură din store', 'Скриншот из магазина'],
  'aria.videoPlayer': ['Video player', 'Player video', 'Видеоплеер'],
};

const IDX: Record<Locale, number> = { en: 0, ro: 1, ru: 2 };

/** Server-side translate (for the odd case we need it in .astro frontmatter). */
export function t(lang: Locale, key: string): string {
  const row = STRINGS[key];
  return row ? row[IDX[lang]] : key;
}

// Meta descriptions are built from templates with a count, a brand and a
// market (see src/pages), so they can't be matched as whole STRINGS rows.
// localize.mjs calls describe() on the English text of every description tag.

const FIXED_DESC: Record<string, [string, string]> = {
  'Casino & sportsbook creative: brand systems, promo landings, banners and video for iGaming operators across Romania, Ukraine and worldwide markets.': [
    'Creative pentru cazino și pariuri sportive: sisteme de brand, landing-uri promo, bannere și video pentru operatori iGaming din România, Ucraina și din toată lumea.',
    'Креативы для казино и букмекеров: бренд-системы, промо-лендинги, баннеры и видео для iGaming-операторов в Румынии, Украине и на мировых рынках.',
  ],
  'Tell us about your casino or sportsbook project: brand systems, promo landings, banners or video. Write to Marketing Solutions and we will get back to you.': [
    'Spune-ne despre proiectul tău de cazino sau pariuri sportive: sisteme de brand, landing-uri promo, bannere sau video. Scrie-ne și îți răspunde echipa Marketing Solutions.',
    'Расскажите о вашем проекте казино или букмекерской конторы: бренд-системы, промо-лендинги, баннеры или видео. Напишите в Marketing Solutions, и мы ответим.',
  ],
  "This page doesn't exist. Browse the Marketing Solutions design portfolio instead.": [
    'Această pagină nu există. Explorează în schimb portofoliul de design Marketing Solutions.',
    'Такой страницы нет. Посмотрите портфолио дизайна Marketing Solutions.',
  ],
  'Design portfolio by Marketing Solutions.': ['Portofoliu de design Marketing Solutions.', 'Портфолио дизайна Marketing Solutions.'],
};

/** market as marketOf() writes it -> [ro, ru in the genitive, as after "для"] */
const MARKET: Record<string, [string, string]> = {
  Romania: ['România', 'Румынии'],
  Ukraine: ['Ucraina', 'Украины'],
  Georgia: ['Georgia', 'Грузии'],
  Uzbekistan: ['Uzbekistan', 'Узбекистана'],
  'Asia & Europe': ['Asia și Europa', 'Азии и Европы'],
  'international markets': ['piețe internaționale', 'международных рынков'],
};

/** /work/<format>/ titles, lower-cased as in work/[format].astro */
const WORK_FORMAT: Record<string, [string, string]> = {
  'banner sets': ['seturile de bannere', 'серии баннеров'],
  'promo landings': ['landing-urile promo', 'промо-лендинги'],
  'video & motion': ['materialele video și motion', 'видео и моушн'],
  'brand systems': ['sistemele de brand', 'бренд-системы'],
};

/** portfolio format names, lower-cased as in [project]/portfolio/index.astro */
const PF_FORMAT: Record<string, [string, string]> = {
  banners: ['bannere', 'баннеры'],
  landings: ['landing-uri', 'лендинги'],
  videos: ['video', 'видео'],
  'app store': ['App Store', 'App Store'],
};

const SECTIONS: Record<string, [string, string]> = {
  'brand book and creative portfolio': ['brand book și portofoliu de creative', 'брендбук и портфолио креативов'],
  'brand book': ['brand book', 'брендбук'],
  'creative portfolio': ['portofoliu de creative', 'портфолио креативов'],
};

type DescLang = 'ro' | 'ru';
const L = { ro: 0, ru: 1 } as const;

/**
 * Number + noun with the right plural form. RO: one (1), few (2–19: "campanii"),
 * other (20+: "de campanii"). RU: one (1, 21), few (2–4), many (5–20).
 */
function count(lang: DescLang, n: string, forms: Partial<Record<Intl.LDMLPluralRule, string>>): string {
  const rule = new Intl.PluralRules(lang).select(Number(n));
  return `${n} ${forms[rule] ?? forms.other ?? forms.many}`;
}

const tagline = (en: string, lang: DescLang) => {
  const row = Object.values(STRINGS).find((r) => r[0] === en);
  return row ? row[IDX[lang]] : undefined;
};

type Rule = [RegExp, (m: RegExpMatchArray, lang: DescLang) => string | undefined];

const RULES: Rule[] = [
  [
    /^(\d+) (.+) banner campaigns for (.+), each delivered in every placement size\. iGaming banner design by Marketing Solutions\.$/,
    ([, n, brand, mk], lang) => {
      const m = MARKET[mk]?.[L[lang]];
      if (!m) return;
      return lang === 'ro'
        ? `${count('ro', n, { one: 'campanie', few: 'campanii', other: 'de campanii' })} de bannere ${brand} pentru ${m}, fiecare livrată în toate dimensiunile de plasare. Design de bannere iGaming de la Marketing Solutions.`
        : `${count('ru', n, { one: 'баннерная кампания', few: 'баннерные кампании', many: 'баннерных кампаний' })} ${brand} для ${m}, каждая во всех размерах площадок. Дизайн баннеров iGaming от Marketing Solutions.`;
    },
  ],
  [
    /^(\d+) (.+) promo landing pages for (.+), designed mobile-first with desktop versions\. iGaming landing page design by Marketing Solutions\.$/,
    ([, n, brand, mk], lang) => {
      const m = MARKET[mk]?.[L[lang]];
      if (!m) return;
      return lang === 'ro'
        ? `${count('ro', n, { one: 'landing promo', few: 'landing-uri promo', other: 'de landing-uri promo' })} ${brand} pentru ${m}, gândite mobile-first, cu versiuni desktop. Design de landing-uri iGaming de la Marketing Solutions.`
        : `${count('ru', n, { one: 'промо-лендинг', few: 'промо-лендинга', many: 'промо-лендингов' })} ${brand} для ${m}, mobile-first и с десктоп-версиями. Дизайн лендингов iGaming от Marketing Solutions.`;
    },
  ],
  [
    /^(\d+) (.+) promo videos and motion pieces for (.+), cut for social and display placements\. iGaming video creative by Marketing Solutions\.$/,
    ([, n, brand, mk], lang) => {
      const m = MARKET[mk]?.[L[lang]];
      if (!m) return;
      return lang === 'ro'
        ? `Video promo și motion ${brand} pentru ${m}: ${count('ro', n, { one: 'clip', few: 'clipuri', other: 'de clipuri' })}, montate pentru social media și display. Creative video iGaming de la Marketing Solutions.`
        : `Промо-видео и моушн ${brand} для ${m}: ${count('ru', n, { one: 'ролик', few: 'ролика', many: 'роликов' })} под соцсети и медийную рекламу. Видеокреативы iGaming от Marketing Solutions.`;
    },
  ],
  [
    /^(\d+) sets of (.+) App Store screenshots for (.+)\. Open any set to see every screenshot full size\. iGaming app store creative by Marketing Solutions\.$/,
    ([, n, brand, mk], lang) => {
      const m = MARKET[mk]?.[L[lang]];
      if (!m) return;
      return lang === 'ro'
        ? `${count('ro', n, { one: 'set', few: 'seturi', other: 'de seturi' })} de capturi App Store ${brand} pentru ${m}. Fiecare set se deschide la dimensiune completă. Creative App Store iGaming de la Marketing Solutions.`
        : `${count('ru', n, { one: 'набор', few: 'набора', many: 'наборов' })} скриншотов App Store ${brand} для ${m}. Каждый набор открывается в полном размере. Креативы для App Store iGaming от Marketing Solutions.`;
    },
  ],
  [
    /^All (.+) from the Marketing Solutions portfolio, across (\d+) iGaming brands in Romania, Ukraine, Georgia, Uzbekistan, Asia and Europe\.$/,
    ([, fmt, n], lang) => {
      const f = WORK_FORMAT[fmt]?.[L[lang]];
      if (!f) return;
      return lang === 'ro'
        ? `Toate ${f} din portofoliul Marketing Solutions, pentru ${count('ro', n, { one: 'brand iGaming', few: 'branduri iGaming', other: 'de branduri iGaming' })} din România, Ucraina, Georgia, Uzbekistan, Asia și Europa.`
        : `Все ${f} из портфолио Marketing Solutions: ${count('ru', n, { one: 'iGaming-бренд', few: 'iGaming-бренда', many: 'iGaming-брендов' })} в Румынии, Украине, Грузии, Узбекистане, Азии и Европе.`;
    },
  ],
  [
    /^(.+) creative portfolio for (.+): (.+)\. iGaming design by Marketing Solutions, with every campaign open to browse\.$/,
    ([, brand, mk, list], lang) => {
      const m = MARKET[mk]?.[L[lang]];
      const items = list.split(', ').map((x) => PF_FORMAT[x]?.[L[lang]]);
      if (!m || items.some((x) => !x)) return;
      return lang === 'ro'
        ? `Portofoliul de creative ${brand} pentru ${m}: ${items.join(', ')}. Design iGaming de la Marketing Solutions, cu toate campaniile deschise.`
        : `Портфолио креативов ${brand} для ${m}: ${items.join(', ')}. Дизайн iGaming от Marketing Solutions, каждую кампанию можно открыть.`;
    },
  ],
  [
    /^(.+) brand book for the (.+) iGaming market: logo, colors, typography and usage guidelines, designed by Marketing Solutions\.$/,
    ([, brand, mk], lang) => {
      const m = MARKET[mk]?.[L[lang]];
      if (!m) return;
      return lang === 'ro'
        ? `Brand book-ul ${brand} pentru piața iGaming din ${m}: logo, culori, tipografie și reguli de utilizare. Creat de Marketing Solutions.`
        : `Брендбук ${brand} для iGaming-рынка ${m}: логотип, цвета, типографика и правила использования. Дизайн Marketing Solutions.`;
    },
  ],
  [
    /^(.+), an iGaming brand for (.+?): (.+?)\. (?:(.+) )?Designed by Marketing Solutions\.$/,
    ([, brand, mk, sec, tag], lang) => {
      const m = MARKET[mk]?.[L[lang]];
      const s = SECTIONS[sec]?.[L[lang]];
      const t = tag ? tagline(tag, lang) : '';
      if (!m || !s || t === undefined) return;
      return lang === 'ro'
        ? `${brand}, brand iGaming pentru ${m}: ${s}. ${t ? `${t} ` : ''}Creat de Marketing Solutions.`
        : `${brand}, iGaming-бренд для ${m}: ${s}. ${t ? `${t} ` : ''}Дизайн Marketing Solutions.`;
    },
  ],
  [
    /^(.+) portfolio — banners, landing pages, and video creative by Marketing Solutions\.$/,
    ([, brand], lang) =>
      lang === 'ro'
        ? `Portofoliul ${brand}: bannere, landing-uri și creative video de la Marketing Solutions.`
        : `Портфолио ${brand}: баннеры, лендинги и видеокреативы от Marketing Solutions.`,
  ],
  [
    /^(.+) on the Marketing Solutions design portfolio\.$/,
    ([, brand], lang) =>
      lang === 'ro' ? `${brand} în portofoliul de design Marketing Solutions.` : `${brand} в портфолио дизайна Marketing Solutions.`,
  ],
  [
    // project stub: "Winboss — Full brand system and campaign production."
    /^(.+) — (.+)$/,
    ([, brand, tag], lang) => {
      const t = tagline(tag, lang);
      return t && `${brand} — ${t}`;
    },
  ],
];

/** RO/RU text for an English meta description, or undefined when no rule matches. */
export function describe(en: string, lang: DescLang): string | undefined {
  if (FIXED_DESC[en]) return FIXED_DESC[en][L[lang]];
  for (const [re, fn] of RULES) {
    const m = en.match(re);
    if (m) return fn(m, lang);
  }
}
