import Link from 'next/link';
import { Footer } from '@/components/layout/Footer';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FAQs',
};

export default function FAQPage() {
  return (
    <div className="flex min-h-screen flex-col bg-surface-1">
      <main className="mx-auto w-full max-w-[540px] flex-1 py-[72px] font-sans">
        <h1 className="mb-8 text-[20px] font-medium text-content-primary">
          FAQs
        </h1>

        <div className="space-y-8 text-[14px] font-normal leading-relaxed text-content-secondary">
          <div>
            <h3 className="text-[14px] text-content-primary">
              What do you call this platform?
            </h3>
            <p className="text-content-secondary">
              It&apos;s simply referred to as Portfoliofy. For example you could
              say, &quot;I just created my Portfoliofy account!&quot;.
            </p>
          </div>

          <div>
            <h3 className="text-[14px] text-content-primary">
              Who&apos;s behind Portfoliofy?
            </h3>
            <p className="text-content-secondary">
              Just me,{' '}
              <Link href="/fudail" className="underline underline-offset-2">
                Fudail
              </Link>
              .
            </p>
          </div>

          <div>
            <h3 className="text-[14px] text-content-primary">
              Why did you build Portfoliofy?
            </h3>
            <p className="text-content-secondary">
              Personally, I wanted an easy to update page where I could list
              some projects, work history, and other bits that might make me
              sound competent. Something easy to share, less garish than
              LinkedIn, and more dynamic than a static PDF. Non-visual, more
              akin to a text oriented personal website. Something that
              wasn&apos;t just a one off page, where I could bring in friends
              and collaborators, and profiles could be navigated from one to the
              other like a blogroll.
            </p>
            <p className="pt-2 text-content-secondary">
              I thought this might be useful, so I&apos;m putting it out there
              to see if it is.
            </p>
          </div>

          <div>
            <h3 className="text-[14px] text-content-primary">
              Who should use Portfoliofy?
            </h3>
            <p className="text-content-secondary">
              If the above resonates with you, you should try using Portfoliofy.
              I&apos;m curious to see who might find it useful (or not).
            </p>
          </div>

          <div>
            <h3 className="text-[14px] text-content-primary">
              Where can I get updates on Portfoliofy?
            </h3>
            <p className="text-content-secondary">
              Follow{' '}
              <a
                href="https://twitter.com/fudailzafar"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-[3px]"
              >
                @fudailzafar
              </a>{' '}
              on Twitter or{' '}
              <a
                href="https://linkedin.com/in/fudailzafar"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-[3px]"
              >
                @fudailzafar
              </a>{' '}
              on LinkedIn for updates.
            </p>
          </div>

          <div>
            <h3 className="text-[14px] text-content-primary">
              I&apos;d like to report a profile for inappropriate content or
              harassment, who can I reach out to?
            </h3>
            <p className="text-content-secondary">
              Please reach out to{' '}
              <a
                href="mailto:fudail.zafar@gmail.com"
                className="underline underline-offset-[3px]"
              >
                fudail.zafar@gmail.com
              </a>
              . We take all reports very seriously.
            </p>
          </div>

          <div>
            <h3 className="text-[14px] text-content-primary">
              I have more questions, who should I call?
            </h3>
            <p className="text-content-secondary">
              Email me,{' '}
              <a
                href="mailto:fudail.zafar@gmail.com"
                className="underline underline-offset-[3px]"
              >
                fudail.zafar@gmail.com
              </a>
              .
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
