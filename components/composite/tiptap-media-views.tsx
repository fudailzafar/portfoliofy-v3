'use client';

import { NodeViewWrapper, type ReactNodeViewProps } from '@tiptap/react';

const CAPTION_INPUT_CLASSES =
  'mt-2 block w-full border-0 bg-transparent p-0 text-[12px] font-normal text-content-muted outline-none placeholder:text-content-muted';

export function ContentImageView({
  node,
  updateAttributes,
  editor,
}: ReactNodeViewProps) {
  const { src, caption } = node.attrs as { src: string; caption: string };

  return (
    <NodeViewWrapper as="figure" className="content-image-figure">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={caption}
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
