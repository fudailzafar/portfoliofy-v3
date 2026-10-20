import React, { useMemo } from 'react';
import { ResumeData } from '@/lib/server/dbActions';
import {
  AttachmentSchemaType,
  estimateReadMinutes,
  isRedactedPage,
} from '@/lib/resume';
import Link from 'next/link';
import { Lock } from 'lucide-react';

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
      .filter((p) => !p.hidden && !p.isBlurred)
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

  // Year groups 60px apart, posts 36px apart; titles line up
  // with the profile's content column (94px date column + 36px gap); from
  // 480px down the date moves under the title and rows indent 16px.
  return (
    <div className="flex flex-col gap-[60px]">
      {groupedByYear.map(({ year, pages: yearPages }) => (
        <div key={year} className="flex flex-col gap-3">
          <h2 className="text-[length:var(--type-size)] font-normal tabular-nums leading-[var(--line-height)] text-theme-primary">
            {year}
          </h2>

          <div className="flex flex-col gap-9">
            {yearPages.map((page) => {
              const { parsedDate } = page;
              const href = isPersonalDomainView
                ? `/${page.slug || page.id}`
                : `/${username}/${page.slug || page.id}`;
              const underline =
                'hover:underline hover:decoration-1 hover:underline-offset-[3px]';
              const dateLabel = parsedDate
                ? parsedDate.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })
                : '';
              const redacted = isRedactedPage(page);
              const readLabel = redacted
                ? 'Enter password to view'
                : `${estimateReadMinutes(page.content || '')} min read`;
              return (
                <div
                  key={page.id}
                  className="flex items-center gap-6 max-[480px]:ml-4"
                >
                  {/* Date and title share a grid so the date sits on the
                      title's first line, whatever the title's height. */}
                  <div className="grid min-w-0 flex-1 grid-cols-[106px_minmax(0,1fr)] gap-x-6 max-[480px]:grid-cols-1">
                    <Link
                      href={href}
                      className={`w-fit text-[length:var(--type-size)] tabular-nums leading-[var(--line-height)] text-theme-muted max-[480px]:hidden ${underline}`}
                    >
                      {dateLabel}
                    </Link>

                    <div className="flex min-w-0 flex-col">
                      <Link
                        href={href}
                        className={`line-clamp-2 w-fit text-[length:var(--type-size)] leading-[var(--line-height)] text-theme-primary ${underline}`}
                      >
                        {redacted
                          ? 'This page is private'
                          : page.title || 'Untitled'}
                        {page.passwordProtected && !redacted && (
                          <Lock
                            aria-label="Password protected"
                            className="relative -top-px ml-1.5 inline h-3.5 w-3.5 text-theme-muted"
                          />
                        )}
                      </Link>
                      <Link
                        href={href}
                        className={`w-fit text-[length:var(--type-size)] tabular-nums leading-[var(--line-height)] text-theme-muted ${underline}`}
                      >
                        {dateLabel && (
                          <span className="hidden max-[480px]:inline">
                            {dateLabel}&nbsp;·&nbsp;
                          </span>
                        )}
                        {readLabel}
                      </Link>
                    </div>
                  </div>

                  {/* Thumbnail: soft fill and a faint inner border, both from
                      the theme (globals.css). */}
                  <Link
                    href={href}
                    tabIndex={-1}
                    aria-hidden="true"
                    className="relative flex h-[90px] w-[30%] min-w-[40px] max-w-[152px] shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[var(--theme-thumb-bg)] after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:border after:border-[var(--theme-faint-border)] max-[480px]:w-[37.5%]"
                  >
                    {redacted && <Lock className="h-4 w-4 text-theme-muted" />}
                    {page.url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={page.url}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    )}
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
