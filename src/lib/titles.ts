// Display-title cleanup for asset folder names. Folders arrive named after
// internal tickets — "✅(CDC - 18618) B2F Разработка баннеров и лендинга …
// (04.08.2025 - 31.08.2025)" — and those names must never reach a partner-facing
// page. This strips status emoji, ticket refs, job-number prefixes, internal
// task boilerplate, and campaign date ranges, leaving the campaign name.
// Display-only: file paths keep the raw folder name.

// Internal task-tracker phrases that are instructions, not campaign names.
const BOILERPLATE: RegExp[] = [
  /Разработка баннеров и лендинга/gi,
  /Обновить дизайн/gi,
  /Сделать диз(?:айн)? по нашему шаблону/gi,
  /Сделать диз(?:айн)?/gi,
];

export function cleanTitle(raw: string): string {
  let t = raw;
  // status emoji (✅ ✏️ 🖤 🐼 …) anywhere
  t = t.replace(/[\p{Extended_Pictographic}️]/gu, ' ');
  // ticket refs: (CDC - 17220), [CDC-21588], (CDC-17510 ) …
  t = t.replace(/[([]\s*CDC\s*-?\s*\d+\s*[)\]]/gi, ' ');
  for (const re of BOILERPLATE) t = t.replace(re, ' ');
  // job-number prefix: "27170 - AsimetricW Tesla" → "AsimetricW Tesla"
  t = t.replace(/^[\s([\-–—]*\d{4,6}\s*[-–—]\s*/, ' ');
  // campaign date ranges, parenthesized or bare: (16.06.2025 - 30.06.2025), 15.06 - 13.07
  t = t.replace(/\(\s*\d{1,2}\.\d{1,2}(?:\.\d{2,4})?\s*[-–]\s*\d{1,2}\.\d{1,2}(?:\.\d{2,4})?\s*\)/g, ' ');
  t = t.replace(/\d{1,2}\.\d{1,2}(?:\.\d{2,4})?\s*[-–]\s*\d{1,2}\.\d{1,2}(?:\.\d{2,4})?/g, ' ');
  // leftovers: empty brackets, doubled tokens ("B2F B2F"), stray edge punctuation
  t = t.replace(/[([]\s*[)\]]/g, ' ');
  t = t.replace(/\b(\S+)( \1\b)+/g, '$1');
  t = t.replace(/\s{2,}/g, ' ').trim();
  t = t.replace(/^[\s\-–—.,(]+/, '').replace(/[\s\-–—.,]+$/, '').trim();
  return t || raw.trim();
}

/** Folders flagged as work-in-progress (✏️ marker) — never publish these. */
export function isInProgress(folderName: string): boolean {
  return folderName.includes('✏');
}
