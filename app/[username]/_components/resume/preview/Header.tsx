import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ResumeDataSchemaType } from '@/lib/resume';

/**
 * Header component displaying personal information and contact details
 */
export function Header({
  header,
  picture,
}: {
  header: ResumeDataSchemaType['header'];
  picture?: string;
}) {
  return (
    <header className="mb-8 flex items-center gap-4 md:gap-6">
      <Avatar className="size-20 shrink-0 md:size-24" aria-hidden="true">
        <AvatarImage src={picture} alt={`${header.name}'s profile picture`} />
        <AvatarFallback>
          {header.name
            .split(' ')
            .map((n) => n[0])
            .join('')}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 space-y-1">
        <h1
          className="text-xl font-semibold text-theme-primary"
          id="resume-name"
        >
          {header.name}
        </h1>

        {/* Subtitle: {Role} in {Location}, {Pronouns} */}
        {(header.shortAbout || header.location || header.pronouns) && (
          <p
            className="text-pretty text-sm text-theme-secondary"
            aria-labelledby="resume-name"
          >
            {[header.shortAbout, header.location ? `in ${header.location}` : '']
              .filter(Boolean)
              .join(' ')}
            {header.pronouns ? `, ${header.pronouns}` : ''}
          </p>
        )}

        {/* Website Link */}
        {header.website && (
          <a
            href={
              header.website.startsWith('http')
                ? header.website
                : `https://${header.website}`
            }
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 block text-sm text-theme-secondary transition-colors hover:text-theme-primary"
          >
            {header.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
          </a>
        )}
      </div>
    </header>
  );
}
