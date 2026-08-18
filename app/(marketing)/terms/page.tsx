import { Footer } from '@/components/layout/Footer';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
};

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-surface-1">
      <main className="mx-auto w-full max-w-[540px] flex-1 py-[72px] font-sans">
        <h1 className="text-[20px] font-medium text-content-primary">
          Terms of Service
        </h1>
        <p className="mb-4 text-[14px] text-content-secondary">
          Effective May 27, 2026
        </p>

        <div className="space-y-8 text-[14px] font-normal leading-relaxed text-content-secondary">
          <p>
            When you use Portfoliofy (&quot;the service&quot;), now and in the
            future, you are agreeing to the terms of service as outlined in this
            document.
          </p>

          <section className="space-y-4">
            <h2 className="text-[14px] font-medium text-content-primary">
              Basics
            </h2>
            <ul className="list-disc space-y-4 pl-5">
              <li>
                Your use of the service is at your sole risk. We provide the
                service on an &apos;as is&apos; and &apos;as available&apos;
                basis.
              </li>
              <li>
                You are responsible for all the content posted and created under
                your account.
              </li>
              <li>You must be 13 years of age or older.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-[14px] font-medium text-content-primary">
              Conduct
            </h2>
            <ul className="list-disc space-y-4 pl-5">
              <li>
                We do not tolerate harassment or hate speech of any kind. If
                your account is found to be in violation of this we will remove
                it.
              </li>
              <li>
                We do not allow sexual or adult content of any kind. If your
                account is found to be in violation of this we will remove it.
              </li>
              <li>
                Our goal is to build a safe and welcoming environment. Any
                conduct we deem outside of this goal is subject to moderation or
                removal.
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-[14px] font-medium text-content-primary">
              Termination
            </h2>
            <p>
              We reserve the right, at any time and without prior notice, to
              remove or disable any content or account for any reason or no
              reason.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-[14px] font-medium text-content-primary">
              Legal
            </h2>
            <p>
              To the fullest extent of the law we assume no responsibility for
              the following:
            </p>
            <ul className="list-disc space-y-4 pl-5">
              <li>Any errors or inaccuracy of content.</li>
              <li>
                Any personal injury or property damage resulting from our
                services.
              </li>
              <li>
                Any unauthorized access to our servers or data or personal
                information or financial information stored on said servers.
              </li>
              <li>
                Any interruption, loss of data, or termination of services.
              </li>
              <li>
                Any bugs, viruses, or trojan horses which may be transmitted
                through our service or externally linked websites and services.
              </li>
            </ul>
            <p>
              All content posted on the service must comply with U.S. copyright
              law. We make no representation that the content in the service are
              appropriate or available for use in other locations, and access to
              them from territories where their content or use is illegal is
              prohibited.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
