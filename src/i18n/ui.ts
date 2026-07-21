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

  'home.eyebrow': ['Design Portfolio', 'Portofoliu de Design', 'Портфолио дизайна'],
  'home.h1a': ['Brands we build,', 'Branduri pe care le construim,', 'Бренды, которые мы создаём,'],
  'home.h1b': ['campaigns we ship.', 'campanii pe care le livrăm.', 'кампании, которые мы запускаем.'],
  'home.lede': [
    'Open any project to see its brand book and the creative we made for it: banners, landing pages, and video.',
    'Deschide orice proiect pentru a vedea brand book-ul și creativele realizate pentru el: bannere, pagini de destinație și video.',
    'Откройте любой проект, чтобы увидеть брендбук и созданные материалы: баннеры, лендинги и видео.',
  ],
  'home.projects': ['Projects', 'Proiecte', 'Проекты'],

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
    'Bannere, pagini de destinație și creative video.',
    'Баннеры, лендинги и видео.',
  ],
  'tag.brandbook': ['Brandbook', 'Brand Book', 'Брендбук'],
  'tag.portfolio': ['Portfolio', 'Portofoliu', 'Портфолио'],

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
  'fmt.landings': ['Landings', 'Pagini de destinație', 'Лендинги'],
  'fmt.landings.desc': ['Landing page designs.', 'Design de pagini de destinație.', 'Дизайн лендингов.'],
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
    'Mobile-first. Tap any landing to view it full-length and switch between mobile and desktop.',
    'Mobile-first. Atinge orice landing pentru a-l vedea integral și a comuta între mobil și desktop.',
    'Сначала мобильные. Нажмите на лендинг, чтобы увидеть его целиком и переключаться между мобильной и десктопной версией.',
  ],
  'videos.lede': ['Tap a video to play it.', 'Atinge un video pentru a-l reda.', 'Нажмите на видео, чтобы воспроизвести.'],
  'store.lede': [
    'Store listing creative. Tap a screenshot to view it full-size.',
    'Creative pentru magazinul de aplicații. Atinge o captură pentru a o vedea la dimensiune completă.',
    'Креативы для магазина приложений. Нажмите на скриншот, чтобы открыть в полном размере.',
  ],
  'g.viewAll': ['View all sizes', 'Vezi toate dimensiunile', 'Все размеры'],

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
