import React, { useMemo } from 'react';
import { ResumeData } from '@/lib/server/dbActions';
import { AttachmentSchemaType, estimateReadMinutes } from '@/lib/resume';
import Link from 'next/link';

export function PublicWritingList({
  resume,
  username,
  isPersonalDomainView = false,
}: {
  resume: ResumeData;
  username: string;
  isPersonalDomainView?: boolean;
}) {
  const parseDate = (dateStr?: string) => {
    if (!dateStr) return null;
    const parsed = new Date(dateStr);
    return isNaN(parsed.getTime()) ? null : parsed;
  };

  const pages = useMemo(() => {
    if (!resume?.pages) return [];
    return resume.pages
      .filter((p) => !p.hidden)
      .map((p) => ({ ...p, parsedDate: parseDate(p.createdAt) }))
      .sort(
        (a, b) =>
          (b.parsedDate?.getTime() || 0) - (a.parsedDate?.getTime() || 0),
      );
  }, [resume]);

  const groupedByYear = useMemo(() => {
    const groups: Array<{
      year: string;
      pages: (AttachmentSchemaType & { parsedDate: Date | null })[];
    }> = [];
    pages.forEach((page) => {
      const year = page.parsedDate
        ? page.parsedDate.getFullYear().toString()
        : 'Undated';
      const lastGroup = groups[groups.length - 1];
      if (lastGroup && lastGroup.year === year) {
        lastGroup.pages.push(page);
      } else {
        groups.push({ year, pages: [page] });
      }
    });
    return groups;
  }, [pages]);

  if (pages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-theme-secondary">
        <p className="text-sm">No published pages found.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      {groupedByYear.map(({ year, pages: yearPages }) => (
        <div key={year} className="flex flex-col gap-6">
          <h2 className="text-[length:var(--type-size)] font-bold leading-[var(--line-height)] text-theme-primary">
            {year}
          </h2>

          <div className="flex flex-col gap-8">
            {yearPages.map((page) => {
              const { parsedDate } = page;
              const href = isPersonalDomainView
                ? `/${page.slug || page.id}`
                : `/${username}/${page.slug || page.id}`;
              const underline =
                'hover:underline hover:decoration-1 hover:underline-offset-2';
              const dateLabel = parsedDate
                ? parsedDate.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })
                : '';
              const readLabel = `${estimateReadMinutes(page.content || '')} min read`;
              return (
                <div key={page.id} className="flex items-center gap-4 sm:gap-8">
                  {/* Date gutter — desktop/tablet only. On mobile the date
                      folds into the "{date} · {read time}" line below the
                      title instead, matching read.cv's own mobile layout
                      (no separate date column eating into the same left
                      indentation the About tab content uses). */}
                  <Link
                    href={href}
                    className={`hidden w-14 shrink-0 text-[length:var(--type-size)] leading-[var(--line-height)] text-theme-secondary sm:block sm:w-20 ${underline}`}
                  >
                    {dateLabel}
                  </Link>

                  <div className="flex flex-1 items-center justify-between gap-4">
                    {/* pl-6 indents the title/date block relative to the year
                        header on mobile (no separate date gutter there to do
                        it visually) — this also naturally closes up the gap
                        to the thumbnail, since the thumbnail stays anchored
                        to the row's right edge via justify-between. */}
                    <div className="flex flex-col gap-1 pl-6 sm:pl-0">
                      <Link
                        href={href}
                        className={`text-[length:var(--type-size)] leading-[var(--line-height)] text-theme-primary ${underline}`}
                      >
                        {page.title || 'Untitled'}
                      </Link>
                      <Link
                        href={href}
                        className={`hidden text-[length:var(--type-size)] leading-[var(--line-height)] text-theme-secondary sm:block ${underline}`}
                      >
                        {readLabel}
                      </Link>
                      <Link
                        href={href}
                        className={`text-[length:var(--type-size)] leading-[var(--line-height)] text-theme-secondary sm:hidden ${underline}`}
                      >
                        {dateLabel} · {readLabel}
                      </Link>
                    </div>

                    <Link
                      href={href}
                      className="h-[90px] w-[115px] shrink-0 overflow-hidden rounded-xl border border-theme-border bg-[color-mix(in_srgb,var(--theme-border)_40%,transparent)] sm:w-[152px]"
                    >
                      {page.url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={page.url}
                          alt="Thumbnail"
                          className="h-full w-full object-cover"
                        />
                      )}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
