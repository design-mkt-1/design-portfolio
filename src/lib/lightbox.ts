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
  /** Tinder-style touch swipe between items. `listen` receives the gestures
   *  (gets touch-action: pan-y so vertical scrolling keeps working); `el`
   *  returns the element to drag/animate (defaults to `listen`). On first open
   *  the media nudges left once as a "you can swipe" hint. */
  swipe?: { listen: HTMLElement; el?: () => HTMLElement | null };
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

  // ---- touch swipe (tinder-style) ----
  const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const swipeEl = () => opts.swipe?.el?.() ?? opts.swipe?.listen ?? null;
  let hinted = false;
  function swipeHint() {
    if (!opts.swipe || count <= 1 || hinted || reduceMotion()) return;
    hinted = true;
    setTimeout(() => {
      if (root.hidden) return;
      swipeEl()?.animate(
        [{ transform: 'translateX(0)' }, { transform: 'translateX(-28px)' }, { transform: 'translateX(0)' }],
        { duration: 700, easing: 'ease-in-out' },
      );
    }, 500);
  }
  if (opts.swipe && count > 1) {
    const listen = opts.swipe.listen;
    listen.style.touchAction = 'pan-y';
    let startX = 0;
    let startY = 0;
    let dx = 0;
    let active = false;
    let locked = false;
    const drag = (x: number) => {
      const el = swipeEl();
      if (el) el.style.transform = `translateX(${x}px) rotate(${x * 0.02}deg)`;
    };
    listen.addEventListener(
      'touchstart',
      (e) => {
        if (e.touches.length !== 1) return;
        active = true;
        locked = false;
        dx = 0;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
      },
      { passive: true },
    );
    listen.addEventListener(
      'touchmove',
      (e) => {
        if (!active) return;
        const t = e.touches[0];
        dx = t.clientX - startX;
        const dy = t.clientY - startY;
        if (!locked) {
          // axis lock: clearly-horizontal gestures become swipes; vertical
          // movement hands control back to native scrolling
          if (Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy) * 1.2) locked = true;
          else if (Math.abs(dy) > 12) {
            active = false;
            return;
          } else return;
        }
        if (e.cancelable) e.preventDefault();
        drag(dx);
      },
      { passive: false },
    );
    const endSwipe = () => {
      if (!active) return;
      active = false;
      const el = swipeEl();
      if (!el) return;
      if (locked) {
        // a drag must not fall through as a backdrop-click close
        listen.addEventListener(
          'click',
          (e) => {
            e.preventDefault();
            e.stopPropagation();
          },
          { capture: true, once: true },
        );
      }
      if (locked && Math.abs(dx) > 70 && !reduceMotion()) {
        const dir = dx < 0 ? 1 : -1; // swipe left → next
        const fly = el.animate(
          [
            { transform: `translateX(${dx}px) rotate(${dx * 0.02}deg)`, opacity: 1 },
            { transform: `translateX(${-dir * window.innerWidth}px) rotate(${-dir * 8}deg)`, opacity: 0.15 },
          ],
          { duration: 200, easing: 'ease-in' },
        );
        fly.onfinish = () => {
          el.style.transform = '';
          show(idx + dir);
          swipeEl()?.animate(
            [
              { transform: `translateX(${dir * 64}px)`, opacity: 0 },
              { transform: 'translateX(0)', opacity: 1 },
            ],
            { duration: 220, easing: 'ease-out' },
          );
        };
      } else if (locked && Math.abs(dx) > 70) {
        el.style.transform = '';
        show(idx + (dx < 0 ? 1 : -1));
      } else {
        el.animate([{ transform: `translateX(${dx}px) rotate(${dx * 0.02}deg)` }, { transform: 'translateX(0) rotate(0)' }], {
          duration: 180,
          easing: 'ease-out',
        });
        el.style.transform = '';
      }
      dx = 0;
      locked = false;
    };
    listen.addEventListener('touchend', endSwipe);
    listen.addEventListener('touchcancel', endSwipe);
  }

  function open(i: number) {
    lastFocus = document.activeElement as HTMLElement;
    show(i);
    root.hidden = false;
    document.body.style.overflow = 'hidden';
    closeBtn?.focus();
    swipeHint();
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
