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
        className="mb-6 text-sm font-bold text-theme-primary print:mb-4"
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
            className="flex flex-col gap-0 sm:flex-row sm:gap-[36px] print:mb-6"
          >
            {/* Left column: Platform */}
            <div className="shrink-0 pt-0.5 text-sm text-theme-secondary sm:w-[94px]">
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
                  <span className="text-sm font-semibold">
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
