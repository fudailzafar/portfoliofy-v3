import Link from 'next/link';
import { Footer } from '@/components/layout/Footer';

export default function FAQPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-[#121212]">
      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-20 font-sans">
        <h1 className="mb-12 text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Frequently Asked Questions
        </h1>

        <div className="space-y-8 text-[15px] leading-relaxed text-gray-700 dark:text-gray-300">
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              What do you call this platform?
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              It&apos;s simply referred to as Portfoliofy. For example you could say,
              &quot;I just created my Portfoliofy account!&quot;.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              Who&apos;s behind Portfoliofy?
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Just me,{' '}
              <Link href="/fudail" className="text-gray-900 hover:underline dark:text-gray-100">
                Fudail
              </Link>
              .
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              Why did you build Portfoliofy?
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Personally, I wanted an easy to update page where I could list
              some projects, work history, and other bits that might make me
              sound competent. Something easy to share, less garish than
              LinkedIn, and more dynamic than a static PDF. Non-visual, more
              akin to a text oriented personal website. Something that wasn&apos;t
              just a one off page, where I could bring in friends and
              collaborators, and profiles could be navigated from one to the
              other like a blogroll.
            </p>
            <p className="pt-2 text-gray-600 dark:text-gray-400">
              I thought this might be useful, so I&apos;m putting it out there to see
              if it is.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              Who should use Portfoliofy?
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              If the above resonates with you, you should try using Portfoliofy.
              I&apos;m curious to see who might find it useful (or not).
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              Where can I get updates on Portfoliofy?
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Follow @fudailzafar on Twitter and on LinkedIn for updates.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              I&apos;d like to report a profile for inappropriate content or
              harassment, who can I reach out to?
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Please reach out to fudail.zafar@gmail.com. We take all reports
              very seriously.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              I have more questions, who should I call?
            </h3>
            <p className="text-gray-600 dark:text-gray-400">Email me, fudail.zafar@gmail.com.</p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
