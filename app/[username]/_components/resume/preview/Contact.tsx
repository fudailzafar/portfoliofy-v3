import { ResumeDataSchemaType } from '@/lib/resume';
import { ArrowUpRight } from 'lucide-react';
import { extractUsername, buildContactUrl } from '@/utils/extractUsername';

export function Contact({
  contacts,
}: {
  contacts?: ResumeDataSchemaType['contacts'];
}) {
  const visibleContacts = contacts?.filter((contact) => !contact.hidden);

  if (!visibleContacts || visibleContacts.length === 0) {
    return null;
  }

  return (
    <section className="mb-9 print:mb-8">
      <h2
        className="mb-6 text-[length:var(--type-size)] font-bold leading-[var(--line-height)] text-theme-primary print:mb-4"
        id="contact-section"
      >
        Contact
      </h2>
      <div
        className="ml-6 flex flex-col gap-6 sm:ml-0 sm:gap-3"
        role="feed"
        aria-labelledby="contact-section"
      >
        {visibleContacts.map((contact) => (
          <div
            key={contact.id || contact.platform}
            className="flex flex-col gap-0 min-[481px]:flex-row min-[481px]:gap-[36px] print:mb-6"
          >
            {/* Left column: Platform */}
            <div className="shrink-0 pt-0.5 text-[length:var(--secondary-type-size)] leading-[var(--line-height)] text-theme-muted min-[481px]:w-[94px]">
              {contact.platform}
            </div>

            {/* Right column: Content */}
            <div className="flex flex-1 flex-col items-start justify-start">
              <div className="group">
                <a
                  href={buildContactUrl(contact.link, contact.platform)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-theme-primary hover:underline hover:decoration-1 hover:underline-offset-2"
                >
                  <span className="text-[length:var(--type-size)] font-semibold leading-[var(--line-height)]">
                    {extractUsername(contact.link, contact.platform)}
                  </span>
                </a>
                <ArrowUpRight className="ml-0.5 inline-block h-3 w-3 shrink-0 align-baseline text-theme-primary" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
