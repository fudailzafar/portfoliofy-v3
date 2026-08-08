import { ResumeDataSchemaType } from '@/lib/resume';
import { AttachmentsPreview } from './AttachmentsPreview';
import { ArrowUpRight } from 'lucide-react';

export function Writing({
  writing,
}: {
  writing?: ResumeDataSchemaType['writing'];
}) {
  const visibleWriting = writing?.filter((piece) => !piece.hidden);
  if (!visibleWriting || visibleWriting.length === 0) return null;

  return (
    <section className="mb-12 print:mb-8">
      <h2
        className="mb-8 text-sm font-bold text-theme-primary print:mb-4"
        id="writing-section"
      >
        Writing
      </h2>
      <div
        className="ml-6 flex flex-col gap-8 sm:ml-0"
        role="feed"
        aria-labelledby="writing-section"
      >
        {visibleWriting.map((piece) => (
          <div
            key={piece.id || piece.title}
            className="flex flex-col gap-1 sm:flex-row sm:gap-[36px] print:mb-6"
          >
            {/* Left column: Year */}
            <div className="shrink-0 pt-0.5 text-sm text-theme-secondary sm:w-[94px]">
              {piece.year}
            </div>

            {/* Right column: Content */}
            <div className="flex flex-1 flex-col items-start justify-start">
              <div className="group flex items-center gap-1">
                {piece.link ? (
                  <a
                    href={
                      piece.link.startsWith('http')
                        ? piece.link
                        : `https://${piece.link}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-theme-primary hover:underline hover:underline-offset-4"
                  >
                    <span className="text-sm font-semibold">
                      {piece.title}
                      {piece.publication ? `, ${piece.publication}` : ''}
                      <ArrowUpRight className="relative -top-0.5 ml-1 inline-block h-4 w-4" />
                    </span>
                  </a>
                ) : (
                  <p className="text-sm font-semibold text-theme-primary">
                    {piece.title}
                    {piece.publication ? `, ${piece.publication}` : ''}
                  </p>
                )}
              </div>

              {piece.description && piece.description !== '<p></p>' && (
                <div
                  className="prose prose-sm prose-ul:pl-0 prose-ol:pl-0 prose-li:pl-0 max-w-none text-sm text-theme-secondary prose-p:my-1 prose-p:text-theme-secondary prose-strong:text-theme-primary prose-ul:my-1 prose-ul:text-theme-secondary prose-li:text-theme-secondary"
                  dangerouslySetInnerHTML={{ __html: piece.description }}
                />
              )}
              <AttachmentsPreview attachments={piece.attachments} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
