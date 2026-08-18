import { Footer } from '@/components/layout/Footer';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Support',
};

export default function SupportPage() {
  return (
    <div className="flex min-h-screen flex-col bg-surface-1">
      <main className="mx-auto w-full max-w-[540px] flex-1 py-[72px] font-sans">
        <h1 className="mb-8 text-[20px] font-medium text-content-primary">
          Support
        </h1>

        <div className="space-y-8 text-[14px] font-normal leading-relaxed text-content-secondary">
          <div>
            <h3 className="text-[14px] text-content-primary">
              How does the status feature work?
            </h3>
            <p>
              The status feature serves as a lightweight way of letting people
              know what you&apos;re up to. For example if you&apos;re a
              freelancer you might use it to communicate your upcoming
              availability.
            </p>
            <p className="mt-4">
              To set a status, navigate to your profile and hover over your
              profile photo. Click the &apos;Set status&apos; button that
              appears. Once you clear a status it&apos;s gone forever.
            </p>
          </div>

          <div>
            <h3 className="text-[14px] text-content-primary">
              How do I edit my profile?
            </h3>
            <p>
              Navigate to your profile and click the pencil icon in the bottom
              left corner of the screen.
            </p>
          </div>

          <div>
            <h3 className="text-[14px] text-content-primary">
              How do I tag other people in my profile?
            </h3>
            <p>
              When adding a new item to your profile, use the
              &apos;collaborators&apos; field to search for other people to tag.
              If you&apos;re adding a new education item the field will be
              titled &apos;classmates&apos;. If you&apos;re adding a new work
              experience item the field will be titled &apos;coworkers&apos;.
            </p>
          </div>

          <div>
            <h3 className="text-[14px] text-content-primary">
              How do I reorder sections?
            </h3>
            <p>
              Navigate to your profile and click the pencil icon in the bottom
              left corner of the screen. Drag the sections in the left hand
              column of the profile editor up or down using the drag icon in
              each row.
            </p>
          </div>

          <div>
            <h3 className="text-[14px] text-content-primary">
              How do I reorder items published in the same year?
            </h3>
            <p>
              Items published in the same year can be reordered using the
              &apos;Move up&apos; and &apos;Move down&apos; buttons located to
              the right of the &apos;Edit&apos; and &apos;Delete&apos; buttons
              in the profile editor. Contact items can also be reordered this
              way.
            </p>
          </div>

          <div>
            <h3 className="text-[14px] text-content-primary">
              Does Portfoliofy support printing?
            </h3>
            <p>
              Yes, Portfoliofy features print optimized profiles. When you print
              your profile it will be typographically optimized for size,
              layout, and legibility.
            </p>
          </div>

          <div>
            <h3 className="text-[14px] text-content-primary">
              How can I hide certain sections when printing my portfolio?
            </h3>
            <p>
              Open the profile editor and click on the &apos;Print&apos; tab.
              From here you can choose which sections are included in your
              printed portfolio. Toggling these sections will have no affect on
              your profile when viewed on the web.
            </p>
          </div>

          <div>
            <h3 className="text-[14px] text-content-primary">
              How do I change my email?
            </h3>
            <p>
              Navigate to your profile and click the pencil icon in the bottom
              left corner of the screen. Click on &apos;Settings&apos; &gt;
              &apos;Email address&apos; &gt; &apos;Change email&apos;. Enter
              your updated email and click &apos;Save&apos;. If prompted, you
              may have to re-authenticate by logging out then back in before you
              can change your email.
            </p>
          </div>

          <div>
            <h3 className="text-[14px] text-content-primary">
              How do I turn off email notifications?
            </h3>
            <p>
              We only send you email notifications when you are tagged in
              someone else&apos;s profile. To disable this navigate to your
              profile and click the pencil icon in the bottom left corner of the
              screen. Click on &apos;Settings&apos; &gt; &apos;Email
              notifications&apos; &gt; &apos;Turn off&apos;.
            </p>
          </div>

          <div>
            <h3 className="text-[14px] text-content-primary">
              How do I delete my account?
            </h3>
            <p>
              Navigate to your profile and click the pencil icon in the bottom
              left corner of the screen. Click on &apos;Settings&apos; &gt;
              &apos;Account&apos; &gt; &apos;Delete account&apos;. You will be
              asked to confirm by typing in your username. If prompted, you may
              have to re-authenticate by logging out then back in before you can
              delete your account.
            </p>
          </div>

          <div>
            <h3 className="text-[14px] text-content-primary">
              I&apos;d like to report a profile for inappropriate content or
              harassment, who can I reach out to?
            </h3>
            <p>
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
            <p>
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
