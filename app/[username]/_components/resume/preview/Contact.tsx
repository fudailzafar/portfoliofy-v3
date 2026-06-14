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
    <section className="mb-12 print:mb-8">
      <h2
        className="mb-8 text-sm font-bold text-theme-primary print:mb-4"
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
            className="flex flex-col gap-0 sm:flex-row sm:gap-12 print:mb-6"
          >
            {/* Left column: Platform */}
            <div className="shrink-0 pt-0.5 text-sm text-theme-secondary sm:w-32">
              {contact.platform}
            </div>

            {/* Right column: Content */}
            <div className="flex flex-1 flex-col items-start justify-start">
              <a
                href={buildContactUrl(contact.link, contact.platform)}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-block text-theme-primary hover:underline hover:underline-offset-4"
              >
                <span className="text-sm font-semibold">
                  {extractUsername(contact.link, contact.platform)}
                  <ArrowUpRight className="relative -top-0.5 ml-1 inline-block h-4 w-4" />
                </span>
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
