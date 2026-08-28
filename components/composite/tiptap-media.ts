import { Node, mergeAttributes } from '@tiptap/react';

export const ContentImage = Node.create({
  name: 'contentImage',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      src: { default: null },
      alt: { default: '' },
    };
  },

  parseHTML() {
    return [{ tag: 'img[data-content-image]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'img',
      mergeAttributes(HTMLAttributes, {
        'data-content-image': 'true',
        class: 'content-image',
      }),
    ];
  },
});

export const ContentVideo = Node.create({
  name: 'contentVideo',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      src: { default: null },
    };
  },

  parseHTML() {
    return [{ tag: 'video[data-content-video]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'video',
      mergeAttributes(HTMLAttributes, {
        'data-content-video': 'true',
        class: 'content-video',
        autoplay: '',
        muted: '',
        loop: '',
        playsinline: '',
        preload: 'metadata',
      }),
    ];
  },
});

/**
 * Multiple images grouped into one inline-expanding gallery, matching
 * read.cv's writing pages: click a thumbnail and it expands in place
 * (no modal), so the reader never loses their scroll position. The actual
 * expand/collapse behavior lives in the public page's client-side
 * PageContent wrapper, since this node only needs to emit static markup —
 * both here (editor preview) and in persisted page content (public route).
 */
export const Gallery = Node.create({
  name: 'gallery',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      images: {
        default: [] as string[],
        parseHTML: (element) => {
          const raw = element.getAttribute('data-images');
          if (!raw) return [];
          try {
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed : [];
          } catch {
            return [];
          }
        },
        renderHTML: (attributes) => ({
          'data-images': JSON.stringify(attributes.images || []),
        }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-gallery]' }];
  },

  renderHTML({ HTMLAttributes, node }) {
    const images: string[] = node.attrs.images || [];
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-gallery': 'true',
        class: 'content-gallery',
      }),
      ...images.map((src) => [
        'button',
        { type: 'button', class: 'content-gallery-item', 'data-src': src },
        ['img', { src, alt: '' }],
      ]),
    ];
  },
});
