import {
  GlobeIcon,
  MailIcon,
  PhoneIcon,
  Github,
  Twitter,
  Linkedin,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ResumeDataSchemaType } from '@/lib/resume';
import { useMemo } from 'react';

interface SocialButtonProps {
  href: string;
  icon: React.ElementType;
  label: string;
}

function SocialButton({ href, icon: Icon, label }: SocialButtonProps) {
  return (
    <Button className="size-8" variant="outline" size="icon" asChild>
      <a
        href={
          href.startsWith('mailto:') || href.startsWith('tel:')
            ? href
            : `${href}${href.includes('?') ? '&' : '?'}`
        }
        aria-label={label}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Icon className="size-4" aria-hidden="true" />
      </a>
    </Button>
  );
}

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
    <header className="flex items-center gap-4 md:gap-6 mb-8">
      <Avatar className="size-20 md:size-28 shrink-0" aria-hidden="true">
        <AvatarImage src={picture} alt={`${header.name}'s profile picture`} />
        <AvatarFallback>
          {header.name
            .split(' ')
            .map((n) => n[0])
            .join('')}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 space-y-1">
        <h1 className="text-2xl md:text-[28px] font-semibold text-gray-900 font-mono" id="resume-name">
          {header.name}
        </h1>
        
        {/* Subtitle: {Role} in {Location}, {Pronouns} */}
        {(header.shortAbout || header.location || header.pronouns) && (
          <p
            className="text-pretty font-mono text-sm text-gray-500"
            aria-labelledby="resume-name"
          >
            {[
              header.shortAbout,
              header.location ? `in ${header.location}` : '',
            ]
              .filter(Boolean)
              .join(' ')}
            {header.pronouns ? `, (${header.pronouns})` : ''}
          </p>
        )}
        
        {/* Website Link */}
        {header.website && (
          <a
            href={header.website.startsWith('http') ? header.website : `https://${header.website}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm font-mono text-gray-500 hover:text-gray-900 transition-colors mt-1"
          >
            {header.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
          </a>
        )}
      </div>
    </header>
  );
}
