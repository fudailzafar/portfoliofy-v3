// Interactions for media inside rendered post HTML (see PageContent).
//
// Galleries scroll sideways by mouse drag. On the published post page, images
// also zoom in place: click an image (or press Enter/Space on it)
// and it grows to fill the screen while the page scrolls to centre it; click
// again, press Escape or scroll the page to shrink it back.

// Framer Motion's default layout transition.
const LAYOUT_MS = 450;
const LAYOUT_EASE = 'cubic-bezier(0.4, 0, 0.1, 1)';
// The page and the strip scroll over 400ms with an ease-in-out quad.
const SCROLL_MS = 400;
const easeInOutQuad = (t: number) =>
  t <= 0.5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t);

// Zoom only above 600px; a strip is 320px tall until zoomed.
const ZOOM_QUERY = '(min-width: 601px)';
const DRAG_THRESHOLD_PX = 4;

const reducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

type Media = HTMLImageElement | HTMLVideoElement;

function animateScroll(
  set: (value: number) => void,
  from: number,
  to: number,
  onDone?: () => void,
) {
  if (reducedMotion() || Math.abs(to - from) < 1) {
    set(to);
    onDone?.();
    return () => {};
  }
  let frame = 0;
  const start = performance.now();
  const step = (now: number) => {
    const t = Math.min(1, (now - start) / SCROLL_MS);
    set(from + (to - from) * easeInOutQuad(t));
    if (t < 1) frame = requestAnimationFrame(step);
    else onDone?.();
  };
  frame = requestAnimationFrame(step);
  return () => cancelAnimationFrame(frame);
}

