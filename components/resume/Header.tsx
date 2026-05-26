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
  const prefixUrl = (stringToFix?: string) => {
    if (!stringToFix) return undefined;
    const url = stringToFix.trim();
    return url.startsWith('http') ? url : `https://${url}`;
  };

  const socialLinks = useMemo(() => {
    const formatSocialUrl = (
      url: string | undefined,
      platform: 'github' | 'twitter' | 'linkedin',
    ) => {
      if (!url) return undefined;

      const cleanUrl = url.trim();
      if (cleanUrl.startsWith('http')) return cleanUrl;

      // Handle twitter.com and x.com variations
      if (
        platform === 'twitter' &&
        (cleanUrl.startsWith('twitter.com') || cleanUrl.startsWith('x.com'))
      ) {
        return `https://${cleanUrl}`;
      }

      const platformUrls = {
        github: 'github.com',
        twitter: 'x.com',
        linkedin: 'linkedin.com/in',
      } as const;

      return `https://${platformUrls[platform]}/${cleanUrl}`;
    };

    return {
      website: prefixUrl(header.contacts.website),
      github: formatSocialUrl(header.contacts.github, 'github'),
      twitter: formatSocialUrl(header.contacts.twitter, 'twitter'),
      linkedin: formatSocialUrl(header.contacts.linkedin, 'linkedin'),
    };
  }, [
    header.contacts.website,
    header.contacts.github,
    header.contacts.twitter,
    header.contacts.linkedin,
  ]);

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

        <div
          className="flex gap-x-2 pt-1 font-mono text-sm print:hidden"
          role="list"
          aria-label="Contact links"
        >
          {socialLinks.website && (
            <a 
              href={socialLinks.website} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              {socialLinks.website.replace(/^https?:\/\//, '')}
            </a>
          )}
        </div>

        <div
          className="hidden gap-x-2 font-mono text-sm text-design-resume print:flex print:text-[12px]"
          aria-label="Print contact information"
        >
          {socialLinks.website && (
            <>
              <a
                className="underline hover:text-foreground/70"
                href={socialLinks.website}
              >
                {new URL(socialLinks.website).hostname}
              </a>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
