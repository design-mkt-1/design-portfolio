// Client-side lightbox controller shared by the gallery components
// (MediaGallery, VideoGallery, LandingsGallery, StoreGallery). Owns the modal
// mechanics — open/close, body scroll lock, focus trap + restore, Escape/Arrow
// keys, prev/next wiring, wrap-around index math, hiding nav for single-item
// galleries — while each gallery keeps only its own rendering via onShow/onClose.
// No node imports: this module is bundled into browser <script> blocks.

export interface LightboxOptions {
  /** The dialog root element (the fixed overlay with [hidden]). */
  root: HTMLElement;
  /** Item count; when <= 1 the prev/next buttons are hidden and arrow keys ignored. */
  count: number;
  /** Render item `index` into the dialog (called on open and on prev/next). */
  onShow: (index: number) => void;
  /** Teardown when the dialog closes (clear stage / img src so media stops). */
  onClose?: () => void;
  closeSelector: string;
  prevSelector: string;
  nextSelector: string;
  /** Extra backdrop targets that close the dialog; the root itself always does. */
  backdropCloses?: (target: EventTarget | null) => boolean;
}

export interface LightboxController {
  open(index: number): void;
  close(): void;
  show(index: number): void;
  index(): number;
}

export function createLightbox(opts: LightboxOptions): LightboxController {
  const { root, count, onShow, onClose, backdropCloses } = opts;
  let idx = 0;
  let lastFocus: HTMLElement | null = null;

  const closeBtn = root.querySelector<HTMLElement>(opts.closeSelector);
  const navBtns = [root.querySelector<HTMLElement>(opts.prevSelector), root.querySelector<HTMLElement>(opts.nextSelector)];
  if (count <= 1) navBtns.forEach((b) => b && (b.style.display = 'none'));

  // Keep Tab focus inside the modal while it is open (aria-modal contract).
  function trapFocus(e: KeyboardEvent) {
    const focusables = Array.from(root.querySelectorAll<HTMLElement>('button')).filter(
      (el) => !el.hasAttribute('disabled') && el.offsetParent !== null,
    );
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement as HTMLElement;
    if (e.shiftKey && (active === first || !root.contains(active))) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus();
    }
  }

  function show(i: number) {
    idx = ((i % count) + count) % count;
    onShow(idx);
  }
  function open(i: number) {
    lastFocus = document.activeElement as HTMLElement;
    show(i);
    root.hidden = false;
    document.body.style.overflow = 'hidden';
    closeBtn?.focus();
  }
  function close() {
    root.hidden = true;
    document.body.style.overflow = '';
    onClose?.();
    lastFocus?.focus();
  }

  closeBtn?.addEventListener('click', close);
  navBtns[0]?.addEventListener('click', () => show(idx - 1));
  navBtns[1]?.addEventListener('click', () => show(idx + 1));
  root.addEventListener('click', (e) => {
    if (e.target === root || backdropCloses?.(e.target)) close();
  });
  document.addEventListener('keydown', (e) => {
    if (root.hidden) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'Tab') trapFocus(e);
    else if (count <= 1) return;
    else if (e.key === 'ArrowRight') show(idx + 1);
    else if (e.key === 'ArrowLeft') show(idx - 1);
  });

  return { open, close, show, index: () => idx };
}
