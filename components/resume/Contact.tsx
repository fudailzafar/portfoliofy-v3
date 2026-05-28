import { Section } from '@/components/ui/section';
import { ResumeDataSchemaType } from '@/lib/resume';
import { ArrowUpRight } from 'lucide-react';
import { extractUsername, buildContactUrl } from '@/utils/extractUsername';

export function Contact({
  contacts,
}: {
  contacts?: ResumeDataSchemaType['contacts'];
}) {
  if (!contacts || contacts.length === 0) {
    return null;
  }

  return (
    <section className="mb-12 print:mb-8">
      <h2 
        className="text-lg font-bold mb-8 print:mb-4 text-theme-primary" 
        id="contact-section"
      >
        Contact
      </h2>
      <div
        className="flex flex-col gap-8"
        role="feed"
        aria-labelledby="contact-section"
      >
        {contacts.map((contact) => (
          <div
            key={contact.id || contact.platform}
            className="flex flex-col sm:flex-row gap-4 sm:gap-12 print:mb-6"
          >
            {/* Left column: Platform */}
            <div className="sm:w-32 shrink-0 text-theme-secondary  text-sm pt-0.5">
              {contact.platform}
            </div>

            {/* Right column: Content */}
            <div className="flex-1 flex flex-col justify-start items-start">
              <a 
                href={buildContactUrl(contact.link, contact.platform)}
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:underline inline-block group text-theme-primary"
              >
                <span className="text-base font-semibold">
                  {extractUsername(contact.link, contact.platform)}
                  <ArrowUpRight className="inline-block ml-1 w-4 h-4 relative -top-0.5" />
                </span>
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
