import { Fragment } from 'react';
import { cn } from '@/lib/utils';
import { parseStatusText, type Inline } from '@/lib/statusText';

function Inlines({ parts }: { parts: Inline[] }) {
  return (
    <>
      {parts.map((part, i) =>
        part.type === 'link' ? (
          <a
            key={i}
            href={part.href}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="break-all underline underline-offset-4 hover:text-theme-primary"
            onClick={(event) => event.stopPropagation()}
          >
            {part.text}
          </a>
        ) : (
          <Fragment key={i}>{part.text}</Fragment>
        ),
      )}
    </>
  );
}

/**
 * A status as the original showed it: "* item" and "1. item" lines become lists and
 * web addresses become links. Styling comes from the caller's className.
 */
export function StatusText({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const blocks = parseStatusText(text);
  return (
    <div className={cn('flex flex-col gap-2 break-words', className)}>
      {blocks.map((block, i) => {
        if (block.type === 'bullets') {
          return (
            <ul key={i} className="list-disc pl-5">
              {block.items.map((item, j) => (
                <li key={j}>
                  <Inlines parts={item} />
                </li>
              ))}
            </ul>
          );
        }
        if (block.type === 'numbers') {
          return (
            <ol key={i} start={block.start} className="list-decimal pl-5">
              {block.items.map((item, j) => (
                <li key={j}>
                  <Inlines parts={item} />
                </li>
              ))}
            </ol>
          );
        }
        return (
          <p key={i}>
            {block.lines.map((line, j) => (
              <Fragment key={j}>
                {j > 0 && <br />}
                <Inlines parts={line} />
              </Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
}
