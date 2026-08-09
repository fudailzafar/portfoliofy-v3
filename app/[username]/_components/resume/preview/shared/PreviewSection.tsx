import React from 'react';

export function PreviewSection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-9 print:mb-8">
      <h2
        className="mb-6 text-sm font-bold text-theme-primary print:mb-4"
        id={id}
      >
        {title}
      </h2>
      <div
        className="ml-6 flex flex-col gap-8 sm:ml-0"
        role="feed"
        aria-labelledby={id}
      >
        {children}
      </div>
    </section>
  );
}
