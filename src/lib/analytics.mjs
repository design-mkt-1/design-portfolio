function snakeCase(value) {
  return String(value)
    .trim()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toLowerCase();
}

function shortHash(value) {
  let hash = 0x811c9dc5;
  for (const character of String(value)) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(36).padStart(6, '0').slice(-6);
}

/**
 * Build a readable, deterministic identifier that is independent from CSS and
 * translated UI text. The source asset/path hash prevents collisions without
 * introducing random or per-click values.
 */
export function stableAnalyticsId(prefix, source) {
  const normalizedPrefix = snakeCase(prefix) || 'content';
  const normalizedSource = snakeCase(source) || 'item';
  const readable = normalizedSource.slice(0, 52).replace(/_+$/g, '');
  return `${normalizedPrefix}_${readable}_${shortHash(source)}`.slice(0, 100);
}

export function pathAnalyticsId(prefix, path) {
  return stableAnalyticsId(prefix, String(path).replace(/[?#].*$/, ''));
}
