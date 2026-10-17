import { Node, mergeAttributes, ReactNodeViewRenderer } from '@tiptap/react';
import { ContentImageView, ContentVideoView } from './tiptap-media-views';

export const ContentImage = Node.create({
  name: 'contentImage',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      src: { default: null },
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
