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
      // Rendered manually in renderHTML below — as the <img alt> value
      // and an optional <figcaption> — not as a raw `caption="..."`
      // attribute, so it's opted out of the default attribute-to-HTML
      // mapping.
      caption: { default: '', renderHTML: () => ({}) },
    };
  },

  parseHTML() {
    return [
      // New format: <figure data-content-image><img data-content-image>
      // [<figcaption>...</figcaption>]</figure>. Matching the *figure*,
      // not the <img>, is deliberate: if only the <img> (a void element)
      // had a rule, ProseMirror's parser would treat the sibling
      // <figcaption> as unmatched and walk into its text, auto-wrapping
      // it into a phantom paragraph right after the image — duplicating
      // the caption. Matching the figure consumes the whole subtree as
      // one unit and avoids that.
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
      // Legacy format: bare <img data-content-image>, no figure/figcaption
      // — every page persisted before captions existed. Must keep
      // matching so old pages still load correctly for editing.
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
