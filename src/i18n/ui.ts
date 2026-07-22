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
export const DEFAULT_LOCALE: Locale = 'en';

export const LOCALE_NAME: Record<Locale, string> = {
  en: 'EN',
  ro: 'RO',
  ru: 'RU',
};

/** key -> [en, ro, ru] */
export const STRINGS: Record<string, [string, string, string]> = {
  'nav.contact': ['Contact us', 'Contactează-ne', 'Связаться'],
  'footer.copy': [
    '© Marketing Solutions — design portfolio',
    '© Marketing Solutions — portofoliu de design',
    '© Marketing Solutions — портфолио дизайна',
  ],

  'home.eyebrow': ['iGaming Creative Studio', 'Studio de Creație iGaming', 'Креативная студия iGaming'],
  'home.h1a': ['Creative that', 'Creație care', 'Креатив, который'],
  'home.h1b': ['converts players.', 'convertește jucători.', 'конвертирует игроков.'],
  'home.lede': [
    'Brand systems, promo landings, banners and video for casino & sportsbook operators — across Romania, Ukraine and worldwide markets.',
    'Sisteme de brand, landing-uri promoționale, bannere și video pentru operatori de cazino și pariuri sportive — în România, Ucraina și pe piețe internaționale.',
    'Бренд-системы, промо-лендинги, баннеры и видео для операторов казино и спортивных ставок — в Румынии, Украине и на мировых рынках.',
  ],
  'home.projects': ['Projects', 'Proiecte', 'Проекты'],

  // Hero stats (numbers are language-neutral; labels translate by English text)
  'stat.brands': ['brands', 'branduri', 'брендов'],
  'stat.landings': ['promo landings', 'landing-uri promo', 'промо-лендингов'],
  'stat.banners': ['banner sets', 'seturi de bannere', 'серий баннеров'],
  'stat.markets': ['markets', 'piețe', 'рынка'],

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

  'proj.all': ['← All projects', '← Toate proiectele', '← Все проекты'],
  'proj.brandbook': ['Brand Book', 'Brand Book', 'Брендбук'],
  'proj.brandbook.desc': [
    'Logo, colors, typography, and usage guidelines.',
    'Logo, culori, tipografie și ghid de utilizare.',
    'Логотип, цвета, типографика и правила использования.',
  ],
  'proj.portfolio': ['Portfolio', 'Portofoliu', 'Портфолио'],
  'proj.portfolio.desc': [
    'Banners, landing pages, and video creative.',
    'Bannere, landing-uri și creative video.',
    'Баннеры, лендинги и видео.',
  ],
  'tag.brandbook': ['Brandbook', 'Brand Book', 'Брендбук'],
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
    'Фирменный стиль и рекомендации.',
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
  'fmt.landings': ['Landings', 'Landings', 'Лендинги'],
  'fmt.landings.desc': ['Landing page designs.', 'Design de landings.', 'Дизайн лендингов.'],
  'fmt.videos': ['Videos', 'Video', 'Видео'],
  'fmt.videos.desc': ['Motion and video creative.', 'Creative video și motion.', 'Видео и моушн-креативы.'],
  'fmt.store': ['Store listing creative.', 'Creative pentru magazinul de aplicații.', 'Креативы для магазина приложений.'],
  'back.portfolio': ['← Portfolio', '← Portofoliu', '← Портфолио'],

  'bb.openFigma': ['Open in Figma', 'Deschide în Figma', 'Открыть в Figma'],
  'bb.download': ['Download PDF', 'Descarcă PDF', 'Скачать PDF'],
  'bb.ctaText': [
    'The full brand book lives in Figma — logo, colors, typography, and usage guidelines.',
    'Brand book-ul complet este în Figma — logo, culori, tipografie și ghid de utilizare.',
    'Полный брендбук находится в Figma — логотип, цвета, типографика и правила использования.',
  ],

  'banners.lede': [
    'Each tile is the 1080×1080. Open one to see every size.',
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
  'contact.eyebrow': ['Get in touch', 'Ia legătura', 'Свяжитесь с нами'],
  'crumb.contact': ['Contact', 'Contact', 'Контакты'],
  'contact.lede': [
    "Tell us about your project — brand, campaign, or creative — and we'll get back to you.",
    'Spune-ne despre proiectul tău — brand, campanie sau creativ — și te vom contacta.',
    'Расскажите о вашем проекте — бренд, кампания или креатив — и мы вам ответим.',
  ],
  'contact.name': ['Name', 'Nume', 'Имя'],
  'contact.email': ['Email', 'Email', 'Email'],
  'contact.message': ['Message', 'Mesaj', 'Сообщение'],
  'contact.send': ['Send message', 'Trimite mesajul', 'Отправить'],
  'contact.prefer': ['Prefer email?', 'Preferi emailul?', 'Предпочитаете email?'],
  // placeholders / JS status (looked up by key)
  'contact.ph.name': ['Your name', 'Numele tău', 'Ваше имя'],
  'contact.ph.message': ['What can we help with?', 'Cu ce te putem ajuta?', 'Чем мы можем помочь?'],
  'contact.sending': ['Sending…', 'Se trimite…', 'Отправка…'],
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
};

const IDX: Record<Locale, number> = { en: 0, ro: 1, ru: 2 };

/** Server-side translate (for the odd case we need it in .astro frontmatter). */
export function t(lang: Locale, key: string): string {
  const row = STRINGS[key];
  return row ? row[IDX[lang]] : key;
}
