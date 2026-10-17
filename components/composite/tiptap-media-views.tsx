'use client';

import { NodeViewWrapper, type ReactNodeViewProps } from '@tiptap/react';
import type { GalleryItem } from './tiptap-media';

const CAPTION_INPUT_CLASSES =
  'mt-2 block w-full border-0 bg-transparent p-0 text-[12px] font-normal text-content-muted outline-none placeholder:text-content-muted';

export function ContentImageView({
  node,
  updateAttributes,
  editor,
}: ReactNodeViewProps) {
  const { src, caption, width, height } = node.attrs as {
    src: string;
    caption: string;
    width: number | null;
    height: number | null;
  };

  return (
    <NodeViewWrapper as="figure" className="content-image-figure">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={caption}
        width={width ?? undefined}
        height={height ?? undefined}
        className="content-image"
        draggable
        data-drag-handle
        contentEditable={false}
      />
      <input
        type="text"
        value={caption}
        onChange={(e) => updateAttributes({ caption: e.target.value })}
        placeholder="Write a caption..."
        disabled={!editor.isEditable}
        className={CAPTION_INPUT_CLASSES}
      />
    </NodeViewWrapper>
  );
}

export function ContentVideoView({
  node,
  updateAttributes,
  editor,
}: ReactNodeViewProps) {
  const { src, caption } = node.attrs as { src: string; caption: string };

  return (
    <NodeViewWrapper as="figure" className="content-video-figure">
      <video
        src={src}
        className="content-video"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        draggable
        data-drag-handle
        contentEditable={false}
      />
      <input
        type="text"
        value={caption}
        onChange={(e) => updateAttributes({ caption: e.target.value })}
        placeholder="Write a caption..."
        disabled={!editor.isEditable}
        className={CAPTION_INPUT_CLASSES}
      />
    </NodeViewWrapper>
  );
}

export function ContentGalleryView({
  node,
  updateAttributes,
  editor,
}: ReactNodeViewProps) {
  const items = (node.attrs.items || []) as GalleryItem[];

  const setCaption = (index: number, caption: string) =>
    updateAttributes({
      items: items.map((item, i) =>
        i === index ? { ...item, caption } : item,
      ),
    });

  return (
    <NodeViewWrapper className="content-gallery" data-drag-handle>
      <div className="content-gallery-track" contentEditable={false}>
        {items.map((item, index) => (
          <figure key={`${item.src}-${index}`} className="content-gallery-item">
            {item.type === 'video' ? (
              <video
                src={item.src}
                width={item.width ?? undefined}
                height={item.height ?? undefined}
                className="content-gallery-media"
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.src}
                alt={item.caption}
                width={item.width ?? undefined}
                height={item.height ?? undefined}
                className="content-gallery-media"
                draggable={false}
              />
            )}
            <input
              type="text"
              value={item.caption}
              onChange={(e) => setCaption(index, e.target.value)}
              placeholder="Write a caption..."
              disabled={!editor.isEditable}
              className={CAPTION_INPUT_CLASSES}
            />
          </figure>
        ))}
      </div>
    </NodeViewWrapper>
  );
}
