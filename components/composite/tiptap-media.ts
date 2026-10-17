import { Node, mergeAttributes, ReactNodeViewRenderer } from '@tiptap/react';
import {
  ContentGalleryView,
  ContentImageView,
  ContentVideoView,
} from './tiptap-media-views';

// width/height let the browser reserve the image's space before it loads.
const toDimension = (value: string | null) => {
  const n = value ? parseInt(value, 10) : NaN;
  return Number.isFinite(n) && n > 0 ? n : null;
};
const dimensionAttribute = (name: 'width' | 'height') => ({
  default: null,
  renderHTML: (attrs: Record<string, unknown>) =>
    attrs[name] ? { [name]: attrs[name] } : {},
});

export interface GalleryItem {
  type: 'image' | 'video';
  src: string;
  width: number | null;
  height: number | null;
  caption: string;
}

export const ContentImage = Node.create({
  name: 'contentImage',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      src: { default: null },
      width: dimensionAttribute('width'),
      height: dimensionAttribute('height'),
      // Rendered as <img alt> and <figcaption> in renderHTML, not as an attribute.
      caption: { default: '', renderHTML: () => ({}) },
    };
  },

  parseHTML() {
    return [
      // Match the whole <figure>: with a rule for only the <img>, the parser
      // would turn the <figcaption> into a duplicate paragraph.
      {
        tag: 'figure[data-content-image]',
        getAttrs: (dom) => {
          if (!(dom instanceof HTMLElement)) return false;
          const img = dom.querySelector('img[data-content-image]');
          if (!img) return false;
          const figcaption = dom.querySelector('figcaption');
          return {
            src: img.getAttribute('src'),
            width: toDimension(img.getAttribute('width')),
            height: toDimension(img.getAttribute('height')),
            caption: figcaption ? (figcaption.textContent || '').trim() : '',
          };
        },
      },
      // Pages saved before captions existed: a bare <img data-content-image>.
      {
        tag: 'img[data-content-image]',
        getAttrs: (dom) => {
          if (!(dom instanceof HTMLElement)) return false;
          return { src: dom.getAttribute('src'), caption: '' };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes, node }) {
    const caption = (node.attrs.caption || '').trim();
    return [
      'figure',
      { 'data-content-image': 'true', class: 'content-image-figure' },
      [
        'img',
        mergeAttributes(HTMLAttributes, {
          alt: caption,
          'data-content-image': 'true',
          class: 'content-image',
        }),
      ],
      ...(caption
        ? [['figcaption', { class: 'content-image-caption' }, caption]]
        : []),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ContentImageView);
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
      caption: { default: '', renderHTML: () => ({}) },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'figure[data-content-video]',
        getAttrs: (dom) => {
          if (!(dom instanceof HTMLElement)) return false;
          const video = dom.querySelector('video[data-content-video]');
          if (!video) return false;
          const figcaption = dom.querySelector('figcaption');
          return {
            src: video.getAttribute('src'),
            caption: figcaption ? (figcaption.textContent || '').trim() : '',
          };
        },
      },
      {
        tag: 'video[data-content-video]',
        getAttrs: (dom) => {
          if (!(dom instanceof HTMLElement)) return false;
          return { src: dom.getAttribute('src'), caption: '' };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes, node }) {
    const caption = (node.attrs.caption || '').trim();
    return [
      'figure',
      { 'data-content-video': 'true', class: 'content-video-figure' },
      [
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
      ],
      ...(caption
        ? [['figcaption', { class: 'content-video-caption' }, caption]]
        : []),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ContentVideoView);
  },
});

// Several images or videos added together: a horizontal strip.
export const ContentGallery = Node.create({
  name: 'contentGallery',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      // Rendered as the figures in renderHTML, not as an attribute.
      items: { default: [] as GalleryItem[], renderHTML: () => ({}) },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-content-gallery]',
        getAttrs: (dom) => {
          if (!(dom instanceof HTMLElement)) return false;
          const items: GalleryItem[] = [];
          dom.querySelectorAll('figure').forEach((figure) => {
            const media = figure.querySelector('img, video');
            const src = media?.getAttribute('src');
            if (!media || !src) return;
            items.push({
              type: media.tagName === 'VIDEO' ? 'video' : 'image',
              src,
              width: toDimension(media.getAttribute('width')),
              height: toDimension(media.getAttribute('height')),
              caption: (
                figure.querySelector('figcaption')?.textContent || ''
              ).trim(),
            });
          });
          return items.length > 0 ? { items } : false;
        },
      },
    ];
  },

  renderHTML({ node }) {
    const items = (node.attrs.items || []) as GalleryItem[];
    return [
      'div',
      { 'data-content-gallery': 'true', class: 'content-gallery' },
      [
        'div',
        { class: 'content-gallery-track' },
        ...items.map((item) => {
          const caption = (item.caption || '').trim();
          const size = {
            ...(item.width ? { width: String(item.width) } : {}),
            ...(item.height ? { height: String(item.height) } : {}),
          };
          const media =
            item.type === 'video'
              ? [
                  'video',
                  {
                    src: item.src,
                    ...size,
                    class: 'content-gallery-media',
                    autoplay: '',
                    muted: '',
                    loop: '',
                    playsinline: '',
                    preload: 'metadata',
                  },
                ]
              : [
                  'img',
                  {
                    src: item.src,
                    alt: caption,
                    ...size,
                    class: 'content-gallery-media',
                  },
                ];
          return [
            'figure',
            { class: 'content-gallery-item' },
            media,
            ...(caption
              ? [['figcaption', { class: 'content-gallery-caption' }, caption]]
              : []),
          ];
        }),
      ],
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ContentGalleryView);
  },
});