// FLIP: measure, change the layout, then animate each element from where it
// was with transforms only, the way Framer's layout animations work.
// `measureFinal` runs once the new layout is in place but before any
// transform is applied, so it can read the real final positions.
function flip(
  scaled: HTMLElement[],
  moved: HTMLElement[],
  changeLayout: () => void,
  measureFinal?: () => void,
) {
  const all = [...scaled, ...moved];
  // Captured mid-animation if a previous zoom is still running, so the new
  // animation continues from what's on screen.
  const before = all.map((el) => el.getBoundingClientRect());
  all.forEach((el) => el.getAnimations().forEach((a) => a.cancel()));
  changeLayout();
  const after = all.map((el) => el.getBoundingClientRect());
  measureFinal?.();
  if (reducedMotion()) return;
  all.forEach((el, i) => {
    const first = before[i];
    const last = after[i];
    if (!last.width || !last.height) return;
    const dx = first.left - last.left;
    const dy = first.top - last.top;
    const sx = i < scaled.length ? first.width / last.width : 1;
    const sy = i < scaled.length ? first.height / last.height : 1;
    if (
      Math.abs(dx) < 0.5 &&
      Math.abs(dy) < 0.5 &&
      Math.abs(sx - 1) < 0.001 &&
      Math.abs(sy - 1) < 0.001
    ) {
      return;
    }
    el.animate(
      [
        {
          transformOrigin: '0 0',
          transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`,
        },
        { transformOrigin: '0 0', transform: 'none' },
      ],
      { duration: LAYOUT_MS, easing: LAYOUT_EASE },
    );
  });
}

function mediaSize(media: Media) {
  const attrW = Number(media.getAttribute('width'));
  const attrH = Number(media.getAttribute('height'));
  if (attrW > 0 && attrH > 0) return { w: attrW, h: attrH };
  if (media instanceof HTMLImageElement && media.naturalWidth) {
    return { w: media.naturalWidth, h: media.naturalHeight };
  }
  if (media instanceof HTMLVideoElement && media.videoWidth) {
    return { w: media.videoWidth, h: media.videoHeight };
  }
  const rect = media.getBoundingClientRect();
  return { w: rect.width || 1, h: rect.height || 1 };
}

// Everything below the zoomed block shifts as it grows; animate it too.
function followingBlocks(block: HTMLElement, container: HTMLElement) {
  const blocks: HTMLElement[] = [];
  let node: Element | null = block.nextElementSibling;
  while (node) {
    blocks.push(node as HTMLElement);
    node = node.nextElementSibling;
  }
  node = container.nextElementSibling;
  while (node) {
    blocks.push(node as HTMLElement);
    node = node.nextElementSibling;
  }
  return blocks;
}

export function attachGalleryDrag(container: HTMLElement) {
  const cleanups: (() => void)[] = [];

  container
    .querySelectorAll<HTMLElement>('.content-gallery')
    .forEach((gallery) => {
      gallery.tabIndex = 0;
      gallery.setAttribute('role', 'region');
      gallery.setAttribute('aria-label', 'Image gallery');
      gallery.querySelectorAll('img').forEach((img) => {
        img.draggable = false;
      });

      let startX = 0;
      let startScroll = 0;
      let dragging = false;
      const onDown = (e: PointerEvent) => {
        if (e.pointerType !== 'mouse' || e.button !== 0) return;
        dragging = true;
        startX = e.clientX;
        startScroll = gallery.scrollLeft;
        delete gallery.dataset.dragMoved;
      };
      const onMove = (e: PointerEvent) => {
        if (!dragging) return;
        const delta = e.clientX - startX;
        if (!gallery.dataset.dragging && Math.abs(delta) < DRAG_THRESHOLD_PX) {
          return;
        }
        if (!gallery.dataset.dragging) {
          gallery.dataset.dragging = 'true';
          gallery.setPointerCapture(e.pointerId);
        }
        // Lets the zoom's click handler ignore the click that ends a drag.
        gallery.dataset.dragMoved = 'true';
        gallery.scrollLeft = startScroll - delta;
      };
      const onUp = (e: PointerEvent) => {
        if (!dragging) return;
        dragging = false;
        delete gallery.dataset.dragging;
        if (gallery.hasPointerCapture(e.pointerId)) {
          gallery.releasePointerCapture(e.pointerId);
        }
      };
      gallery.addEventListener('pointerdown', onDown);
      gallery.addEventListener('pointermove', onMove);
      gallery.addEventListener('pointerup', onUp);
      gallery.addEventListener('pointercancel', onUp);
      cleanups.push(() => {
        gallery.removeEventListener('pointerdown', onDown);
        gallery.removeEventListener('pointermove', onMove);
        gallery.removeEventListener('pointerup', onUp);
        gallery.removeEventListener('pointercancel', onUp);
      });
    });

  return () => cleanups.forEach((cleanup) => cleanup());
}

type OpenZoom = {
  media: Media;
  gallery: HTMLElement | null;
  savedScrollY: number;
  // Scroll events from our own centring scroll must not close the zoom.
  armed: boolean;
};

export function attachMediaZoom(container: HTMLElement) {
  const query = window.matchMedia(ZOOM_QUERY);
  const singles = Array.from(
    container.querySelectorAll<Media>('.content-image, .content-video'),
  );
  const galleryMedia = Array.from(
    container.querySelectorAll<Media>('.content-gallery-media'),
  );
  const allMedia = [...singles, ...galleryMedia];

  let open: OpenZoom | null = null;
  let stopScrolls: (() => void)[] = [];
  let armTimer = 0;

  const stopRunningScrolls = () => {
    stopScrolls.forEach((stop) => stop());
    stopScrolls = [];
    window.clearTimeout(armTimer);
  };

  const label = (media: Media, zoomed: boolean) => {
    const kind = media instanceof HTMLVideoElement ? 'video' : 'image';
    media.setAttribute(
      'aria-label',
      `${zoomed ? 'Shrink' : 'Enlarge'} ${kind}`,
    );
    media.setAttribute('aria-expanded', String(zoomed));
  };

  // Interactive only where zoom works (above 600px).
  const syncInteractivity = () => {
    allMedia.forEach((media) => {
      if (query.matches) {
        media.dataset.zoomable = 'true';
        media.tabIndex = 0;
        media.setAttribute('role', 'button');
        label(media, open?.media === media);
      } else {
        delete media.dataset.zoomable;
        media.removeAttribute('tabindex');
        media.removeAttribute('role');
        media.removeAttribute('aria-label');
        media.removeAttribute('aria-expanded');
      }
    });
  };

  // The strip scroll that centres `target`; call only when no transform is
  // applied (inside flip's measureFinal).
  const stripTargetFor = (gallery: HTMLElement, target: HTMLElement) => {
    const rect = target.getBoundingClientRect();
    const galleryRect = gallery.getBoundingClientRect();
    const max = gallery.scrollWidth - gallery.clientWidth;
    return Math.min(
      max,
      Math.max(
        0,
        gallery.scrollLeft +
          rect.left +
          rect.width / 2 -
          (galleryRect.left + galleryRect.width / 2),
      ),
    );
  };

  const scrollStrip = (gallery: HTMLElement, to: number) => {
    stopScrolls.push(
      animateScroll((v) => (gallery.scrollLeft = v), gallery.scrollLeft, to),
    );
  };

  const zoomIn = (media: Media) => {
    const gallery = media.closest<HTMLElement>('.content-gallery');
    const savedScrollY = window.scrollY;
    stopRunningScrolls();

    let stripTo: number | null = null;
    let finalRect: DOMRect | null = null;

    if (gallery) {
      const items = Array.from(
        gallery.querySelectorAll<Media>('.content-gallery-media'),
      );
      const captions = Array.from(
        gallery.querySelectorAll<HTMLElement>('.content-gallery-caption'),
      );
      const height = Math.min(window.innerHeight - 48, 720);
      flip(
        items,
        [...captions, ...followingBlocks(gallery, container)],
        () => {
          items.forEach((item) => {
            item.style.height = `${height}px`;
          });
        },
        () => {
          stripTo = stripTargetFor(gallery, media);
          finalRect = media.getBoundingClientRect();
        },
      );
    } else {
      const figure = media.closest<HTMLElement>('figure') ?? media;
      const caption = figure.querySelector<HTMLElement>('figcaption');
      const { w, h } = mediaSize(media);
      const availW = window.innerWidth - 48;
      const availH = window.innerHeight - 48;
      const width = availW * (h / w) > availH ? (w / h) * availH : availW;
      const columnWidth = figure.parentElement?.clientWidth ?? width;
      flip(
        [media],
        [...(caption ? [caption] : []), ...followingBlocks(figure, container)],
        () => {
          figure.style.width = `${width}px`;
          figure.style.maxWidth = 'none';
          figure.style.marginLeft = `${(columnWidth - width) / 2}px`;
          figure.style.marginRight = `${(columnWidth - width) / 2}px`;
        },
        () => {
          finalRect = media.getBoundingClientRect();
        },
      );
    }

    const zoomed: OpenZoom = { media, gallery, savedScrollY, armed: false };
    open = zoomed;
    media.dataset.zoomed = 'true';
    label(media, true);

    if (gallery && stripTo !== null) scrollStrip(gallery, stripTo);

    // Centre the zoomed media vertically, then start listening for scrolls.
    const rect = finalRect ?? media.getBoundingClientRect();
    const maxY = document.documentElement.scrollHeight - window.innerHeight;
    const toY = Math.min(
      maxY,
      Math.max(
        0,
        window.scrollY + rect.top - (window.innerHeight - rect.height) / 2,
      ),
    );
    stopScrolls.push(
      animateScroll(
        (v) => window.scrollTo(0, v),
        window.scrollY,
        toY,
        () => {
          armTimer = window.setTimeout(() => {
            if (open === zoomed) zoomed.armed = true;
          }, 100);
        },
      ),
    );
  };

  const zoomOut = (restoreScroll: boolean) => {
    if (!open) return;
    const { media, gallery, savedScrollY } = open;
    open = null;
    stopRunningScrolls();
    delete media.dataset.zoomed;
    label(media, false);

    if (gallery) {
      const items = Array.from(
        gallery.querySelectorAll<Media>('.content-gallery-media'),
      );
      const captions = Array.from(
        gallery.querySelectorAll<HTMLElement>('.content-gallery-caption'),
      );
      // Keep whichever image is in the middle of the screen centred.
      const middle = window.innerWidth / 2;
      const anchor =
        items.find((item) => {
          const r = item.getBoundingClientRect();
          return r.left <= middle && r.right >= middle;
        }) ?? media;
      let stripTo: number | null = null;
      flip(
        items,
        [...captions, ...followingBlocks(gallery, container)],
        () => {
          items.forEach((item) => item.style.removeProperty('height'));
        },
        () => {
          stripTo = stripTargetFor(gallery, anchor);
        },
      );
      if (stripTo !== null) scrollStrip(gallery, stripTo);
    } else {
      const figure = media.closest<HTMLElement>('figure') ?? media;
      const caption = figure.querySelector<HTMLElement>('figcaption');
      flip(
        [media],
        [...(caption ? [caption] : []), ...followingBlocks(figure, container)],
        () => {
          ['width', 'max-width', 'margin-left', 'margin-right'].forEach((p) =>
            figure.style.removeProperty(p),
          );
        },
      );
    }

    if (restoreScroll) {
      stopScrolls.push(
        animateScroll(
          (v) => window.scrollTo(0, v),
          window.scrollY,
          savedScrollY,
        ),
      );
    }
  };

  const toggle = (media: Media) => {
    if (!query.matches) return;
    if (open?.media === media) {
      zoomOut(true);
      return;
    }
    if (open) zoomOut(false);
    zoomIn(media);
  };

  const onClick = (e: MouseEvent) => {
    const media = (e.target as Element).closest<Media>('[data-zoomable]');
    if (!media || !container.contains(media)) return;
    const gallery = media.closest<HTMLElement>('.content-gallery');
    if (gallery?.dataset.dragMoved) {
      delete gallery.dataset.dragMoved;
      return;
    }
    toggle(media);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && open) {
      zoomOut(true);
      return;
    }
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const media = (e.target as Element).closest?.<Media>('[data-zoomable]');
    if (!media || !container.contains(media)) return;
    e.preventDefault();
    toggle(media);
  };

  const onScroll = () => {
    if (open?.armed) zoomOut(false);
  };

  const onQueryChange = () => {
    if (!query.matches && open) zoomOut(false);
    syncInteractivity();
  };

  syncInteractivity();
  container.addEventListener('click', onClick);
  document.addEventListener('keydown', onKeyDown);
  window.addEventListener('scroll', onScroll, { passive: true });
  query.addEventListener('change', onQueryChange);

  return () => {
    stopRunningScrolls();
    container.removeEventListener('click', onClick);
    document.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('scroll', onScroll);
    query.removeEventListener('change', onQueryChange);
  };
}
